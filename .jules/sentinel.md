## 2024-05-18 - Fix IDOR in wallet routes
**Vulnerability:** Widespread IDOR in wallet.ts routes using `parseInt(req.body.userId) || 1` or `req.query.userId`.
**Learning:** Routes missed authentication middleware and implicitly trusted client-provided user IDs.
**Prevention:** Apply `authMiddleware` globally and strictly extract `userId` from the verified JWT payload (`req.user.userId`).
