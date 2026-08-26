## 2024-05-18 - Fix DOM-based XSS in Gateway
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) via unsafe assignment of URL parameters (`name`, `error`) using `.innerHTML` in the gateway fallback template.
**Learning:** Always use `.textContent` instead of `.innerHTML` when inserting URL parameters into fallback or dev-only inline HTML templates to prevent DOM-based XSS vulnerabilities.
**Prevention:** Use `.textContent` for rendering user-controlled input in inline scripts.
