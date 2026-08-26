## 2024-05-18 - DOM XSS in Gateway Server Fallback Template
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) via URL parameters (`name` and `error`) assigned directly to `.innerHTML` in an inline script block within `credverse-gateway/server/index.ts`.
**Learning:** Fallback or dev-only templates in backend services often bypass frontend framework protections and can introduce XSS if they directly manipulate the DOM with untrusted input.
**Prevention:** Always use `.textContent` instead of `.innerHTML` when inserting untrusted data into the DOM in plain JavaScript to prevent script execution.
