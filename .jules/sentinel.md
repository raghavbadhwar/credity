## 2024-05-11 - Fix IDOR in Wallet Routes
**Vulnerability:** Wallet endpoints parse userId from query/body and default to 1 (`parseInt(req.query.userId) || 1`), enabling systemic authorization bypasses where unauthenticated users or those supplying invalid IDs gain access to User ID 1's wallet.
**Learning:** This existed because legacy routes implicitly trusted client-provided user IDs and lacked uniform authentication enforcement across all endpoints.
**Prevention:** Avoid parsing user identity from client input (`req.body` or `req.query`). Always apply `authMiddleware` and explicitly extract the `userId` strictly from the verified authentication token payload (`req.user?.userId`).
