## 2024-05-24 - Array.from Optimization
**Learning:** Found an O(n) memory allocation happening unnecessarily across multiple services. `Array.from(map.values())` creates an intermediate array before `.find()`, `.filter()`, or `.sort()`.
**Action:** Replace `Array.from(map.values())` with direct `for...of` iteration over `map.values()` to avoid unnecessary intermediate array allocation, especially in core storage modules.
