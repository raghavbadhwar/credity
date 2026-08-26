## 2026-06-25 - Insecure Random Number Generation for 2FA Backup Codes
**Vulnerability:** Used Math.random() to generate security-sensitive 2FA backup codes.
**Learning:** JavaScript's built-in Math.random() is often mistakenly used for generating security-sensitive tokens out of convenience, despite its lack of cryptographic strength and predictability.
**Prevention:** Always use the built-in crypto module (e.g., crypto.randomInt()) when generating security-sensitive values like tokens, passwords, or backup codes.
