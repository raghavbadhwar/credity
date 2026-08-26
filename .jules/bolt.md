## 2024-05-22 - [Backend Performance] In-Memory Storage Indexing
**Learning:** `MemStorage` without secondary indices performs O(N) scans on every list operation, causing linear slowdown as data grows. Adding `Map<UserId, ItemIds[]>` reduces lookup to O(K) (where K is user's item count).
**Action:** Always implement secondary indices for frequent lookups (like `findByUserId`) in in-memory storage implementations, and crucially, rebuild them during state hydration (`importState`).

## 2024-05-22 - [Testing Strategy] Benchmarking in Restricted Environments
**Learning:** In environments with restricted network/dependencies where full test suites fail, creating a standalone, dependency-minimal benchmark script (using `performance.now()`) is the most reliable way to verify performance improvements and functional correctness of isolated modules.
**Action:** Prioritize writing a temporary benchmark script to validate optimizations when the main test runner is unreliable.

## 2024-05-22 - [Linting] TypeScript Any and Unused Variables
**Learning:** Strict linting configurations (no-explicit-any, no-unused-vars) in CI can block PRs even if the code works. Legacy code often contains many violations.
**Action:** When modifying existing files with lint errors, prioritize fixing only the lines touched or related to the change using `// eslint-disable-next-line` if a proper fix is too risky or out of scope. For small projects (like `credverse-gateway`), fixing all lint errors is a viable "scout rule" improvement.
