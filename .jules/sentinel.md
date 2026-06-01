## 2024-05-24 - Fix IDOR in Wallet Endpoints
**Vulnerability:** Systemic IDOR via `req.body.userId` and `req.query.userId` with a fallback to user ID 1 without authentication checks in `BlockWalletDigi` routes.
**Learning:** Found widespread pattern where sensitive wallet endpoints parsed user IDs from public input vectors instead of authenticated token claims, allowing arbitrary user access and manipulation.
**Prevention:** Always apply `authMiddleware` to secure routes and strictly extract sensitive identifiers like `userId` from the verified token payload (`req.user?.userId`).
