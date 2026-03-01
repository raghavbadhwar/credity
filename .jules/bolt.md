
## $(date +%Y-%m-%d) - [Storage Memory Indexing]
**Learning:** Optimizing `MemStorage` to avoid O(N) queries during hydration requires careful reference management. When returning array indices from in-memory Maps, exposing direct references (e.g., `return this.activitiesByUserId.get(id) || []`) creates a regression where external consumers can mutate the internal database state.
**Action:** Always return a new shallow copy (`[...items]`) when returning array sets from in-memory storage implementations.
