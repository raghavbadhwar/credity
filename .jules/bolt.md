## 2024-05-22 - Persistent Linting Failures
**Learning:** Even after my initial fixes, many lint errors remain. Specifically:
1. `BlockWalletDigi`:
    - `Fast refresh only works when a file only exports components` in `ui/navigation-menu.tsx`, `ui/form.tsx`, `ui/button.tsx`, `ui/button-group.tsx`, `ui/badge.tsx`. This usually means a utility or constant is exported alongside the component.
    - `Unexpected any` in `.github` (which seems odd, likely linting config files or hidden files?). Wait, the annotation says `File: .github`. This is likely a misinterpretation of the file path by the reporter or the lint error is in a workflow file? No, checking the logs, the error is in `/home/runner/work/credity/credity/.github/...`? Or maybe it's misreporting the file. Let me check the logs more closely.
    - Ah, looking at `BlockWalletDigi` logs:
      `[FAILURE] File: .github, Line: 259 Message: Unexpected any.`
      This is very strange.
    - `React Hook useEffect has a missing dependency: 'startCamera'` in `.github`? This suggests `.github` might be a directory being linted that contains JS/TS files?
2. `CredVerseRecruiter`:
    - `Save` and `Lock` unused in `AdminConsole.tsx`. I missed these in the previous cleanup.
    - `Fast refresh` errors in `ui/*` components.
3. `credverse-gateway`:
    - `sentryErrorHandler` unused in `index.ts`. I thought I fixed this? Maybe I removed the usage but not the import, or vice versa?
    - `error` unused in `index.ts`.
    - `hint` unused in `sentry.ts`.
    - `Unexpected any` in `mobile-proxy.ts`.

**Action:**
- I must fix the "Fast Refresh" errors by ensuring components are the *only* exports, or suppress the warning if it's a false positive in library code.
- Fix the remaining unused variables in `AdminConsole.tsx`.
- Investigate why `credverse-gateway` fixes didn't stick or were incomplete.
- The `.github` file errors are confusing. I need to find what file this actually is.

**Plan:**
1.  Check `CredVerseRecruiter/client/src/pages/AdminConsole.tsx` again.
2.  Check `credverse-gateway/server/index.ts`.
3.  Check `credverse-gateway/server/services/sentry.ts`.
4.  Check `BlockWalletDigi/client/src/components/ui/*.tsx` for multiple exports.
5.  Search for files in `.github` that might be getting linted.
