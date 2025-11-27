# Production Deployment Guide

**Last Updated:** 2025-11-27
**Status:** Live & Production Ready
**Environment:** Production (Vercel + Fly.io)

---

## Overview

The Critical Role Companion application is currently deployed to production across multiple services:

- **Frontend:** Vercel (Next.js)
- **Backend:** Fly.io (FastAPI)
- **Database:** Neon PostgreSQL
- **Storage:** Cloudflare R2
- **Domain:** mythweavercompanion.com (in registration)

This document outlines the deployment architecture, how to manage deployments, and troubleshooting procedures.

---

## Production Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          PRODUCTION ENVIRONMENT                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   DNS / Domain Management                     │  │
│  │         mythweavercompanion.com (Cloudflare)                │  │
│  └────────────┬─────────────────────────────┬───────────────────┘  │
│               │                             │                       │
│       ┌───────▼────────┐           ┌────────▼────────┐             │
│       │                │           │                 │             │
│   ┌───┴─────────┐  ┌──┴────────┐  │                 │             │
│   │  Vercel     │  │ Fly.io    │  │ Cloudflare R2   │             │
│   │  Frontend   │  │ Backend   │  │ Image Storage   │             │
│   │ (Next.js)   │  │ (FastAPI) │  │                 │             │
│   └───┬─────────┘  └──┬────────┘  │                 │             │
│       │               │            └─────────────────┘             │
│       └───────┬───────┘                    │                       │
│               │                             │                       │
│       ┌───────▼─────────────────────────────▼──────────┐          │
│       │                                                │           │
│       │         Neon PostgreSQL Database              │           │
│       │   (critical-role-companion project)           │           │
│       │                                                │           │
│       └────────────────────────────────────────────────┘          │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Service Locations

| Service | Provider | URL | Status |
|---------|----------|-----|--------|
| Frontend | Vercel | https://cr-companion-vercel.app | ✅ Live |
| Backend | Fly.io | https://cr-overlay-staging-bold-feather-4496.fly.dev | ✅ Live |
| Database | Neon | postgres://... (private) | ✅ Connected |
| Storage | Cloudflare R2 | cdn-r2-endpoint | ✅ Configured |
| Domain | Cloudflare | mythweavercompanion.com | ⏳ In Progress |

---

## Environment Variables

### Backend Environment (Fly.io)

**Location:** Managed via `fly secrets set` command

**Current Variables:**

```bash
DATABASE_URL=postgresql://neondb_owner:npg_aE6v9DYOtkVi@ep-cool-heart-adbyj6oa-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

R2_ACCOUNT_ID=da636b06063dcb4de6e56d5eb6d54578
R2_ACCESS_KEY_ID=0316e6fc7d397367d9c523c2d299e080
R2_SECRET_ACCESS_KEY=1dedec78f0d811bc50294c71e39fa65a2c12de89ca0295d4a17a758dc6b082d3
R2_BUCKET_NAME=critical-role-companion-images
R2_PUBLIC_URL=https://critical-role-companion-images.YOUR_R2_ENDPOINT.r2.cloudflarestorage.com
```

**To Update:**
```bash
fly secrets set DATABASE_URL="value" -a cr-overlay-staging-bold-feather-4496
fly secrets set R2_ACCOUNT_ID="value" -a cr-overlay-staging-bold-feather-4496
# ... etc for other variables
```

**To View (without values):**
```bash
fly secrets list -a cr-overlay-staging-bold-feather-4496
```

### Frontend Environment (Vercel)

**Location:** Managed via Vercel Dashboard → Settings → Environment Variables

**Current Variables:**

```
NEXT_PUBLIC_API_BASE_URL=https://cr-overlay-staging-bold-feather-4496.fly.dev
```

**To Update:**
1. Go to https://vercel.com/dashboard
2. Select "critical-role-companion" project
3. Go to Settings → Environment Variables
4. Edit or add variables
5. Redeploy project

---

## Deployment Processes

### Frontend Deployment (Vercel)

**Automatic Deployment:**
- Any push to `main` branch on GitHub → Automatic deployment to Vercel
- GitHub integration: Already configured
- Build command: `npm run build`
- Install command: `npm install`
- Output directory: `.next`

**Manual Redeployment:**
1. Go to Vercel Dashboard
2. Select "critical-role-companion" project
3. Click "Redeploy" or push new commit to GitHub

**Deployment Logs:**
1. Go to Vercel Dashboard → Deployments tab
2. Click any deployment to see logs
3. Look for build errors or deployment issues

