## 2024-05-18 - XSS via innerHTML in gateway HTML fallback
**Vulnerability:** The inline HTML fallback for credverse-gateway in `server/index.ts` assigns user input directly from URL parameters (`params.get('name')` and `params.get('error')`) to an element's `innerHTML`.
**Learning:** URL parameters are untrusted user input. Using `innerHTML` with unsanitized parameters allows Reflected Cross-Site Scripting (XSS).
**Prevention:** Always use `textContent` instead of `innerHTML` when inserting untrusted text into the DOM.
