## 2025-02-18 - Systemic IDOR via Default User ID Fallback
**Vulnerability:** Many routes in BlockWalletDigi extract `userId` from the request query or body and default to `1` (e.g., `parseInt(req.query.userId) || 1`). This allows unauthenticated users or users with invalid IDs to bypass authorization and act as user ID 1.
**Learning:** This widespread pattern bypassed explicit token verification. Relying on client-provided user IDs without a valid session context leads to systemic Insecure Direct Object References (IDOR).
**Prevention:** Apply `authMiddleware` to all protected routes and extract the user identity strictly from the verified JWT token payload (`req.user?.userId`) rather than trusting client input.