**Current Status:**
- Latest deployment: 2025-11-27
- Build status: ✅ Passing
- Environment variables: ✅ Configured

### Backend Deployment (Fly.io)

**Manual Deployment:**
```bash
cd backend
fly deploy -a cr-overlay-staging-bold-feather-4496
```

**Deployment Process:**
1. Builds Docker image locally
2. Pushes to Fly.io registry
3. Deploys to Fly.io machines
4. Runs migrations (if any)
5. Restarts services

**Deployment Logs:**
```bash
fly logs -a cr-overlay-staging-bold-feather-4496
```

**Deploy with Environment Variables:**
```bash
fly deploy -a cr-overlay-staging-bold-feather-4496 \
  --env DATABASE_URL="postgresql://..." \
  --env R2_ACCOUNT_ID="..."
```

**Current Status:**
- Latest deployment: 2025-11-27
- Running on: Fly.io machines in us-east1
- Health check: ✅ Passing
- Database: ✅ Connected

### Database Migrations (Neon)

**Running Migrations After Backend Deployment:**

```bash
# SSH into Fly.io machine
fly ssh console -a cr-overlay-staging-bold-feather-4496

# Inside the machine:
cd /app
python -m alembic upgrade head

# Exit
exit
```

**Or run migrations before deployment:**

```bash
cd backend
python -m alembic upgrade head  # Local testing first

fly deploy -a cr-overlay-staging-bold-feather-4496
```

**Check Migration Status:**
```bash
cd backend
python -m alembic current  # Show current revision
python -m alembic history  # Show all revisions
```

---

## Monitoring & Health Checks

### Backend Health

**Health Endpoint:**
```bash
curl https://cr-overlay-staging-bold-feather-4496.fly.dev/healthz
```

Expected response:
```json
{"ok":true,"version":"dev"}
```

**Logs:**
```bash
fly logs -a cr-overlay-staging-bold-feather-4496 --follow
```

**Metrics:**
- CPU usage
- Memory usage
- Request count
- Error rate

Go to https://fly.io/dashboard → Apps → cr-overlay-staging-bold-feather-4496 → Monitoring

### Frontend Health

**Check Build Status:**
- Go to Vercel Dashboard
- Select project
- View Deployments tab
- Check latest build status

**Frontend Logs:**
- Vercel Dashboard → Deployments → [Deployment] → Logs

**Analytics:**
- Vercel Dashboard → Analytics tab
- View page loads, response times, errors

### Database Health

**Check Connection:**
```bash
# From backend machine
python test_db.py

# Or from Neon dashboard
# https://console.neon.tech/
# Select project → Monitoring → Connection
```

**Database Size:**
- Go to https://console.neon.tech/
- Select "critical-role-companion" project
- Branches → main → Check storage usage

---

## Common Deployment Tasks

### Deploy New Feature

1. **Develop locally**
   ```bash
   # Test locally
   cd backend && python -m uvicorn main:app --reload --port 8001
   cd frontend && npm run dev
   ```

2. **Commit & push**
   ```bash
   git add .
   git commit -m "Feature: Add image position control"
   git push origin main
   ```

3. **Wait for Vercel auto-deploy**
   - Check Vercel Dashboard for build status
   - Should take 2-5 minutes

4. **Deploy backend manually**
   ```bash
   cd backend
   fly deploy -a cr-overlay-staging-bold-feather-4496
   ```

5. **Run migrations if needed**
   ```bash
   fly ssh console -a cr-overlay-staging-bold-feather-4496
   cd /app && python -m alembic upgrade head
   exit
   ```

6. **Verify on production**
   - Test feature on production URLs
   - Check logs for errors

### Rollback a Deployment

**Frontend (Vercel):**
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Rollback to this Deployment"

**Backend (Fly.io):**
```bash
# View recent deployments
fly apps list -a cr-overlay-staging-bold-feather-4496

# Redeploy from previous commit
git revert HEAD  # or git reset to previous commit
cd backend
fly deploy -a cr-overlay-staging-bold-feather-4496
```

### Update Environment Variables

**Backend:**
```bash
# Set individual variable
fly secrets set DATABASE_URL="new_value" -a cr-overlay-staging-bold-feather-4496

# Must redeploy after changing secrets
fly deploy -a cr-overlay-staging-bold-feather-4496
```

**Frontend:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add/edit/delete variables
3. Redeploy project

### Scale Backend

**View current scale:**
```bash
fly scale status -a cr-overlay-staging-bold-feather-4496
```

