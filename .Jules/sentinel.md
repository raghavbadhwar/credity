## 2024-07-31 - Tenant Isolation Gap in Storage Methods
**Vulnerability:** IDOR (Insecure Direct Object Reference) and Mass Assignment. Routes assumed apiKeyMiddleware fully isolated tenants, but database storage methods (e.g., getStudent, updateStudent) do not inherently filter by req.tenantId.
**Learning:** Centralized tenant mapping tools (req.tenantId) do not automatically scope subsequent direct ID lookups in the database.
**Prevention:** Route handlers must explicitly verify that the fetched resource's tenantId matches the authenticated req.tenantId before returning or mutating data. Prevent mass assignment by actively stripping protected fields like tenantId from payloads.
