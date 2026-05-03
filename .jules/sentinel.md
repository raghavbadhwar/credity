## 2025-05-03 - Widespread IDOR via Default User IDs
**Vulnerability:** Endpoints extensively extract `userId` from `req.query` or `req.body` and default to `|| 1` (e.g., `parseInt(req.query.userId) || 1`).
**Learning:** Defaulting unauthenticated or malformed requests to a valid ID (especially `1`, often an admin or primary user) allows full authorization bypass.
**Prevention:** Always enforce `authMiddleware` on sensitive routes and strictly extract the user ID from the verified token payload (`req.user?.userId`).
