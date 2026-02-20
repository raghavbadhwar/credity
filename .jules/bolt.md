## 2024-05-23 - Memoizing Render-Intensive Lists in Dashboard
**Learning:** React components that render large lists of complex items (with animations, icons, etc.) inside a parent component that has frequent state updates (like modals, search filters) should be memoized to prevent unnecessary re-renders of the entire list. Even simple helpers like `getCategoryColor` if defined inline can cause prop changes that break memoization.
**Action:** Extract list items into separate `memo`ized components and move helper functions outside the component or to a utility file.
