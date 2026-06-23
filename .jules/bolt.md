## 2024-05-18 - Replacing Array.from() with for...of loops
**Learning:** In a performance-obsessed backend, `Array.from(map.values())` creates an unnecessary O(N) memory allocation and iterates the entire map just to find a single element or filter it down.
**Action:** Always replace `Array.from()` conversions on Maps with direct `for...of` iteration over `.values()` or `.entries()` to avoid unnecessary intermediate arrays and allow for early returns.
