## 2024-05-22 - Frontend List Optimization
**Learning:** Extracting list items to memoized components prevents unnecessary re-renders of the entire list when unrelated state updates (like modal visibility or counters). Also, duplicate inline helper functions should be extracted to utilities to avoid recreation on every render.
**Action:** Always check `map` loops in main dashboard components for inline complex render logic and extract them to memoized components.
