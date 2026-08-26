## 2025-02-14 - Fix DOM-based XSS in Fallback Inline HTML

**Vulnerability:** The inline HTML template in `credverse-gateway/server/index.ts` uses `.innerHTML` to insert URL parameters (`name` and `error`) directly into the DOM without sanitization, leading to a DOM-based Cross-Site Scripting (XSS) vulnerability.

**Learning:** Even fallback or dev-only inline templates are vulnerable to XSS if user input (like URL parameters) is dynamically rendered insecurely into the DOM. This highlights the importance of using safe DOM manipulation methods in all web templates, regardless of their primary use case.

**Prevention:** To prevent DOM-based XSS, always use `.textContent` or `.innerText` instead of `.innerHTML` when inserting untrusted or user-controlled data into the DOM. This ensures that the browser treats the content as raw text rather than executable HTML/script code.
