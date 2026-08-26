## 2025-05-18 - Avoid Array.from for Iteration
**Learning:** Iterating over `Array.from(map.entries())` creates a temporary array allocating O(n) memory. Map iterators allow O(1) memory iteration.
**Action:** Always use direct `for...of` iteration over `map.entries()` or `map.values()` to avoid unnecessary memory overhead and garbage collection in hot loops.
