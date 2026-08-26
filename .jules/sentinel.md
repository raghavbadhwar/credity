## 2025-02-23 - Prevent IDOR in Student API Routes
**Vulnerability:** The API routes for fetching, updating, and deleting individual students did not verify if the requested student belonged to the authenticated tenant, allowing Insecure Direct Object Reference (IDOR).
**Learning:** Centralized middleware (`apiKeyMiddleware`) sets `req.tenantId` for authentication, but database storage methods (`getStudent`, `updateStudent`, `deleteStudent`) do not implicitly filter by `tenantId`. This creates a gap where valid authentication does not guarantee authorization for specific resources.
**Prevention:** Route handlers must explicitly verify that the fetched resource's `tenantId` matches the authenticated `req.tenantId` before returning or mutating data.
