## 2024-03-29 - [Optimization that didn't work: useMemo without memoized children]
**Learning:** Wrapping an inline array or object in `useMemo` to preserve referential equality is a completely useless micro-optimization if the child components receiving that value are not themselves memoized (e.g., using `React.memo()`). The child will re-render anyway when the parent renders, making the `useMemo` overhead pointless and providing zero measurable performance impact.
**Action:** Never apply `useMemo` or `useCallback` purely for referential equality unless it is explicitly passed to a child component that is wrapped in `React.memo()` or used as a dependency in a `useEffect` hook. Always verify the child is actually memoized before attempting this optimization.

## 2024-03-29 - [Preventing heavy re-renders with React.memo]
**Learning:** Components that render complex, heavy UIs (like the `TrustScoreCard` breakdown) and fetch their own data internally can still be forced to re-render completely if their parent component (like `Dashboard`) re-renders due to independent state updates (e.g., polling for notifications).
**Action:** Always wrap heavy child components in `React.memo()`, even if they take no props, when placed inside frequently updating parents to prevent cascading re-renders.
