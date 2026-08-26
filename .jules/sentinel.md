## 2025-04-25 - Fix XSS in Gateway Inline HTML Fallback
**Vulnerability:** DOM-based XSS in Gateway inline HTML fallback (`credverse-gateway/server/index.ts`) using `innerHTML` with untrusted query parameters (`name` and `error`).
**Learning:** The fallback HTML bypassed frontend framework protections (like Vite/React) and used raw DOM manipulation, exposing the application to XSS.
**Prevention:** Always use `textContent` instead of `innerHTML` when setting text content from untrusted input, even in simple inline fallback scripts.
