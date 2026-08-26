## 2024-05-24 - IDOR in Wallet Routes
**Vulnerability:** Widespread Insecure Direct Object Reference (IDOR) pattern in BlockWalletDigi `wallet.ts` routes where `userId` was accepted directly from unauthenticated requests (`parseInt(req.query.userId) || 1` or `req.body.userId`).
**Learning:** Defaulting to a valid user ID (like 1) when parsing fails creates systemic authorization bypasses, allowing unauthenticated attackers to access or modify other users' data.
**Prevention:** Always apply `authMiddleware` on protected routes and strictly extract the user ID from the verified token payload (`req.user?.userId`) rather than client-provided input.
