## 2024-06-29 - Avoid O(n) array allocations when iterating over Map values/entries
**Learning:** Iterating over `Array.from(map.values())` incurs unnecessary O(n) memory allocation. Using `map.values()` directly with `for...of` loops avoids this overhead.
**Action:** Iterate directly over `map.values()` and `map.entries()` iterator objects in Node.js instead of converting them to arrays when iterating over elements.
