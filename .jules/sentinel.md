## 2024-04-20 - DOM-based XSS via innerHTML in fallback HTML
**Vulnerability:** The gateway's inline fallback HTML used `innerHTML` to display the `name` and `error` query parameters directly into the DOM, making it vulnerable to DOM-based XSS attacks.
**Learning:** Even fallback or "dev-only" inline HTML strings returned by backend services need careful sanitization, especially when rendering user-controlled URL parameters.
**Prevention:** Always use `.textContent` instead of `.innerHTML` when inserting untrusted data into the DOM to ensure it is safely rendered as text.
