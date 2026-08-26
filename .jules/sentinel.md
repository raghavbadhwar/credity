## 2025-02-26 - [XSS via innerHTML in Gateway Inline HTML]
**Vulnerability:** The gateway's inline HTML fallback used `innerHTML` to display URL parameters directly into a DOM element (e.g., `statusDiv.innerHTML = ... params.get('name') ...`). This is a direct Cross-Site Scripting (XSS) vulnerability.
**Learning:** Even fallback UI that is intended to be simple can introduce critical vulnerabilities if user-controlled input (like URL query strings) is unsafely rendered to the DOM without sanitization.
**Prevention:** Always use safe DOM APIs like `textContent` or `innerText` instead of `innerHTML` when displaying untrusted data, or use proper templating engines with auto-escaping.
