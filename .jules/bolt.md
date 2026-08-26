## 2025-02-28 - Optimizing bulk verification with Promise.all
**Learning:** Sequential processing in bulk credential verification caused unnecessary blocking (N+1-like issue). Using `Promise.all` allows for concurrent verification of credentials, significantly improving performance for large batches without sacrificing readability.
**Action:** Always check array iterations (`for...of` loops) containing `await` inside loops, especially in bulk operations. Replace them with `Promise.all(array.map(...))` to process independently resolvable async operations concurrently.
