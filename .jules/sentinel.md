## 2025-02-18 - Reflected XSS in Fallback HTML
**Vulnerability:** Reflected XSS in `credverse-gateway/server/index.ts` due to `innerHTML` usage with URL parameters.
**Learning:** Even fallback/development pages served by production servers must be secure. Client-side XSS can occur even with server-side processing if raw URL params are used in the DOM.
**Prevention:** Always use `textContent` or `innerText` when inserting untrusted data into the DOM, and avoid `innerHTML` unless absolutely necessary and sanitized.
