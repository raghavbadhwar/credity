## 2024-05-18 - Concurrent Bulk Credential Verification
**Learning:** In the CredVerseRecruiter workspace, bulk verification of credentials was happening sequentially via a `for...of` loop awaiting each `verifyCredential` call. Given these are network/crypto heavy operations and are independent of each other, this sequential processing causes unnecessary delays linear to the number of credentials.
**Action:** Use `Promise.all` coupled with `.map()` to execute independent asynchronous verification operations concurrently, reducing the overall processing time.
