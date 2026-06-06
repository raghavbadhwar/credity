## 2025-02-28 - IDOR in Wallet Backup Route
**Vulnerability:** The `/wallet/backup` endpoint relied on `parseInt(req.body.userId) || 1`, allowing attackers to backup and access the wallet of user ID 1 without authentication.
**Learning:** Hardcoding a fallback user ID and relying on unauthenticated client-provided `userId` parameters creates systemic authorization bypasses.
**Prevention:** Always use `authMiddleware` for sensitive routes and extract the user ID strictly from the verified token payload (e.g., `req.user?.userId`).
