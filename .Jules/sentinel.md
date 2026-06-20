## 2024-05-24 - Insecure 2FA Backup Code Generation
**Vulnerability:** Found `Math.random()` being used to generate 2FA backup codes in `two-factor.ts`.
**Learning:** Node.js backend services generating sensitive tokens or codes must use cryptographically secure RNGs, not `Math.random()`, which is predictable and insecure for security-critical values.
**Prevention:** Always use `crypto.randomInt()` or `crypto.randomBytes()` from the built-in `crypto` module when generating secure secrets, passwords, or fallback codes.
