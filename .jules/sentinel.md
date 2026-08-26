## 2024-05-01 - IDOR in Wallet Routes
**Vulnerability:** Widespread IDOR pattern using `parseInt(req.body.userId) || 1` defaulting to user 1.
**Learning:** Hardcoded default user IDs in query/body parsing enable systemic authorization bypasses.
**Prevention:** Always use `authMiddleware` and extract verified user IDs directly from the token payload (e.g., `req.user?.userId`).
