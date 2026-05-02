## 2025-05-02 - Synchronous Array Iteration Stutter
**Learning:** Biometric liveness checks running intensive synchronous pixel-by-pixel comparisons on `ImageData` arrays on the main thread at 5 FPS can cause severe UI stutter if allowed to complete full O(n) iterations.
**Action:** Always implement early returns (`break` or `return`) to escape large array processing loops as soon as threshold requirements are satisfied.
