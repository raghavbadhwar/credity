## 2024-03-30 - useMemo without memoized children
**Learning:** Adding useMemo to variables (like `filteredStudents` in React) without explicit child component memoization (e.g., `React.memo`) does not prevent re-renders, making it a useless micro-optimization.
**Action:** Always verify if child components are memoized before applying useMemo to props.
