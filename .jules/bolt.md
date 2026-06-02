## 2024-05-24 - Avoid Array.from() for Map Iteration
**Learning:** Using `Array.from(map.entries())` creates a full array copy of the map, resulting in unnecessary O(n) memory allocation and measurable iteration overhead in Node.js compared to iterating over `map.values()` when keys are unused.
**Action:** Always iterate directly over `map.values()` or `map.entries()` using a `for...of` loop instead of converting maps to arrays first.
