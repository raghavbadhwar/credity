## 2024-05-24 - Main Thread ImageData Processing Stutter
**Learning:** Processing large `ImageData` arrays synchronously on the main thread for liveness checks can cause severe UI stutter if loops iterate over every pixel indiscriminately.
**Action:** Always implement early returns or breaks in O(n) image processing loops as soon as positive detection thresholds are met to reduce main thread blocking.
