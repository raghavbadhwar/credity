## 2026-02-13 - Manual Fetching vs React Query
**Learning:** The app is configured with React Query (QueryClientProvider in App.tsx) but critical screens like `HolderDashboardScreen` were using manual `useEffect` + `useState` + `Promise.all`. This caused unnecessary re-fetches, lack of caching, and coupled data fetching with biometric authentication logic.
**Action:** When optimizing screens in this codebase, check if they are using manual fetching and migrate them to `useQuery` hooks to leverage existing caching configuration and decouple fetching from side effects like biometrics.
