## 2025-05-02 - DOM-based XSS in Gateway Fallback HTML
**Vulnerability:** Found `innerHTML` being used to render URL parameters (`login`, `name`, `error`) in the `credverse-gateway` fallback HTML template, allowing DOM-based Cross-Site Scripting (XSS).
**Learning:** Fallback or dev-only inline HTML in Express backends can be easily overlooked by standard template security scanners because they don't use a formal templating engine (like React, Pug, or EJS) which auto-escapes by default.
**Prevention:** Always use `.textContent` instead of `.innerHTML` when dynamically inserting untrusted data or URL parameters into raw DOM elements, even in fallback or development pages.