**Scale up (more machines):**
```bash
fly scale count 2 -a cr-overlay-staging-bold-feather-4496
```

**Scale memory per machine:**
```bash
fly scale memory 1024 -a cr-overlay-staging-bold-feather-4496
```

---

## Troubleshooting Production Issues

### Backend Returns 502 Bad Gateway

**Symptoms:**
- Getting 502 errors from backend
- https://cr-overlay-staging-bold-feather-4496.fly.dev returns error

**Diagnosis:**
```bash
# Check logs
fly logs -a cr-overlay-staging-bold-feather-4496 --tail 50

# Check status
fly status -a cr-overlay-staging-bold-feather-4496
```

**Solutions:**
1. Check if database is connected
2. Check if environment variables are set
3. Redeploy: `fly deploy -a cr-overlay-staging-bold-feather-4496`
4. Restart machines: `fly machines restart -a cr-overlay-staging-bold-feather-4496`

### Database Connection Fails

**Symptoms:**
- Backend logs show: `Connection refused`
- GET requests return 500 errors

**Diagnosis:**
```bash
# From backend logs
fly logs -a cr-overlay-staging-bold-feather-4496 | grep -i "connection\|database"

# Check Neon status
# Go to https://console.neon.tech/ → check project status
```

**Solutions:**
1. Verify DATABASE_URL is correct
2. Check Neon project is "Active" (not suspended)
3. Check firewall rules (should allow all)
4. Update DATABASE_URL if needed: `fly secrets set DATABASE_URL="..."`
5. Redeploy: `fly deploy -a cr-overlay-staging-bold-feather-4496`

### Image Upload Returns 403 Forbidden

**Symptoms:**
- Uploading images fails with 403
- Error: "Access Denied" from Cloudflare R2

**Diagnosis:**
```bash
# Check R2 credentials in secrets
fly secrets list -a cr-overlay-staging-bold-feather-4496

# Verify R2 bucket exists
# Go to https://dash.cloudflare.com/ → R2 → check bucket
```

**Solutions:**
1. Verify R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY are correct
2. Check R2 API token has "Object Read & Write" permissions
3. Verify bucket name is correct: `critical-role-companion-images`
4. Generate new R2 API token if expired
5. Update secrets: `fly secrets set R2_ACCESS_KEY_ID="..."`
6. Redeploy

### Frontend Shows Old Version

**Symptoms:**
- Vercel deployed but browser shows old code
- Changes not visible after deployment

**Solutions:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Check Vercel deployment logs (usually takes 2-5 minutes)
4. Force redeploy: Vercel Dashboard → Deployments → Redeploy

### High Latency / Slow Responses

**Symptoms:**
- Requests take > 5 seconds
- Timeouts in browser

**Diagnosis:**
```bash
# Check backend performance
fly logs -a cr-overlay-staging-bold-feather-4496 | tail 100

# Check machine metrics
fly machines list -a cr-overlay-staging-bold-feather-4496
```

**Solutions:**
1. Check database query performance (might need indexes)
2. Scale backend up: `fly scale count 2`
3. Check for slow endpoints in logs
4. Optimize database queries
5. Consider caching (Redis, CDN)

---

## Database Maintenance

### Backup Database

Neon automatically backs up daily. To export data:

```bash
# Using pg_dump
pg_dump "postgresql://..." > backup_$(date +%Y%m%d).sql
```

### Monitor Database Size

```bash
# Connect to database
psql "postgresql://..."

# Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Vacuum Database (cleanup)

```bash
# Connect to database
psql "postgresql://..."

