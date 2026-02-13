# Copilot instructions for CredVerse (AI agents only)

## Big picture
- Monorepo with four primary products: Issuer (CredVerseIssuer 3), Recruiter (CredVerseRecruiter), Wallet (BlockWalletDigi), and the public portal (credverse-gateway), plus a mobile Expo app in apps/mobile (see README.md).
- credverse-gateway is a Vite React client plus an Express server; treat client and server as separate dev processes (package.json scripts).
- Shared auth is centralized in packages/shared-auth and consumed by services like credverse-gateway and BlockWalletDigi (package.json dependencies).
- GCP deployment baseline is in infra/gcp for Cloud Run + Cloud SQL in asia-south1 (infra/gcp/README.md, cloudrun/env.example.yaml).

## Local dev workflows
- Root scripts are mobile-only: npm run mobile:dev | mobile:android | mobile:ios | mobile:web (package.json).
- credverse-gateway: npm run dev (Vite client), npm run dev:server (Express server), npm run dev:full (both), npm run test:proxy (server/routes/mobile-proxy.test.ts).
- BlockWalletDigi: npm run dev:client (Vite client on port 5000), npm run dev (Express server), npm run db:push (drizzle-kit push).
- Mobile app (apps/mobile): npm run start (Expo LAN), typecheck with npm run typecheck (apps/mobile/package.json).

## Service ports and expectations
- Issuer: 3000 / 5001, Wallet: 5173 / 5002, Recruiter: 5174 / 5003, Gateway: 5173 (README.md).
- Mobile app expects local services running and uses EXPO_PUBLIC_GATEWAY_URL; set to LAN IP for device testing (apps/mobile/README.md).
- If issuer APIs are protected, set EXPO_PUBLIC_ISSUER_API_KEY in apps/mobile/.env (apps/mobile/README.md).

## Conventions and guardrails
- Keep server/client separation in credverse-gateway and BlockWalletDigi; use their script/build.ts for production builds.
- Use packages/shared-auth instead of re-implementing auth logic in individual services.
- Do not introduce mock data unless explicitly asked.
- For production Cloud Run, respect infra/gcp notes: REQUIRE_DATABASE=true, REQUIRE_QUEUE=true, ALLOW_DEMO_ROUTES=false.

## Integration points
- Express servers are the API layer (credverse-gateway/server, BlockWalletDigi/server); Vite clients live in their respective client/src.
- Shared auth package is the cross-service integration for authentication behavior.

## Key reference paths
- Architecture overview: README.md
- Gateway app: credverse-gateway/
- Wallet app: BlockWalletDigi/
- Mobile app: apps/mobile/
- GCP deployment: infra/gcp/

## Agent prompt files
- Role-based Copilot prompt files are in .github/prompts/
- **Recommended:** Use `/agent-router` for automatic role selection
- Or manually select a specific role with '/' + prompt file name
