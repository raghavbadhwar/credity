## 2024-05-18 - [CRITICAL] Systemic IDOR / Auth Bypass Pattern
**Vulnerability:** Widespread use of `parseInt(req.query.userId) || 1` in API routes bypasses authentication by defaulting to user 1.
**Learning:** Fallback values for identity claims lead to implicit trust of unauthenticated requests.
**Prevention:** Always use `authMiddleware` and extract user identity strictly from verified token payloads (e.g., `req.user.userId`), never from client input or fallbacks.
