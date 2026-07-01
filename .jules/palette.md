## 2026-07-01 - Add aria-expanded to collapsible breakdown button
**Learning:** Custom collapsible components (like the Score Breakdown in TrustScoreCard) often lack native state communication for screen readers.
**Action:** Always add `aria-expanded` attributes to buttons controlling custom collapsible sections, bound to the same state driving the UI expansion, so screen readers can announce the current state.
