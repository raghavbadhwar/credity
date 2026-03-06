## 2026-03-06 - DOM-based Reflected XSS in Gateway Fallback HTML
**Vulnerability:** The inline HTML fallback for the CredVerse Gateway used `innerHTML` to render user-controlled URL search parameters (`name` and `error`). This created a DOM-based Reflected Cross-Site Scripting (XSS) vulnerability, allowing attackers to inject arbitrary scripts by crafting malicious URLs.
**Learning:** Even simple fallback HTML pages without a framework are susceptible to XSS if user input is directly inserted into the DOM using `innerHTML`.
**Prevention:** Always use `textContent` or `innerText` when dynamically updating the DOM with user-provided data, or ensure proper HTML encoding if `innerHTML` is strictly necessary.
