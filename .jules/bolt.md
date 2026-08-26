## 2025-04-21 - Memoizing Derived Search Arrays
**Learning:** Found a recurring pattern in dashboards where filtered lists (derived directly from API queries and a search string) are re-calculated on every render, leading to unnecessary operations on unrelated UI state changes.
**Action:** Always wrap arrays that filter `useQuery` results based on local state variables in `useMemo` to ensure they only recalculate when their dependencies change.
