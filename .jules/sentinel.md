## 2024-07-20 - IDOR in Route Handlers using Centralized Middleware
**Vulnerability:** IDOR (Insecure Direct Object Reference) vulnerabilities exist where routes fetch records without enforcing `tenantId` authorization, allowing authenticated users to access other tenants' data.
**Learning:** Centralized tenant mapping tools (e.g., `apiKeyMiddleware`) set `req.tenantId` for authentication, but database storage methods (e.g., `getStudent`) do not implicitly filter by `tenantId`. Route handlers must explicitly verify that the fetched resource's `tenantId` matches the authenticated `req.tenantId` before returning or mutating data.
**Prevention:** Always implement explicit tenant validation in endpoints retrieving, updating, or deleting specific resources by ID.
