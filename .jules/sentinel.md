## 2025-05-14 - Widespread IDOR via default query parsing
**Vulnerability:** Endpoints rely on unverified query parameters (e.g., `parseInt(req.query.userId) || 1`), allowing any user to access User 1's data by simply omitting the parameter.
**Learning:** This fallback pattern completely bypassed authentication and authorization mechanisms for sensitive data like connections.
**Prevention:** Always extract the authenticated user's ID securely from the verified token payload (`req.user.userId`) via `authMiddleware` and never trust client-provided IDs for data scoping.
