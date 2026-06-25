## 2024-05-20 - Map Iteration Performance
**Learning:** Using `Array.from()` to iterate over `Map.values()` or `Map.entries()` causes an unnecessary O(n) memory allocation. Maps and their iterators are natively iterable in JavaScript.
**Action:** Always use direct `for...of` iteration over `map.values()` or `map.entries()` instead of `Array.from()` to prevent unnecessary memory allocations, particularly for large collections.
