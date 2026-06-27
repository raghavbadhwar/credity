## 2024-06-27 - Insecure Randomness in 2FA Backup Codes
**Vulnerability:** Weak PRNG (`Math.random()`) was used to generate 2FA backup codes.
**Learning:** Security-sensitive values like authentication codes or backup tokens must always use a cryptographically secure pseudo-random number generator (CSPRNG), not `Math.random()`.
**Prevention:** Always use `crypto.randomInt()` or `crypto.randomBytes()` from the built-in `crypto` module when generating sensitive tokens, IDs, or codes in Node.js.
