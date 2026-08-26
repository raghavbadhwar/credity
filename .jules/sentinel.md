## 2025-03-01 - Insecure Randomness for Security Tokens
**Vulnerability:** Multiple services in the monorepo use `Math.random()` to generate security-sensitive tokens (e.g., 2FA backup codes).
**Learning:** `Math.random()` is not cryptographically secure, leading to predictable tokens and potential security breaches. This is a systemic vulnerability pattern across the codebase where developers default to insecure JS random methods instead of the Node `crypto` module for generating secure tokens.
**Prevention:** Always use Node's native `crypto` module (e.g., `crypto.randomInt` or `crypto.randomBytes`) for generating any security-sensitive values, such as backup codes, session IDs, or random identifiers.
