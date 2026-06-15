## 2024-06-15 - Array.from Optimization in Node.js Maps
**Learning:** Found multiple instances of `Array.from(map.values())` and `Array.from(map.entries())` inside loops. This forces Node to create an intermediate array allocation for every item in the map, leading to an O(n) memory allocation cost, which is completely unnecessary when using `for...of` loops, as map iterators are natively supported.
**Action:** Always replace `for (const x of Array.from(map.values()))` with `for (const x of map.values())` to avoid intermediate memory allocation.
