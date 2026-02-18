## 2026-02-18 - BlockWalletDigi Frontend Verification
**Learning:** `BlockWalletDigi` dashboard requires backend API (`/api/wallet/init`) to render content. Running the dev server (`npm run dev`) starts both backend and frontend, but the backend fails without DB/Auth envs.
**Action:** Use Playwright `page.route()` to mock API responses when verifying frontend changes to bypass backend dependency and database requirements.
