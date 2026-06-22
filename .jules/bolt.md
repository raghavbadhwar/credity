## 2025-02-28 - Array.from map iteration allocation overhead
**Learning:** In Node.js/TypeScript, using `Array.from(map.entries())` inside loops or frequent operations creates unnecessary O(n) memory allocations by instantiating new arrays just for iteration.
**Action:** Replace `Array.from(map.entries())` and `Array.from(map.values())` with direct `for...of` iteration over `map.entries()` or `map.values()` to avoid array memory allocations and improve garbage collection efficiency.
