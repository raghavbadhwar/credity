## 2024-05-27 - [ImageData main thread processing bottleneck]
**Learning:** Biometric liveness checks iterating through `ImageData` pixel arrays synchronously in React components can cause UI stutter if they don't break early once thresholds are met.
**Action:** Ensure large nested loops iterating over canvas frame data on the main thread implement early return or break conditions as soon as confidence limits are satisfied to drop unnecessary computation.
