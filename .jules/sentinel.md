## 2026-04-17 - DOM XSS in Gateway Fallback HTML
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) in credverse-gateway/server/index.ts where URL parameters ('name' and 'error') were inserted directly into the DOM using `.innerHTML`.
**Learning:** Using `.innerHTML` to insert user-controlled data directly from URL parameters into inline script templates creates a direct XSS vector.
**Prevention:** Always use `.textContent` or `.innerText` instead of `.innerHTML` when inserting untrusted data, or use DOM APIs like `document.createTextNode()`.
