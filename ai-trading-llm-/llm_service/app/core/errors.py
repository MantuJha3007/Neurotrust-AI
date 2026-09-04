class ServiceError(Exception):
    """Base service error."""


class ConfigurationError(ServiceError):
    """Required service configuration is missing."""


class ExternalServiceError(ServiceError):
    """An upstream dependency failed."""


class ModelOutputError(ServiceError):
    """The model response could not be validated."""


class RiskBlockedError(ServiceError):
    """A candidate trade was blocked by deterministic risk controls."""
