## 2024-03-12 - Weak Random Number Generation for Security Features
**Vulnerability:** 2FA backup codes generated using Math.random() in CredVerseIssuer 3/server/services/two-factor.ts
**Learning:** Math.random() is cryptographically insecure and its outputs can be predicted, compromising 2FA backup codes.
**Prevention:** Use Node.js crypto module (crypto.randomBytes or crypto.randomInt) to generate cryptographically secure random values for security tokens.
