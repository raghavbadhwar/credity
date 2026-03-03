## 2024-05-24 - Reflected XSS in Fallback HTML
**Vulnerability:** Reflected Cross-Site Scripting (XSS) in `credverse-gateway/server/index.ts` due to injecting URL parameters (`name` and `error`) into the DOM using `innerHTML` on the fallback login page.
**Learning:** Even fallback or inline HTML pages must treat user input securely. Injecting URL parameters directly via `innerHTML` allows arbitrary script execution if a user clicks a malicious link (e.g., `/?error=<script>alert(1)</script>`).
**Prevention:** Always use `textContent` when dynamically assigning text that includes user-provided data, such as query parameters, to prevent it from being parsed as HTML.
