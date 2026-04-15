## 2024-04-15 - Aggressive Default Polling Intervals
**Learning:** Default polling intervals of 5000ms-10000ms on non-realtime dashboards cause unnecessary re-renders and network load, degrading frontend performance and increasing backend load without UX benefit.
**Action:** Standardize dashboard polling intervals to 30000ms-60000ms unless real-time updates are explicitly required for the user flow.
