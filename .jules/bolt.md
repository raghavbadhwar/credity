## 2024-05-24 - Map Iteration Memory Optimization
**Learning:** Using `Array.from(map.values())` to search or filter Map structures in Node.js creates unnecessary intermediate array allocations, leading to O(n) memory overhead on every call.
**Action:** Always use a direct `for...of` loop over `map.values()` when searching or filtering Maps, especially in high-traffic storage operations.
