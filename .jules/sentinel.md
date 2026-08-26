## 2024-03-24 - IDOR Vulnerability via Insecure Direct Object Reference
**Vulnerability:** Widespread use of parseInt(req.query.userId) || 1 and parseInt(req.body.userId) || 1 allowed any user to spoof their userId and bypass authentication in sensitive routes.
**Learning:** Hardcoding fallback || 1 and accepting input from req.query/req.body without token validation is a systemic pattern leading to complete authorization bypasses.
**Prevention:** Enforce authMiddleware on all sensitive endpoints and rigidly extract user identity only from the verified token payload (req.user?.userId).
