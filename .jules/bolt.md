## 2025-02-23 - React List Virtualization and Memoization
**Learning:** Extracting list items into `React.memo` wrapped components is critical for dashboards with interactive elements (modals, filters) in the parent scope. In `BlockWalletDigi`, opening a modal caused the entire credential list to re-render unnecessarily.
**Action:** Always check `map` loops in React. If the list is potentially long or complex, and the parent has other state, extract the item to a memoized component.
