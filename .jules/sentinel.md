## 2024-04-04 - Insecure Randomness in 2FA Backup Codes
**Vulnerability:** Used Math.random() to generate 2FA backup codes.
**Learning:** Backup codes were generated using Math.random(), which is predictable and not cryptographically secure, compromising the security of the 2FA mechanism.
**Prevention:** Always use the native Node.js crypto module (e.g., crypto.randomInt) for generating security tokens, backup codes, or cryptographic nonces instead of Math.random().
