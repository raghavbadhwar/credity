
## 2024-11-20 - [Optimize InMemory DB secondary indices]
**Learning:** O(N) Array scans over `Map.values()` inside in-memory stores (`MemStorage`) scale poorly when looking up relationships (like credentials by userId or users by username) and require O(N log N) re-sorts on subsequent queries.
**Action:** Implemented secondary index Maps (`credentialsByUserId`, `usersByUsername`) to maintain relationships concurrently with insertions, dropping lookups to O(1) time complexity and allowing arrays to be pre-sorted during state hydration. Ensure arrays returned from these Maps are cloned via `[...items]` to prevent external mutations breaking the indices.
