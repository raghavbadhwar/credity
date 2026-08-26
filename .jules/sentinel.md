## 2024-05-24 - Systemic IDOR via Default User ID Fallback
**Vulnerability:** Systemic IDOR where endpoints parsed user IDs from query/body parameters with a fallback to user ID 1 (`parseInt(req.query.userId) || 1`).
**Learning:** The fallback logic was intended to handle missing parameters during development but was left in production routes, allowing unauthenticated attackers to assume the identity of user 1 or arbitrarily access other users' data.
**Prevention:** Always apply `authMiddleware` to protected routes and extract the authenticated user ID strictly from the verified JWT payload (`req.user?.userId`), completely removing trust in client-provided user IDs.
