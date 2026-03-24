## 2024-03-24 - Throttling O(N) Cache Cleanup in Middleware
**Learning:** Found a severe bottleneck in `packages/shared-auth/src/idempotency.ts` where `pruneExpired` iterated over a potentially 5,000-entry `Map` on *every single* POST/PUT/PATCH/DELETE request to clear expired tokens. This O(N) operation heavily blocks the Node.js event loop under load.
**Action:** Throttle the cleanup operation to run at most once per minute (`lastPruneTime`). It's a critical pattern to avoid unbounded synchronous O(N) loops in middleware that executes on every request.
