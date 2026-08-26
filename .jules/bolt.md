## 2025-02-21 - Remove unnecessary Array allocations in Map iterations
**Learning:** Using `Array.from(map.entries())` or `Array.from(map.values())` inside a `for...of` loop creates an unnecessary intermediate Array of size N, which adds significant memory allocation and execution time overhead, especially for large maps.
**Action:** When iterating over Maps in a `for...of` loop, directly iterate using `map.entries()`, `map.values()`, or `map.keys()` instead.
