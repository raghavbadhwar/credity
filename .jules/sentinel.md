## 2024-05-24 - Fix IDOR and Authorization Bypass in Wallet Routes
**Vulnerability:** Systemic IDOR via `parseInt(req.query.userId) || 1` defaulting to user 1 or unvalidated query parameters.
**Learning:** Relying on client-provided `userId` without auth middleware allows attackers to access or modify other users' wallets and DIDs.
**Prevention:** Always apply `authMiddleware` on sensitive routes and explicitly extract `userId` from verified token payload (e.g., `req.user.userId`).
