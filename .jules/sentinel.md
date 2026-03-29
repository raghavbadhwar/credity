## 2025-03-29 - Hardcoded Default JWT Secrets in Shared Library
**Vulnerability:** The shared-auth package defaulted to hardcoded JWT and Refresh secrets ('dev-only-secret-not-for-production') instead of failing securely, risking token forgery across services if environment variables were accidentally omitted.
**Learning:** Shared libraries must fail fast and secure by default rather than providing hardcoded development fallbacks that could leak into production deployments.
**Prevention:** Never initialize default configuration with functional secrets. Always require explicit secure initialization from the consuming service.
