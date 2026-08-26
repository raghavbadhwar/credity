## 2024-05-19 - Use Promise.all/allSettled to avoid sequential await loops
**Learning:** `BlockWalletDigi/server/routes/digilocker.ts` contains `for...of` loops that use `await` inside them for importing documents. In Node.js, this causes sequential execution. Since `walletService.storeCredential` persistence is serialized under the hood, I/O bound operations like `digilockerService.pullDocument` can safely be parallelized using `Promise.allSettled()` and `Promise.all()`.
**Action:** Replace sequential loops for network/DB requests with `Promise.all` or `Promise.allSettled`.
