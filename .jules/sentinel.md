## 2024-05-24 - Cross-Site Scripting (XSS) Vulnerability in Gateway HTML
**Vulnerability:** Found a Cross-Site Scripting (XSS) vulnerability in `credverse-gateway/server/index.ts` where user input from URL parameters (`name` and `error`) was directly injected into the DOM using `.innerHTML`.
**Learning:** When dynamically inserting user input or URL parameters into the DOM in Vanilla JS scripts (such as the credverse-gateway fallback pages), always use `textContent` instead of `innerHTML` to prevent DOM-based Reflected Cross-Site Scripting (XSS) vulnerabilities.
**Prevention:** Avoid using `.innerHTML` when handling user input. Use `.textContent` instead to treat the input as plain text.
