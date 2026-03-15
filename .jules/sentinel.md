## 2024-05-15 - Insecure 2FA Backup Code Generation
**Vulnerability:** The 2FA backup code generation function in `CredVerseIssuer 3/server/services/two-factor.ts` utilizes the insecure `Math.random()` function to pick characters.
**Learning:** `Math.random()` relies on a predictable pseudorandom number generator (PRNG). For security-sensitive mechanisms like 2FA backup codes, this predictability can allow an attacker to guess generated codes and bypass authentication. Node's native `crypto` module should be used instead.
**Prevention:** Strictly utilize cryptographically secure generators (e.g., `crypto.randomInt`, `crypto.randomBytes`) for any tokens, secrets, or identifiers relied upon for authentication or authorization.
