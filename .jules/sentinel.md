## 2025-04-24 - DOM-based XSS in Express Fallback HTML
**Vulnerability:** DOM-based XSS via unsanitized URL parameters (`name`, `error`) rendered with `.innerHTML` in the Express backend fallback HTML template.
**Learning:** Even fallback or development-only inline HTML templates in Express can introduce XSS if they use `innerHTML` to display URL parameters.
**Prevention:** Always use `.textContent` instead of `.innerHTML` when inserting untrusted data or URL parameters into inline HTML templates in Express backends.
