## 2024-05-29 - Critical IDOR Pattern Identified
**Vulnerability:** Systemic IDOR via parseInt(req.query.userId) || 1 fallback defaulting to user 1.
**Learning:** Widespread pattern allows unauthenticated requests to read/modify data for user ID 1 across wallet routes.
**Prevention:** Use authMiddleware and extract userId directly from req.user object.
