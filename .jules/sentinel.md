## 2024-04-13 - Fix DOM-based XSS in Gateway Fallback HTML
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) via `statusDiv.innerHTML` using unescaped URL parameters (`name` and `error`) in `credverse-gateway/server/index.ts`.
**Learning:** Fallback or dev-only inline HTML templates in Express backends must use `.textContent` rather than `.innerHTML` to insert URL parameters.
**Prevention:** Always use `.textContent` or proper escaping when dynamically inserting user-controlled data into the DOM.
