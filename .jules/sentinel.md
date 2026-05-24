## 2024-05-24 - IDOR Vulnerability Pattern in Express Routes
**Vulnerability:** Systemic Insecure Direct Object Reference (IDOR) across BlockWalletDigi routes. The `userId` was extracted blindly from `req.body.userId` or `req.query.userId`, defaulting to `1`, bypassing authentication entirely.
**Learning:** This occurred because routes lacked `authMiddleware`, and developers relied on client-supplied data instead of verifying claims against the JWT payload.
**Prevention:** Always enforce `authMiddleware` on sensitive routes and derive user identity exclusively from trusted server-side state like `req.user?.userId`. Never trust the client to assert its own identity in API payloads.
