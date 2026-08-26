## 2024-05-18 - Leverage Map insertion order for O(1) time-based eviction
**Learning:** JS Map preserves insertion order. When doing time-based eviction (where items are inserted chronologically), scanning the entire map with `for...of map.entries()` results in O(N) complexity for a periodic cleanup job.
**Action:** Always include an early `break` in time-based Map eviction loops. As soon as a non-expired item is encountered, the rest of the Map is guaranteed to also be non-expired. This turns O(N) periodic scans into O(1) amortized.
