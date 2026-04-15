## 2025-02-19 - Weak PRNG in 2FA Backup Codes
**Vulnerability:** 2FA backup codes were generated using Math.random(), which is predictable and insecure for security tokens.
**Learning:** Standard JavaScript random functions are inadequate for generating authentication or cryptographic tokens due to low entropy and predictability.
**Prevention:** Always utilize cryptographically secure pseudo-random number generators (CSPRNG), such as the native node:crypto module (e.g., crypto.randomInt), for generating any security-sensitive values.
