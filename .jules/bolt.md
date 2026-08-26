## 2025-02-28 - Avoid O(n) array allocations on map iterations
**Learning:** Calling `Array.from(map.entries())` or `Array.from(map.values())` when iterating over maps with `for...of` forces an unnecessary O(n) memory allocation.
**Action:** Iterate directly over `map.entries()` or `map.values()` using `for...of` when an array format is not strictly required.
