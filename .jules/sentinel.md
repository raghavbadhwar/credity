## 2024-07-24 - Fix IDOR and Mass Assignment in CredVerseIssuer routes
**Vulnerability:** IDOR in GET, PUT, and DELETE endpoints because database fetch methods (e.g., `getStudent`) do not filter by `tenantId`. Also Mass Assignment because PUT blindly passes `req.body` to storage methods.
**Learning:** Database layer in this project relies on route handlers to enforce tenant isolation after fetch, and doesn't explicitly restrict model updates.
**Prevention:** Always explicitly check `resource.tenantId === req.tenantId` for authorization and omit protected fields like `tenantId` from update payloads before storage.
