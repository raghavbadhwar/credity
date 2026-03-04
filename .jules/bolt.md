
## 2024-03-04 - [React Context Overhead in Tooltips]
**Learning:** Found an anti-pattern where standard shadcn/ui generic component usage (`Tooltip`) instantiates a new `TooltipProvider` for every single instance mapped in a list (like `ScoreSection` in `TrustScoreCard`). This breaks the orchestration of tooltips (preventing multiple open simultaneously) and causes unneeded context initializations on render cycles.
**Action:** Always verify if a global `TooltipProvider` already exists in `App.tsx` or layout wrappers. If it does, remove local `TooltipProvider` wrappers from nested components to reduce React component tree depth and memory overhead.
