## 2025-07-01 - XSS Vulnerability via innerHTML in Gateway Error Display
**Vulnerability:** A DOM-based Cross-Site Scripting (XSS) vulnerability was found in the gateway's fallback HTML login page where URL parameters (`name` and `error`) were directly assigned to `statusDiv.innerHTML`.
**Learning:** URL parameters are untrusted user input and can contain arbitrary HTML/JavaScript. Assigning them directly to `innerHTML` allows attackers to execute malicious scripts in the context of the gateway domain by crafting a special URL (e.g., `?error=<script>alert(1)</script>`).
**Prevention:** Always use safe DOM sinks like `textContent` or `innerText` when displaying untrusted data, as they automatically encode the content as plain text, preventing HTML rendering and script execution.
