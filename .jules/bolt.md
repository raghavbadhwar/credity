## 2025-05-18 - Use Promise.all for concurrent bulk credential verification
**Learning:** The `bulkVerify` method in `CredVerseRecruiter/server/services/verification-engine.ts` uses a sequential `for...of` loop to verify credentials. This is a performance bottleneck for bulk operations where many credentials need to be verified, as each verification call `await this.verifyCredential(cred)` blocks the next one.
**Action:** Replace sequential `for...of` loops with `Promise.all` mapping for independent asynchronous operations like batch verifying credentials.
