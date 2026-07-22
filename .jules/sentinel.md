## 2025-07-22 - [CRITICAL] Fix DOM XSS vulnerability in gateway HTML fallback
**Vulnerability:** URL query parameters (`name` and `error`) were directly injected into the DOM via `innerHTML` without sanitization in `credverse-gateway/server/index.ts`'s fallback HTML, creating a DOM-based Cross-Site Scripting (XSS) vulnerability.
**Learning:** Even simple fallback HTML pages served as strings from backend services can introduce critical client-side vulnerabilities if they reflect unsanitized user input (like URL parameters) directly into execution contexts like `innerHTML`.
**Prevention:** Always use `textContent` instead of `innerHTML` when rendering user-supplied data in the DOM to ensure the browser treats it strictly as text, not executable HTML/JavaScript.
