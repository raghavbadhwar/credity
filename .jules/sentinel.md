
## 2025-02-18 - Insecure Direct Object Reference (IDOR) in tenant-scoped entities
**Vulnerability:** Systemic IDOR where tenant-specific endpoints fetched and mutated records by UUID without verifying the record's `tenantId` against the authenticated user's `tenantId`.
**Learning:** Centralized tenant mapping (e.g. `apiKeyMiddleware`) does not automatically scope subsequent direct ID lookups. `getStudent` / `getTeamMember` do not implicitly check `tenantId`.
**Prevention:** Ensure every authorization check inherently validates ownership context (e.g., passing `tenantId` to DB lookups directly or verifying it manually) rather than trusting UUIDs are inherently scoped.
