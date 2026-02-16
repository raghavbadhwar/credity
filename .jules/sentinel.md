## 2024-05-24 - Reflected XSS in Server Fallback HTML
**Vulnerability:** `innerHTML` was used to inject URL parameters (`name`, `error`) directly into a dynamically generated HTML string in the server's fallback response. This allowed attackers to execute arbitrary JavaScript by crafting malicious URLs.
**Learning:** Even "temporary" or "fallback" server responses that construct HTML strings manually can be vulnerable to XSS if they include unsanitized user input. The client-side execution context (browser) will execute scripts injected into `innerHTML`.
**Prevention:** Always use `textContent` or `innerText` when inserting untrusted text into the DOM. Avoid constructing HTML strings with user input; use templating engines that auto-escape, or DOM APIs that handle text safely.
