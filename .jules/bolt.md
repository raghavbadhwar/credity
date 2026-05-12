## 2024-05-12 - Synchronous ImageData array processing blocking main thread
**Learning:** Processing 640x480 `ImageData` arrays synchronously on the main thread during WebRTC streams blocks execution unnecessarily when checking boolean threshold conditions (e.g., >2% motion or >15% skin color).
**Action:** Always implement early returns inside O(n) pixel iteration loops the moment the required threshold count is met, rather than processing the entire array unconditionally.
