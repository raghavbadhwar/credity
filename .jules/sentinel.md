## 2024-04-07 - [CRITICAL DOM XSS in Fallback HTML]
**Vulnerability:** Inline HTML fallback script in credverse-gateway/server/index.ts inserted unsanitized URL parameters (`name` and `error`) directly into the DOM using `.innerHTML`.
**Learning:** Even fallback or "dev-only" inline templates must treat URL parameters as untrusted input. The presence of Vite dev server fallback logic doesn't negate the need for basic output encoding.
**Prevention:** Always use `.textContent` instead of `.innerHTML` when inserting untrusted string data into the DOM in plain JavaScript scripts.
