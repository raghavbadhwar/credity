## 2024-05-20 - Widespread IDOR vulnerability pattern in BlockWalletDigi routes
**Vulnerability:** Systemic authorization bypass via `parseInt(req.query.userId) || 1` and `parseInt(req.body.userId) || 1` in `BlockWalletDigi` routes.
**Learning:** This widespread pattern bypassed authentication, defaulting unauthenticated or invalid requests to user ID 1 and allowing users to bypass the intended authorization checks.
**Prevention:** Remove `|| 1` and implement actual `authMiddleware` that checks the authenticated user's ID against the requested user ID to ensure they have the proper permissions.

## 2024-05-20 - XSS via .innerHTML in Gateway inline HTML template
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) in `credverse-gateway/server/index.ts` fallback inline HTML. The `name` and `error` query parameters from the URL are directly injected into `statusDiv.innerHTML` without sanitization, leading to arbitrary JavaScript execution.
**Learning:** Even fallback or development-only UI routes served by backends can be leveraged for XSS if untrusted data is injected directly into the DOM using `.innerHTML`.
**Prevention:** Always use `.textContent` instead of `.innerHTML` when inserting untrusted URL parameters or user data into the DOM to ensure safe text rendering.
