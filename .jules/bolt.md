## 2024-05-24 - O(n) Array Scans in React Hooks
**Learning:** Liveness verification routines performing O(n) pixel calculations on every tick across a 640x480 video frame can cause significant frontend jitter because the nested loop doesn't short-circuit once thresholds are met.
**Action:** Always pre-calculate pixel thresholds for image analysis and incorporate early returns `break` or `return` inside loops.
