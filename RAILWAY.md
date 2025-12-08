# Credity Monorepo - Railway Deployment

This is a monorepo with multiple apps. To deploy on Railway:

## Option 1: Deploy Individual Apps (Recommended)

1. In Railway, click on your service
2. Go to **Settings** → **Build** section
3. Set **Root Directory** to one of:
   - `CredVerseIssuer 3` (Issuer Dashboard)
   - `CredVerseRecruiter` (Recruiter Portal)
   - `BlockWalletDigi` (Student Wallet)
   - `credverse-gateway` (Landing Page)
4. Click **Deploy** to redeploy

## Option 2: Deploy via CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy specific app
cd "CredVerseIssuer 3"
railway up
```