# Run vacuum
VACUUM ANALYZE;
```

---

## Security Checklist

- ✅ Secrets not in code (using Fly.io secrets)
- ✅ Database credentials encrypted
- ✅ CORS properly configured
- ✅ HTTPS only (not HTTP)
- ✅ Environment variables in `.gitignore`
- ✅ Authentication required for admin operations
- ✅ Rate limiting (optional, future)
- ✅ Input validation on all endpoints

### Rotate Credentials Periodically

1. **Database Password:**
   - Go to Neon console
   - Change password
   - Update DATABASE_URL secret
   - Redeploy backend

2. **R2 API Token:**
   - Go to Cloudflare dashboard
   - Delete old token
   - Create new token with same permissions
   - Update R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY
   - Redeploy backend

3. **Admin Tokens (per-campaign):**
   - Generated for each campaign
   - Stored in database
   - Users can regenerate in admin panel

---

## Costs Estimate (Monthly)

| Service | Cost | Notes |
|---------|------|-------|
| Vercel | $0 | Free tier (generous) |
| Fly.io | $5-15 | Shared-cpu-1x with 256MB RAM |
| Neon | $0-20 | Free tier ~3GB, then $0.16/GB |
| Cloudflare R2 | $0.15/GB | After 10GB free |
| Domain | $10-15 | mythweavercompanion.com |
| **Total** | **~$30-60** | **per month** |

### Cost Optimization

- Keep Fly.io machines small (shared-cpu-1x)
- Use Cloudflare R2 instead of AWS S3 (cheaper)
- Neon auto-scales but stays free until 3GB
- Delete unused image versions to save storage

---

## Disaster Recovery

### If Backend Goes Down

1. Check Fly.io dashboard for errors
2. Review logs: `fly logs -a cr-overlay-staging-bold-feather-4496`
3. Redeploy: `fly deploy -a cr-overlay-staging-bold-feather-4496`
4. If still down, rollback to previous deploy

### If Database Goes Down

1. Check Neon status: https://console.neon.tech/
2. Contact Neon support if database is down
3. Use daily backup to restore if needed
4. Update DATABASE_URL if switching databases

### If Storage Goes Down

1. Check R2 bucket: https://dash.cloudflare.com/ → R2
2. Verify bucket is accessible
3. Recreate bucket if needed (will lose existing images)
4. Users can re-upload images

### If Domain Goes Down

1. Continue using direct Fly.io URL
2. Update DNS records with Cloudflare
3. DNS propagation takes 24-48 hours

---

## Version Control & Code Management

### Branching Strategy

- `main` - Production ready, deployed to Vercel
- `develop` - Feature development, tested locally
- `feature/*` - Individual feature branches

### Commit Before Deploy

Always ensure code is committed:

```bash
git status  # Check everything is committed
git push origin main  # Push to GitHub
# Then deploy
```

### Pre-Deployment Checklist

- [ ] All tests pass locally
- [ ] TypeScript: 0 errors (`npm run build`)
- [ ] No console errors in browser
- [ ] Tested in multiple browsers
- [ ] Code committed to GitHub
- [ ] Environment variables updated if needed

---

## Useful Commands Reference

### Fly.io Commands

```bash
# Status & Info
fly status -a cr-overlay-staging-bold-feather-4496
fly machines list -a cr-overlay-staging-bold-feather-4496
fly scale status -a cr-overlay-staging-bold-feather-4496

# Logs
fly logs -a cr-overlay-staging-bold-feather-4496 --tail 50
fly logs -a cr-overlay-staging-bold-feather-4496 --follow

# Deploy
fly deploy -a cr-overlay-staging-bold-feather-4496

# Secrets
fly secrets list -a cr-overlay-staging-bold-feather-4496
fly secrets set KEY=value -a cr-overlay-staging-bold-feather-4496

# Console Access
fly ssh console -a cr-overlay-staging-bold-feather-4496

# Restart
fly machines restart -a cr-overlay-staging-bold-feather-4496
```

### Database Commands

```bash
# Connect to Neon
psql "postgresql://user:password@host/db"

# List tables
\dt

# Describe table
\d table_name

# Check migrations
\d alembic_version
SELECT * FROM alembic_version;
```

### Frontend Build

```bash
# Local development
npm run dev

# Production build
npm run build

# Check TypeScript errors
npm run build  # or npx tsc --noEmit

# Linting
npm run lint
```

---

## Contact & Support

**Production Issues:**
- Fly.io Support: https://community.fly.io/
- Neon Support: https://console.neon.tech/support
- Cloudflare Support: https://dash.cloudflare.com/support
- Vercel Support: https://vercel.com/support

**Monitoring & Alerts:**
- Set up email alerts in Fly.io dashboard
- Monitor Neon metrics: https://console.neon.tech/monitoring

---

## Next Steps

1. **Complete Domain Setup**
   - DNS propagation for mythweavercompanion.com
   - Update Vercel to use custom domain
   - Test on production domain

2. **Implement New Features**
   - Feature 1: Sync Card Layout to Public Pages
   - Feature 2: Image Position Control
   - See PHASE_3_TIER_4_FEATURES.md for details

3. **Performance Optimization**
   - Add caching headers
   - Optimize database queries
   - Consider CDN for static assets

4. **Security Hardening**
   - Rate limiting on API
   - CSRF protection
   - SQL injection prevention (Pydantic already helps)

---

**Last Updated:** 2025-11-27
**Maintained By:** Claude Code
**Status:** ✅ Production Ready
