## YYYY-MM-DD - Initial Journal Entry
**Vulnerability:** Weak pseudo-random number generator used for security tokens/backup codes.
**Learning:** `Math.random()` generates predictable values and should not be used for cryptographic purposes.
**Prevention:** Always use the native `crypto` module (e.g., `crypto.randomInt()`) for secure pseudo-random number generation.
