## 2024-07-03 - Avoid Array.from() during Map iteration
**Learning:** Found a recurring anti-pattern where Maps are converted to arrays via `Array.from(map.entries())` or `Array.from(map.values())` just to be iterated over using a `for...of` loop. This causes unnecessary O(n) memory allocation.
**Action:** Always iterate directly over iterators like `map.entries()` or `map.values()` using `for...of` loops, as they are fully supported in Node.js/TypeScript and avoid intermediate array allocations.
