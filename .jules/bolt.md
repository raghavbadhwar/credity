## 2024-06-03 - Avoid O(n) array allocations in Map iterations
**Learning:** The codebase frequently wraps Map iterators in `Array.from()` (e.g., `Array.from(map.entries())`) inside hot loops, which causes unnecessary O(n) memory allocations and garbage collection overhead.
**Action:** Always iterate directly over map iterators (e.g., `for (const [k, v] of map.entries())`) instead of converting them to arrays first.
