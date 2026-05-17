## 2024-05-24 - Widespread IDOR via unauthenticated user ID extraction
**Vulnerability:** Systemic IDOR enabling authorization bypasses via unauthenticated `parseInt(req.query.userId) || 1` and `req.body.userId`, defaulting to user 1.
**Learning:** Developers relied on client-provided data for identity instead of extracting authenticated context, leaving sensitive endpoints completely unprotected.
**Prevention:** Consistently apply `authMiddleware` to protected routes and strictly derive the acting identity from the verified token payload (e.g., `req.user?.userId`).
