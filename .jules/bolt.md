## 2024-06-13 - Avoid Array.from in loops
**Learning:** Using `Array.from(map.values())` in loops creates unnecessary O(n) memory allocations, especially for large maps.
**Action:** Directly iterate using `for (const x of map.values())` or `map.entries()` to avoid performance bottlenecks.
