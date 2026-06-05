## 2024-06-05 - Avoid Array.from() for Map iteration
**Learning:** Eagerly calling `Array.from()` on Map iterators (`.entries()`, `.values()`) inside `for...of` loops forces O(N) memory allocation and defeats the short-circuiting capability of early returns.
**Action:** Always iterate directly over `map.entries()` or `map.values()` to maintain O(1) memory and O(K) best-case time complexity.
