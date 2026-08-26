## 2024-06-07 - Avoid Array.from().map() on large Maps
**Learning:** `Array.from(map.entries()).map(...)` creates a large intermediate array that stresses garbage collection during synchronous payload generation (like queuePersist state dumps).
**Action:** Replace widespread chained iteration arrays on Maps with direct `for...of map.entries()` (or `values()`) iteration and `.push()` to prevent allocating an unnecessary intermediate copy.
