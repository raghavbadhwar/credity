## Sentinel's Journal

## 2025-05-19 - Insecure User Routes with Hardcoded User ID
**Vulnerability:** The `BlockWalletDigi/server/routes/user.ts` file contains endpoints (`/user`, `/user` PATCH, `/activity`) that hardcode `userId = 1` and lack authentication middleware.
**Learning:** This likely exists because of early development prototyping where authentication was not yet fully integrated, and developers needed a quick way to test user-related functionality. The codebase has evolved with a more robust `authMiddleware` in other files (like `auth.ts`), but this file remained updated.
**Prevention:** Always implement authentication middleware from the start, even for prototypes. Use a mock user in the middleware if needed, but keep the route logic expecting an authenticated user object (e.g., `req.user.id`). Regular security audits should flag endpoints that don't import or use authentication middleware.
