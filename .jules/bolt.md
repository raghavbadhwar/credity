## 2024-07-05 - Use Promise.all for concurrent bulk credential verification/import
**Learning:** In `BlockWalletDigi/server/routes/digilocker.ts`, documents were imported sequentially using a standard `for (const doc of documents)` loop which can cause performance bottlenecks when importing multiple external documents concurrently. Wait time scales linearly instead of concurrently.
**Action:** Replaced sequential API requests with `Promise.all` where external HTTP requests are made.
