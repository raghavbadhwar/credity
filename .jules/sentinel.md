## 2025-02-14 - Gateway DOM XSS via innerHTML
**Vulnerability:** Reflected Cross-Site Scripting (XSS) in credverse-gateway/server/index.ts where un-sanitized URL search parameters ('name' and 'error') were rendered into the DOM using `element.innerHTML`.
**Learning:** Even in backend-centric files like an Express gateway entry point, manually constructing HTML strings and manipulating the DOM on the client side using `.innerHTML` creates a critical XSS vector if user input (like URL parameters) is not properly sanitized or encoded.
**Prevention:** Always use safe DOM manipulation methods like `.textContent` or `.innerText` when inserting un-trusted data into the DOM to ensure the browser treats the input strictly as text, not executable HTML or scripts.
