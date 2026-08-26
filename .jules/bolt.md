## 2024-03-20 - Avoid Array.from for direct Map/Set iteration
**Learning:** Using `Array.from(map.values())` or `Array.from(map.entries())` inside a `for...of` loop creates an unnecessary intermediate array, resulting in O(n) memory allocation.
**Action:** When iterating over Map/Set values or entries, use direct iteration (e.g., `for (const val of map.values())`) instead of wrapping it in `Array.from`.
