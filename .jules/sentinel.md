## 2025-01-01 - [CRITICAL] Widespread IDOR via Default userId Fallback
**Vulnerability:** Numerous endpoints parsed `userId` from query/body and defaulted to `1` (e.g., `parseInt(req.query.userId) || 1`) without proper authentication middleware.
**Learning:** Defaulting to a valid primary user ID when input is missing/invalid enables systemic authorization bypasses and IDOR.
**Prevention:** Always apply `authMiddleware` to secure routes and strictly extract the user ID from the verified token payload (`req.user?.userId`) rather than client-provided parameters.
