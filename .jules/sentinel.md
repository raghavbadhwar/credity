## 2024-04-14 - DOM-based XSS via URL parameters in inline HTML
**Vulnerability:** The inline HTML fallback in credverse-gateway/server/index.ts used `innerHTML` to render unsanitized URL parameters (`name` and `error`), allowing DOM-based XSS.
**Learning:** Even internal fallback or dev-only Express templates must treat URL parameters as untrusted input. Using `innerHTML` opens a direct vector for malicious scripts.
**Prevention:** Always use `textContent` instead of `innerHTML` when inserting untrusted URL parameters or user input into the DOM.
