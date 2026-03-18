## 2024-05-28 - DOM-based XSS in Gateway Fallback
**Vulnerability:** The `gatewayHTML` fallback string in `credverse-gateway/server/index.ts` uses `innerHTML` to dynamically insert user input from URL parameters (`params.get('name')` and `params.get('error')`) directly into the DOM.
**Learning:** This is a classic DOM-based Reflected XSS vulnerability, allowing an attacker to craft a malicious URL with a script payload in the `name` or `error` query parameter that executes when the fallback page loads.
**Prevention:** Always use `textContent` instead of `innerHTML` when dynamically inserting user input or URL parameters into the DOM to ensure the browser treats the content as raw text rather than executable HTML/script.
