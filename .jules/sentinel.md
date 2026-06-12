## 2025-03-03 - Added Authentication to Sensitive Endpoints
**Vulnerability:** Several endpoints in `BlockWalletDigi/server/routes/user.ts` (e.g. `/api/v1/user`, `/api/v1/activity`) were completely unauthenticated and hardcoded to use `userId = 1`. This would allow any unauthenticated user to view or modify the profile of `userId = 1`.
**Learning:** Legacy endpoints or early development stubs that are hardcoded with a default user ID must be protected and wired correctly.
**Prevention:** Implement `authMiddleware` on all user-specific endpoints and enforce pulling `userId` from the authenticated session (e.g. `req.user!.userId`).
