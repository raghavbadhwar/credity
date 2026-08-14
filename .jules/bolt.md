## 2024-05-22 - Persistent Linting Failures (Part 2)
**Learning:** `BlockWalletDigi` and `CredVerseRecruiter` still have persistent lint errors that I missed or were not fully covered by the "Fast refresh" suppression.
1. `CredVerseRecruiter`:
    - `BulkVerify.tsx`: Unused `Filter` (line 7), `Unexpected any` (lines 19, 29, 40, 42).
    - `DashboardLayout.tsx`: Unused `ScrollArea` (line 3).
2. `CredVerseIssuer`:
    - `use-wallet.ts`: `Unexpected any` (lines 7, 8, 9, 93).
    - `use-toast.ts`: `actionTypes` unused (line 18).
3. `BlockWalletDigi`:
    - `use-biometrics.ts`: `setIsSupported` unused (line 32).
    - `React Hook useEffect has a missing dependency: 'startCamera'` in `.github`? This error is weird but persists. I should check `BlockWalletDigi/client/src/hooks/use-face-detection.ts` or similar based on the context of `startCamera`.

**Action:**
- Fix `BulkVerify.tsx` unused var and suppress `any`.
- Fix `DashboardLayout.tsx` unused var.
- Fix `use-wallet.ts` (Issuer) `any` issues.
- Fix `use-biometrics.ts` (BlockWallet) unused var.
- Re-check `use-toast.ts` in Issuer.

**Plan:**
1.  Read `CredVerseRecruiter/client/src/pages/BulkVerify.tsx` and `CredVerseRecruiter/client/src/components/layout/DashboardLayout.tsx`.
2.  Read `CredVerseIssuer 3/client/src/hooks/use-wallet.ts` and `CredVerseIssuer 3/client/src/hooks/use-toast.ts`.
3.  Read `BlockWalletDigi/client/src/hooks/use-biometrics.ts`.
4.  Apply fixes: remove unused vars, suppress `any`.
5.  Verify by running lint locally where possible.
