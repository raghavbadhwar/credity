## 2024-07-12 - Concurrent Bulk Verification
**Learning:** In bulk operations, sequential await blocks I/O operations (like database reads or API calls) unnecessarily. The `bulkVerify` method in `verification-engine.ts` was awaiting each credential verification sequentially, which scales linearly O(n) and creates a bottleneck.
**Action:** When handling arrays of independent I/O bound operations, use `Promise.all()` to run them concurrently to improve execution time.
