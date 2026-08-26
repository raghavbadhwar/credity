## 2024-05-24 - [Fix IDOR in wallet routes]
**Vulnerability:** Systemic IDOR vulnerability in BlockWalletDigi where endpoints unauthenticatedly parse user IDs from query or body, defaulting to user ID 1.
**Learning:** Hardcoded default fallbacks like `parseInt(req.query.userId) || 1` on sensitive routes without authentication allow trivial authorization bypasses across the API.
**Prevention:** Always apply `authMiddleware` on sensitive endpoints and strictly extract the user ID from the verified token payload (`req.user.userId`) rather than trusting client input.
