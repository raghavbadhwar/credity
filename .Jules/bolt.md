## 2025-06-12 - Memory optimization for Map searching
**Learning:** Using `Array.from(map.values()).find(...)` eagerly allocates an entire O(N) array in memory just to search for a single element, completely negating the short-circuiting benefit of `.find()`. For large datasets, this wastes memory and CPU.
**Action:** Iterate directly over Maps using `for...of map.values()` to achieve true O(1) memory early-return searching without allocating an intermediary array.
