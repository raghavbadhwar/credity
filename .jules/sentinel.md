## 2024-07-27 - Prevent IDOR and Mass Assignment in Resource Routes
**Vulnerability:** IDOR in students routes (`/students/:id`) and Mass Assignment risk on updates due to storage methods not inherently filtering by tenantId.
**Learning:** Storage methods relying solely on resource IDs do not implicitly enforce tenant isolation.
**Prevention:** Always retrieve the resource first and verify `resource.tenantId === req.tenantId`, and explicitly delete protected fields (like `tenantId`) from `req.body` before updating.
