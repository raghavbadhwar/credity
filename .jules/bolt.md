## 2025-05-15 - Unnecessary Array Allocations in Map Iteration
**Learning:** Using `Array.from(map.entries())` or `Array.from(map.values())` inside a `for...of` loop creates an unnecessary complete array copy in memory before iterating. This is a common O(n) space complexity bottleneck in Node.js services iterating over caches or state maps.
**Action:** Always iterate directly on the Map iterators (`map.entries()` or `map.values()`) in `for...of` loops to maintain O(1) space complexity.
