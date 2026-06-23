## 2024-06-23 - DOM XSS in Gateway Fallback HTML
**Vulnerability:** The gateway inline HTML fallback directly assigned `innerHTML` using URL parameters, allowing a DOM-based Cross-Site Scripting (XSS) attack.
**Learning:** Even simple fallback HTML strings need secure output encoding or property assignment (`textContent`) because URL parameters are untrusted input.
**Prevention:** Always use `textContent` or `innerText` instead of `innerHTML` when rendering data derived from the user or URL parameters.
