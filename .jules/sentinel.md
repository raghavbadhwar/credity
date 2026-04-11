## 2024-04-11 - Insecure PRNG for 2FA Backup Codes
**Vulnerability:** Found `Math.random()` used to generate 2FA backup codes in `CredVerseIssuer 3/server/services/two-factor.ts`.
**Learning:** Using `Math.random` for sensitive security tokens like backup codes makes them predictable and vulnerable to attack. It should only be used for non-security functionality.
**Prevention:** Always use Node's `crypto.randomInt` or `crypto.randomBytes` for cryptographically secure pseudo-random number generation when dealing with authentication, tokens, or security keys.
