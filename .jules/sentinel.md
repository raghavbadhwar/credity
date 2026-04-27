## 2025-02-28 - DOM-based XSS in Express Inline Templates
**Vulnerability:** Untrusted URL parameters were rendered using `.innerHTML` in an inline HTML template.
**Learning:** Even simple fallback HTML rendered from backends can introduce client-side XSS if URL parameters are read using `new URLSearchParams(window.location.search)` and injected via `.innerHTML`.
**Prevention:** Always use `.textContent` when injecting untrusted data or parameters into the DOM to ensure safe text rendering instead of HTML execution.
