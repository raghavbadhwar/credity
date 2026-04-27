## 2025-04-21 - Memoizing Array Operations in React Dashboards
**Learning:** Frequently re-rendering React components (like dashboards with live polling or user input state) can suffer from performance degradation if expensive array operations (like `.filter()`, string matching, or aggregate calculations) are performed directly in the component body, as they re-execute on every render.
**Action:** Always wrap expensive array operations and derived state calculations with `useMemo` in components that re-render frequently, ensuring they only recompute when their explicit dependencies change.
