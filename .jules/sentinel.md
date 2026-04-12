## 2024-05-24 - Insecure Backup Code Generation
**Vulnerability:** Found `Math.random()` used to generate 2FA backup codes in `two-factor.ts`.
**Learning:** `Math.random()` is not a cryptographically secure pseudo-random number generator (CSPRNG), making codes predictable.
**Prevention:** Always use Node.js native `crypto` module (e.g., `crypto.randomInt()`) for generating secure tokens or codes.
