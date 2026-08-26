## 2026-06-10 - Avoid Array Allocations in Map Iterations
**Learning:** A common performance anti-pattern in this codebase is wrapping Map iterators in `Array.from()` (e.g., `Array.from(map.entries())`) within `for...of` loops. This forces the V8 engine to eagerly allocate an entirely new array in memory, turning a lazy, constant-memory iteration into an O(n) memory bottleneck that increases garbage collection pressure as Maps grow.
**Action:** Always iterate directly over the Map iterators (`map.entries()`, `map.values()`) in `for...of` loops to maintain lazy, O(1) memory evaluation.
