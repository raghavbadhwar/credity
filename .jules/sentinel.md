## 2024-05-15 - Systemic IDOR via parseInt Fallback
**Vulnerability:** Systemic Insecure Direct Object Reference (IDOR) pattern across multiple route files (e.g., `wallet.ts`, `digilocker.ts`) where endpoints default unauthenticated or invalid requests to user ID 1 via `parseInt(req.query.userId) || 1` or `parseInt(req.body.userId) || 1`.
**Learning:** This pattern bypasses all authorization by assuming trust in client-provided IDs and falling back to a privileged test user.
**Prevention:** Always apply `authMiddleware` to secure routes and strictly extract the `userId` directly from the verified token payload (`req.user.userId`), never from client input.
