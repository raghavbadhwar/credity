## 2025-05-05 - Biometric loop optimization in use-face-detection
**Learning:** Biometric liveness checks traversing `ImageData` pixel arrays loop over hundreds of thousands of pixels on the main thread at 5 FPS, which can severely stutter the UI if not short-circuited.
**Action:** When evaluating threshold-based image heuristics (like % of skin-tone pixels or % motion change), calculate the required threshold upfront and early-return/break from O(n) loops as soon as the threshold is met to prevent unnecessary processing.
