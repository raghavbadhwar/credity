
## 2024-05-24 - Fix N+1 bottleneck in Bulk Verification
**Learning:** In the CredVerseRecruiter workspace, bulk verification looped sequentially over credentials performing remote issuer DID verification calls (an N+1 waterfall).
**Action:** Always look for independent `await` calls in loops when processing large arrays (like bulk verification) and swap them for `Promise.all` to execute the remote API calls concurrently.
