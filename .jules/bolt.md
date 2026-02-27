## 2024-05-22 - CI Failure Analysis
**Learning:** Removing `CredentialCard` caused a ripple effect of linting errors in `BlockWalletDigi` because imports were likely not fully cleaned up or shared dependencies triggered new checks.
**Action:**  Thoroughly check all imports and re-run lint locally (`npm run lint` in `BlockWalletDigi`) before submitting. The "unused variable" errors suggest `CredentialCardSkeleton` might still be imported but now unused, or other latent lint issues were exposed.

**Specific Failures to Address:**
1.  **CredVerseRecruiter**: `Input` defined but never used in `AdminConsole.tsx`, `actionTypes` unused in `use-toast.ts`, and `Fast refresh` errors in UI components.
2.  **CredVerseIssuer**: Similar patterns - `Unexpected any`, `Fast refresh` errors, unused variables in multiple files.
3.  **BlockWalletDigi**:
    *   `CredentialCardSkeleton` defined but unused in `dashboard.tsx` (Directly related to my change!).
    *   `Fast refresh` errors in `theme-provider.tsx`.
    *   `BarChart3` unused in `sidebar.tsx`.
    *   `scanning` unused in `qr-scanner.tsx`.
    *   `Settings` unused in `nav.tsx`.
    *   Missing deps in `useEffect` in `identity-verification.tsx`.
4.  **credverse-gateway**: Unused variables (`cors`, `sentryErrorHandler`, `hint`), `prefer-const` violations.

**Strategy:**
I need to fix the specific lint errors in `BlockWalletDigi` that I likely exacerbated (or at least the one I directly caused: `CredentialCardSkeleton`).
I also need to address the other reported failures to ensure a clean CI run, as the system seems to require *all* checks to pass.
Prioritize `BlockWalletDigi` fixes first.
