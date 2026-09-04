"use client";

import {
  AlertCircle,
  RefreshCcw,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  rows?: number;
}

export function LoadingState({
  rows = 3,
}: LoadingStateProps): React.JSX.Element {
  return (
    <div
      className="space-y-3"
      aria-busy="true"
      aria-label="Loading"
    >
      {Array.from({
        length: rows,
      }).map((_, index) => (
        <Skeleton
          key={`skeleton-${index}`}
          className="h-14 w-full rounded-lg"
        />
      ))}
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  message,
  onRetry,
}: ErrorStateProps): React.JSX.Element {
  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />

      <AlertTitle>
        Data unavailable
      </AlertTitle>

      <AlertDescription className="flex flex-wrap items-center gap-3">
        <span>{message}</span>

        {onRetry ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onRetry}
          >
            <RefreshCcw className="mr-2 size-3" />
            Retry
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({
  title,
  description,
}: EmptyStateProps): React.JSX.Element {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center">
      <p className="font-medium">
        {title}
      </p>

      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}