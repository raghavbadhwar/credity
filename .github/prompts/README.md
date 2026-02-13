# Copilot Prompt Files

These prompt files define role-based agent behaviors for CredVerse.

## Quick Start (Recommended)

1. Open Copilot Chat in VS Code
2. Type `/agent-router` 
3. Describe your task naturally
4. The router will automatically:
- select the best primary role
- identify collaborators for cross-role tasks
- choose task-specific skills and tool classes
- switch to swarm mode for parallel independent workstreams
- enforce inter-agent message-bus handoffs in multi-lane tasks

## Manual Role Selection

If you prefer to select a specific role:
1. Open Copilot Chat
2. Type `/` and choose a prompt file (e.g., `/backend-lead.prompt`)
3. Continue your request

## Available Roles

- agent-router.prompt.md ← **Start here** (auto-selects role)
- product-lead.prompt.md
- ux-lead.prompt.md
- frontend-lead.prompt.md
- mobile-lead.prompt.md
- backend-lead.prompt.md
- data-ml-lead.prompt.md
- security-lead.prompt.md
- qa-lead.prompt.md
- devops-lead.prompt.md
- api-integration-lead.prompt.md
- docs-lead.prompt.md
- compliance-lead.prompt.md
- growth-lead.prompt.md
- support-ops-lead.prompt.md
- release-manager.prompt.md
