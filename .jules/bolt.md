## 2025-04-22 - Parallelize independent IO operations
**Learning:** Sequential `for...of` loops with `await` can become a significant performance bottleneck when processing multiple independent items that require network requests or database writes.
**Action:** Use `await Promise.all(array.map(async item => { ... }))` to parallelize independent operations where order does not matter.
