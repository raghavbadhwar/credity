## 2024-05-24 - DOM-based XSS via innerHTML
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) vulnerability found in inline HTML fallback using `innerHTML` to display URL parameters.
**Learning:** Using `innerHTML` to render user-controlled input, even in fallback development templates, opens up XSS vulnerabilities if the input contains malicious scripts.
**Prevention:** Always use `.textContent` instead of `.innerHTML` when inserting untrusted text, such as URL parameters, into the DOM to safely escape HTML entities.
