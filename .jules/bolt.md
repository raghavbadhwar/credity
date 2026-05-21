## 2024-05-24 - Early Returns in Main Thread Pixel Loops
**Learning:** Biometric liveness checks (`ImageData` processing) run synchronously on the UI thread inside intervals (e.g. 5FPS). Running full loops `O(N)` over canvas pixels without breaking causes severe UI stutter.
**Action:** Always implement early return/`break` mechanics when calculating pixel threshold percentages in continuous biometric intervals to keep main thread execution sub-10ms.
