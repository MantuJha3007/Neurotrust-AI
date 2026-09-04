export interface ApiClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
}

export interface ApiRequestOptions
  extends RequestInit {
  timeoutMs?: number;
}

export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;

  constructor(
    message: string,
    status: number,
    statusText: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
  }
}

const DEFAULT_TIMEOUT_MS = 10_000;

function normalizeBaseUrl(
  baseUrl: string,
): string {
  return baseUrl.replace(/\/+$/, "");
}

async function parseResponseBody(
  response: Response,
): Promise<unknown> {
  const contentType =
    response.headers.get("content-type") ?? "";

  if (
    contentType
      .toLowerCase()
      .includes("application/json")
  ) {
    return response.json();
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(
  body: unknown,
  fallback: string,
): string {
  if (typeof body === "string" && body.trim()) {
    return body;
  }

  if (
    typeof body === "object" &&
    body !== null
  ) {
    const record = body as Record<
      string,
      unknown
    >;

    if (
      typeof record.message === "string" &&
      record.message.trim()
    ) {
      return record.message;
    }

    if (
      typeof record.detail === "string" &&
      record.detail.trim()
    ) {
      return record.detail;
    }

    if (
      typeof record.error === "string" &&
      record.error.trim()
    ) {
      return record.error;
    }
  }

  return fallback;
}

export function createApiClient(
  options: ApiClientOptions = {},
) {
  const baseUrl = normalizeBaseUrl(
    options.baseUrl ??
      process.env.NEXT_PUBLIC_API_URL ??
      "http://localhost:8000/api",
  );

  const defaultTimeoutMs =
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  async function request<T>(
    path: string,
    requestOptions: ApiRequestOptions = {},
  ): Promise<T> {
    const {
      timeoutMs = defaultTimeoutMs,
      ...fetchOptions
    } = requestOptions;

    const controller = new AbortController();

    const timeoutId = window.setTimeout(
      () => controller.abort(),
      timeoutMs,
    );

    const normalizedPath = path.startsWith("/")
      ? path
      : `/${path}`;

    try {
      const response = await fetch(
        `${baseUrl}${normalizedPath}`,
        {
          ...fetchOptions,
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            ...fetchOptions.headers,
          },
        },
      );

      const body =
        await parseResponseBody(response);

      if (!response.ok) {
        throw new ApiError(
          getErrorMessage(
            body,
            "The API request failed.",
          ),
          response.status,
          response.statusText,
        );
      }

      return body as T;
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        throw new Error(
          "The API request timed out.",
        );
      }

      throw error;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  async function get<T>(
    path: string,
    requestOptions: ApiRequestOptions = {},
  ): Promise<T> {
    return request<T>(path, {
      ...requestOptions,
      method: "GET",
    });
  }

  async function post<T>(
    path: string,
    body?: unknown,
    requestOptions: ApiRequestOptions = {},
  ): Promise<T> {
    const headers = new Headers(
      requestOptions.headers,
    );

    headers.set(
      "Content-Type",
      "application/json",
    );

    return request<T>(path, {
      ...requestOptions,
      method: "POST",
      headers,
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    });
  }

  async function put<T>(
    path: string,
    body?: unknown,
    requestOptions: ApiRequestOptions = {},
  ): Promise<T> {
    const headers = new Headers(
      requestOptions.headers,
    );

    headers.set(
      "Content-Type",
      "application/json",
    );

    return request<T>(path, {
      ...requestOptions,
      method: "PUT",
      headers,
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    });
  }

  async function patch<T>(
    path: string,
    body?: unknown,
    requestOptions: ApiRequestOptions = {},
  ): Promise<T> {
    const headers = new Headers(
      requestOptions.headers,
    );

    headers.set(
      "Content-Type",
      "application/json",
    );

    return request<T>(path, {
      ...requestOptions,
      method: "PATCH",
      headers,
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    });
  }

  async function remove<T>(
    path: string,
    requestOptions: ApiRequestOptions = {},
  ): Promise<T> {
    return request<T>(path, {
      ...requestOptions,
      method: "DELETE",
    });
  }

  return {
    request,
    get,
    post,
    put,
    patch,
    delete: remove,
    baseUrl,
  };
}

export const apiClient = createApiClient();