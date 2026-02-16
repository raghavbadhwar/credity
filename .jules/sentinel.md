## 2024-05-24 - Reflected XSS in Server Fallback HTML
**Vulnerability:** `innerHTML` was used to inject URL parameters (`name`, `error`) directly into a dynamically generated HTML string in the server's fallback response. This allowed attackers to execute arbitrary JavaScript by crafting malicious URLs.
**Learning:** Even "temporary" or "fallback" server responses that construct HTML strings manually can be vulnerable to XSS if they include unsanitized user input. The client-side execution context (browser) will execute scripts injected into `innerHTML`.
**Prevention:** Always use `textContent` or `innerText` when inserting untrusted text into the DOM. Avoid constructing HTML strings with user input; use templating engines that auto-escape, or DOM APIs that handle text safely.

## 2024-05-24 - ESLint `no-useless-escape` False Positives
**Vulnerability:** Not a vulnerability, but a CI failure. The regex literal `/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/` triggered `no-useless-escape` for escaping `[` and `/`.
**Learning:** While some characters don't strictly *need* escaping in certain regex contexts (like `[` inside a character class if not part of a range), keeping them escaped can sometimes aid readability or prevent issues if the regex is modified later. However, modern linters are strict.
**Prevention:** When a regex is complex and the escape is harmless but flagged, using `// eslint-disable-next-line no-useless-escape` is a pragmatic solution to pass CI without risking breaking the regex logic by modifying it incorrectly.
