## 2024-05-18 - Replacing Array.from with direct Map Iteration
**Learning:** In Node.js/TypeScript, using `Array.from(map.entries())` or `Array.from(map.values())` inside loops can create unnecessary array allocations, converting a memory-efficient Map iteration into a less efficient array conversion, creating overhead specifically in scenarios iterating through large datasets repeatedly.
**Action:** Replace `Array.from(map.values())` with `map.values()` in `for...of` loops, as Map iterables can be directly iterated over in standard JS.
