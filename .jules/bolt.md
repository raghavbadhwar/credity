## 2024-05-24 - Replace Array.from.find with direct Map iteration
**Learning:** O(n) array allocations via `Array.from(map.values())` when followed by `.find` or `.filter` cause unnecessary memory overhead, especially in core storage lookups. Iterating directly over `map.values()` using `for...of` avoids creating an intermediate array.
**Action:** When searching maps, replace `Array.from(map.values()).find(fn)` with a direct `for...of` loop over `map.values()`.
