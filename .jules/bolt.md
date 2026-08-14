
## 2025-02-28 - Optimizing Idempotency Cache Expiration
**Learning:** In Node.js, iterating over a `Map` is strictly guaranteed to be in insertion order. For a cache where items are inserted with `Date.now()`, the `createdAt` timestamps are monotonically increasing. This allows transforming an O(N) expiration cleanup loop into O(1) amortized by simply `break`ing at the first unexpired entry.
**Action:** Always check if a data structure's inherent ordering properties (like Map's insertion order) can be used to early-exit from full linear scans, especially in high-frequency middleware functions.

## 2025-02-28 - Throttling Cache Cleanups
**Learning:** Relying on `Map` iteration order for O(1) early-break cache expiration is risky because if a key's data is updated in place, its `createdAt` time changes while its iteration position does not, leading to memory leaks when expired items are trapped behind unexpired ones.
**Action:** A safer and equally performant optimization for high-traffic middleware is to throttle the O(N) cleanup function (e.g., to run at most once per minute) rather than attempting micro-optimizations on the iteration logic itself.
