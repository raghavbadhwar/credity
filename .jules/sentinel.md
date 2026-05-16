## 2025-02-27 - IDOR vulnerability through default userId fallback
**Vulnerability:** Systemic IDOR authorization bypass caused by parsing unverified user input (parseInt(req.query.userId) || 1 and req.body.userId) defaulting to User ID 1.
**Learning:** Endpoints were lacking authMiddleware allowing any unauthenticated user to assume the identity of the first created user or access sensitive routes like backups and initialization without verification.
**Prevention:** Always enforce authMiddleware on routes exposing sensitive actions, and extract identities directly from the verified token payload (req.user?.userId) rather than from the request body or query string.
