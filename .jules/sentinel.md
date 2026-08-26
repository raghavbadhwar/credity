## 2024-05-24 - [IDOR Authorization Bypass Pattern]
**Vulnerability:** Systemic IDOR via parseInt(req.query.userId) || 1 or parseInt(req.body.userId) || 1.
**Learning:** Routes default unauthenticated or invalid requests to user ID 1 without applying any authentication middleware. This bypasses the actual authenticated user and allows anyone to interact with user 1's data, or anyone's data if they pass another ID.
**Prevention:** Always enforce `authMiddleware` on protected routes, and extract the user ID strictly from the verified JWT token payload (`req.user?.userId`) rather than trusting client-provided input in query or body parameters.
