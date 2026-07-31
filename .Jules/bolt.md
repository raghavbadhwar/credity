## 2024-05-24 - Bulk Verification Concurrency
**Learning:** In Node.js bulk processes that make API calls (like bulk verification), using an unbounded `Promise.all` over large arrays can exhaust resources or cause rate limiting. Sequential loops are too slow.
**Action:** Always implement bounded concurrency by chunking large arrays into smaller batches (e.g., 10 items) and using `Promise.all` on each batch.
