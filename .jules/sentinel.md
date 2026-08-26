## 2025-04-22 - Fix DOM-based XSS in gateway fallback HTML
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) in `credverse-gateway/server/index.ts` where URL parameters (`name` and `error`) were unsafely rendered directly to the DOM using `.innerHTML`.
**Learning:** Even fallback or temporary HTML strings in backend entry points (like Express serving dev-only UI) can be exploited if they unsafely construct UI using user-controlled parameters via `.innerHTML`.
**Prevention:** Always use `.textContent` or safe DOM manipulation methods instead of `.innerHTML` when inserting URL parameters or untrusted data into the DOM to prevent script execution.
