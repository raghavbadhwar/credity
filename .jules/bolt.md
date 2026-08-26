## 2024-05-24 - Early returns in synchronous image processing
**Learning:** Biometric liveness checks (`ImageData` processing) in BlockWalletDigi run synchronously on the main thread, causing UI stutter during intensive O(n) pixel loops if the entire frame is processed unnecessarily.
**Action:** Always implement early returns/loop breaks in image processing algorithms as soon as thresholds (e.g., motion % or skin %) are met to free up the main thread.
EOF && cat .jules/bolt.md
## 2024-05-24 - Early returns in synchronous image processing
**Learning:** Biometric liveness checks (\`ImageData\` processing) in BlockWalletDigi run synchronously on the main thread, causing UI stutter during intensive O(n) pixel loops if the entire frame is processed unnecessarily.
**Action:** Always implement early returns/loop breaks in image processing algorithms as soon as thresholds (e.g., motion % or skin %) are met to free up the main thread.
