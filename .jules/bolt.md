## 2025-04-22 - Deterministic result processing with Promise.all
**Learning:** Using `Promise.all` directly on a `.map()` callback that causes side-effects (like pushing to an array) can result in non-deterministic array ordering and may trigger linter rules like `array-callback-return`.
**Action:** Always return a structured result (e.g., `{ success: true, data }`) from the `.map()` callback and iterate over the settled array of promises sequentially to perform deterministic aggregation and side-effects.
