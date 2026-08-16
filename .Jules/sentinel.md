## 2024-10-26 - Unfiltered Storage Methods Leading to IDOR
**Vulnerability:** Missing IDOR and Mass Assignment protections on single-item API routes (GET, PUT, DELETE). Route handlers assumed `storage` methods would implicitly filter by `tenantId`.
**Learning:** In the CredVerse codebase, centralized tenant mapping tools (e.g., `apiKeyMiddleware`) set `req.tenantId` for authentication, but database storage methods (e.g., `getStudent`) do not implicitly filter by `tenantId`.
**Prevention:** Route handlers must explicitly verify that the fetched resource's `tenantId` matches the authenticated `req.tenantId` before returning or mutating data. Also, ensure protected fields like `tenantId` are omitted from update payloads to prevent mass assignment.
