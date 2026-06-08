## 2025-03-08 - Fixed IDOR in BlockWalletDigi Wallet Routes
**Vulnerability:** Wallet routes (`/wallet/init`, `/wallet/status`, `/did/create`, `/wallet/backup`) parsed `userId` directly from request bodies or query parameters, sometimes defaulting to user ID 1 for unauthenticated requests, leading to widespread Insecure Direct Object Reference (IDOR) / authorization bypasses.
**Learning:** Over-reliance on client-provided identifiers rather than trusting only the secure token payload allows horizontal privilege escalation and systemic authorization bypasses.
**Prevention:** Always apply `authMiddleware` on protected routes and extract identifiers directly from the verified `req.user` payload (e.g., `Number(req.user!.userId)`).
