## 2025-05-27 - IDOR vulnerability pattern
**Vulnerability:** In `BlockWalletDigi/server/routes/*`, many endpoints accept `userId` from `req.body.userId` or `req.query.userId` directly, and fallback to `1` using `parseInt(req.body.userId) || 1`. This allows anyone to access or act on behalf of user 1, or any other user if they pass the ID in the request, skipping authentication.
**Learning:** Hardcoding `|| 1` as a default for unauthenticated users is a massive IDOR and auth bypass risk. Trusting client-provided user IDs for sensitive operations is an IDOR pattern.
**Prevention:** Apply `authMiddleware` to these routes and extract `userId` from `req.user?.id` or `req.user?.userId`.
