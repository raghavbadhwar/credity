# Credity Deployment Checklist

## ✅ Security Improvements Complete
All critical security vulnerabilities have been addressed. The codebase is ready for deployment after completing the checklist below.

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Configuration ⚠️ CRITICAL

Before deploying, you **MUST** configure the following environment variables:

#### Required for All Services

```bash
# JWT Authentication (Generate using: openssl rand -hex 64)
JWT_SECRET=<your-64-character-random-secret>
JWT_REFRESH_SECRET=<your-64-character-random-secret>

# Database
DATABASE_URL=postgresql://user:password@host:5432/credity

# Server
NODE_ENV=production
PORT=3000
```

#### Required for CredVerseIssuer

```bash
# Blockchain Configuration
BLOCKCHAIN_PRIVATE_KEY=0x<your-secure-private-key>
BLOCKCHAIN_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<your-api-key>
REGISTRY_CONTRACT_ADDRESS=0x<deployed-contract-address>

# CORS (Comma-separated allowed origins)
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

**⚠️ WARNING**: Without these environment variables set, the application will:
- Generate random JWT secrets per session (tokens won't persist across restarts)
- Run blockchain service in read-only mode
- Log critical security warnings

### 2. Smart Contract Deployment

Before deploying backend services, you need to deploy the CredVerseRegistry smart contract:

```bash
cd "CredVerseIssuer 3/contracts"

# 1. Set environment variables
export DEPLOYER_PRIVATE_KEY=<your-private-key>
export SEPOLIA_RPC_URL=<your-rpc-url>

# 2. Compile the contract
npx hardhat compile

# 3. Deploy to testnet (Sepolia)
npx hardhat run scripts/deploy.js --network sepolia

# 4. Verify on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>

# 5. Update .env with deployed contract address
echo "REGISTRY_CONTRACT_ADDRESS=<CONTRACT_ADDRESS>" >> ../../.env
```

### 3. Database Setup

Ensure PostgreSQL is properly configured:

```bash
# 1. Create database
createdb credity

# 2. Run migrations (if any)
npm run migrate

# 3. Test database connection
psql $DATABASE_URL -c "SELECT 1"
```

### 4. Infrastructure Requirements

#### Production Server Requirements
- [ ] HTTPS/TLS certificate configured (Let's Encrypt recommended)
- [ ] Firewall rules configured (only expose necessary ports)
- [ ] Redis instance for token/rate-limit storage (recommended)
- [ ] Database backups configured
- [ ] Monitoring and logging setup (e.g., DataDog, New Relic)

#### Recommended Services
- [ ] CDN for frontend assets (Cloudflare, AWS CloudFront)
- [ ] Load balancer for high availability
- [ ] Container orchestration (Docker, Kubernetes) for scalability

### 5. Security Hardening

#### CORS Configuration
Update your production server to use strict CORS:

```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

#### Security Headers
Add security headers to all responses:

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

#### Rate Limiting with Redis
Replace in-memory rate limiting with Redis:

```bash
npm install redis ioredis express-rate-limit rate-limit-redis
```

### 6. Testing Before Deployment

Run all tests to ensure nothing is broken:

```bash
# Backend tests
cd "CredVerseIssuer 3"
npm test

# Smart contract tests
cd contracts
npx hardhat test

# Integration tests
npm run test:integration
```

### 7. Deployment Steps

#### Option A: Traditional Deployment

```bash
# 1. Build all services
npm run build

# 2. Copy .env file to production server
scp .env user@server:/path/to/app/

# 3. Start services with PM2 (recommended)
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Option B: Docker Deployment

```bash
# 1. Build Docker images
docker-compose build

# 2. Push to registry
docker-compose push

# 3. Deploy on production
docker-compose -f docker-compose.prod.yml up -d
```

#### Option C: Cloud Platform Deployment

**Vercel/Netlify (Frontend)**
```bash
# Frontend (credverse-gateway)
cd credverse-gateway
vercel deploy --prod
```

**Heroku/Railway (Backend)**
```bash
# Configure environment variables in dashboard
heroku config:set JWT_SECRET=xxx
heroku config:set DATABASE_URL=xxx

# Deploy
git push heroku main
```

### 8. Post-Deployment Verification

After deployment, verify everything is working:

```bash
# 1. Health check
curl https://yourdomain.com/health

# 2. Test authentication
curl -X POST https://yourdomain.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test123!@#"}'

# 3. Test blockchain connection
curl https://yourdomain.com/api/blockchain/status

# 4. Monitor logs
tail -f /var/log/credity/app.log
```

### 9. Monitoring Setup

Set up monitoring for:
- [ ] Application uptime
- [ ] API response times
- [ ] Error rates
- [ ] Database performance
- [ ] Blockchain transaction status
- [ ] Security events (failed login attempts, etc.)

Recommended tools:
- **Uptime**: UptimeRobot, Pingdom
- **Logging**: LogRocket, Sentry
- **Metrics**: Prometheus + Grafana
- **Blockchain**: Etherscan API alerts

### 10. Backup Strategy

Set up regular backups:
- [ ] Database backups (daily automated)
- [ ] Configuration backups
- [ ] Smart contract verification artifacts
- [ ] User data backups (if applicable)

## 🚀 Deployment Readiness Score

Check off all items above. You should have:
- ✅ All environment variables configured
- ✅ Smart contract deployed and verified
- ✅ Database properly set up
- ✅ HTTPS/TLS enabled
- ✅ Security headers configured
- ✅ All tests passing
- ✅ Monitoring and logging configured
- ✅ Backup strategy in place

## ⚠️ Important Notes

1. **Never commit secrets**: The `.env` file is in `.gitignore`. Keep it that way.
2. **Smart contract is immutable**: Once deployed, you cannot change it. Test thoroughly on testnet first.
3. **Rate limiting**: In-memory rate limiting won't work with multiple instances. Use Redis.
4. **Token storage**: Move from in-memory to Redis for production.
5. **Regular updates**: Keep dependencies updated for security patches.

## 📞 Support

If you encounter issues during deployment:
1. Check the logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure database migrations have run successfully
4. Check blockchain node connectivity
5. Review SECURITY.md for additional security considerations

## 🔄 Rollback Plan

If deployment fails:
1. Keep previous version running during deployment
2. Use blue-green deployment strategy
3. Have rollback scripts ready:
   ```bash
   pm2 reload previous-version
   # or
   kubectl rollout undo deployment/credity-app
   ```

## ✅ Ready to Deploy?

If you've completed this checklist, your Credity application is ready for deployment with the enhanced security measures in place!

**Last Updated**: December 8, 2025
**Security Audit Version**: 1.0
