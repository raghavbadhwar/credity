## 2024-05-24 - Early Returns in Main-Thread Array Processing
**Learning:** Synchronous operations like evaluating image data arrays on the main thread inside setInterval can block the UI. The liveness check (use-face-detection.ts) processed every single pixel in the image even after its thresholds (e.g., 2% motion, 15% skin) were already met.
**Action:** Always refactor O(n) array loops inside high-frequency functions (like requestAnimationFrame or setInterval) to track cumulative thresholds and return/break as early as possible to free the main thread.
