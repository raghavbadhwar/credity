
## 2025-02-27 - Avoid Array.from in map iteration
**Learning:** `Array.from()` inside a loop over a Map creates an unnecessary O(n) array memory allocation. Iterating directly over the map's values or entries avoids this allocation.
**Action:** Replace `Array.from(map.values())` and `Array.from(map.entries())` with direct `for...of` map iterations to avoid unnecessary memory allocations.
