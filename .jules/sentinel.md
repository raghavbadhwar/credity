## 2025-04-03 - [Insecure Random Number Generation]
**Vulnerability:** Found Math.random() being used to generate 2FA backup codes.
**Learning:** Math.random() is not cryptographically secure and can be predicted, leading to potential security token compromise.
**Prevention:** Always use the native crypto module (e.g., crypto.randomInt() or crypto.randomBytes()) for generating security tokens, session IDs, or backup codes.
