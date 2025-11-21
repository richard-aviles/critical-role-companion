# Key Decisions - Why We Chose What We Did

**Last Updated:** 2025-11-21

---

## 🏢 Decision 1: Multi-Tenant Architecture

### What We Decided

Build one app that supports unlimited campaigns (D&D groups), not separate apps per group.

### Why

**Pros:**
- One codebase to maintain
- Scale to serve 1000s of streamers
- Shared infrastructure (cheaper)
- Consistent updates for all users
- Better for Critical Role use case first, then generalize

**Cons:**
- More complex database design
- Need isolation/security between campaigns
- Higher initial development cost

### Alternatives Considered

1. **Single-tenant app:** Separate deployment per campaign
   - Rejected: Too expensive to maintain, hard to scale

2. **Monolithic single-purpose app:** Just for Critical Role
   - Rejected: Defeats the purpose of a reusable tool

### Impact on Development

- Database must filter by campaign_id on every query
- API endpoints include campaign in URL path
- Authentication tokens scoped to campaigns
- Images stored in campaign folders in R2
- All data completely isolated

### Decision Status

✅ **FINAL** - This is the foundation for everything

---

## 🗄️ Decision 2: PostgreSQL (via Neon) Instead of SQLite

### What We Decided

Use PostgreSQL hosted on Neon, not SQLite.

### Why

**SQLite Problems:**
- Single file, poor for concurrent users
- No proper user/permission system
- Not suitable for production web apps
- Hard to scale beyond single server
- No connection pooling

**PostgreSQL Benefits:**
- Multi-user concurrency (multiple WebSocket connections)
- Built-in security (users, roles)
- Connection pooling (manage resources)
- Proven production database
- Neon adds automatic backups, scaling
- Easy to migrate data later if needed

### Alternatives Considered

1. **MySQL:** Similar to PostgreSQL, but PostgreSQL is better for this use case
2. **MongoDB:** NoSQL, more flexible schema
   - Rejected: We need relational data (campaigns have characters, etc.)
3. **Firebase/Firestore:** Backend-as-a-service
   - Rejected: Less control, higher costs at scale

### Why Neon (Not Raw PostgreSQL)

**Neon Benefits:**
- Free tier (generous)
- Auto-scaling (pay what you use)
- Automatic backups
- No infrastructure to manage
- Connection pooling built-in
- Works perfectly with Fly.io

**Alternatives Considered:**
1. **Heroku Postgres:** More expensive
2. **AWS RDS:** More complex to set up
3. **Self-hosted PostgreSQL:** Need server, backups, maintenance

### Impact on Development

- Use SQLAlchemy ORM (Python tool)
- Write migrations with Alembic (version control for database)
- Connection string stored in `.env`
- All queries go through SQLAlchemy (type-safe)

### Decision Status

✅ **FINAL** - Neon is working, connection verified

---

## 🎨 Decision 3: Next.js + TypeScript Frontend

### What We Decided

Build frontend with Next.js 14, TypeScript, TailwindCSS, and shadcn/ui components.

### Why (vs Vanilla JavaScript)

**Old Approach (Vanilla HTML/CSS/JS):**
- Harder to maintain as app grows
- No type safety (easy to introduce bugs)
- Repetitive code
- Hard to reuse components
- Performance issues with large apps

**Next.js Benefits:**
- Full-stack framework (frontend + API routes if needed)
- Built-in optimizations (images, code splitting)
- Server-side rendering (faster initial load, better SEO)
- API routes (can run backend logic on same server)
- Hot reload development
- TypeScript support built-in
- Excellent for streaming overlays (real-time updates)

### Why TypeScript

- Catch errors at development time, not runtime
- Better IDE autocomplete
- Self-documenting code
- Easier refactoring
- Growing industry standard

### Why TailwindCSS + shadcn/ui

**Instead of:**
1. **Bootstrap:** More opinionated, heavier
2. **Material-UI:** Beautiful but lots of opinions
3. **Custom CSS:** Too much work, inconsistent styling

**TailwindCSS + shadcn/ui:**
- Utility-first CSS (fast to build UIs)
- Minimal, unstyled components you customize
- Small bundle size
- Great documentation
- Perfect for custom designs
- Headless (accessible by default)

### Impact on Development

- Learn Next.js patterns (if new to it)
- TypeScript adds small learning curve
- TailwindCSS is fast once you learn it
- Can build complex UIs quickly

### Alternatives Considered

1. **Vue.js:** Good framework, less ecosystem than React
2. **Svelte:** Very fast, smaller community
3. **Remix:** Newer than Next.js, still maturing

### Decision Status

✅ **FINAL** - Best choice for this project

---

## 🖼️ Decision 4: Cloudflare R2 for Image Storage

### What We Decided

Store character portraits and backgrounds in Cloudflare R2, not locally or in database.

### Why

**Storing Locally (Bad):**
- Takes up server disk space
- Hard to scale to multiple servers
- Backups are complicated
- Slow to serve images

**Storing in Database (Bad):**
- Makes database bloated
- Slow backups
- Hard to serve efficiently
- Not designed for binary data

**Cloudflare R2 (Good):**
- Unlimited storage
- $0.015/GB (cheaper than AWS S3)
- No egress fees (save money on downloads)
- Auto-scaling
- Built-in CDN (fast delivery)
- Integrated with Cloudflare (you already use it)
- S3-compatible API (easy to use)

### How It Works

1. User uploads image in admin dashboard
2. Backend sends to R2 via boto3 (Python S3 library)
3. R2 returns public URL
4. URL stored in database
5. Images served through Cloudflare CDN (cached globally)

### Cost Example

- 100 character portraits (5MB each) = 500MB total
- R2 cost: $0.015 × 0.5GB = $0.0075/month
- Egress: Free (included)
- **Total:** Less than $0.01/month

### Alternatives Considered

1. **AWS S3:** More expensive, more complex
2. **Google Cloud Storage:** Similar cost/complexity
3. **Azure Blob Storage:** Microsoft ecosystem, overkill
4. **Supabase Storage:** Easier setup, but limited free tier (1GB)
5. **Local file system:** OK for MVP, not for production

### Impact on Development

- Add image upload endpoint to backend
- Use boto3 library (Python)
- Store URLs in database
- Cloudflare handles serving (you don't care)

### Decision Status

✅ **FINAL** - R2 bucket created in Phase 0.2

---

## 🚀 Decision 5: Fly.io for Deployment

### What We Decided

Deploy both frontend and backend to Fly.io.

### Why

**Benefits:**
- Simple deployment (just `fly deploy`)
- Git push → automatic deploy
- SSL/HTTPS automatic
- Scaling is easy (add more machines or increase resources)
- Works with Docker naturally
- Generous free tier
- Cost-effective at scale

**Neon + Fly.io work together:**
- Fly.io can connect to Neon easily
- Both have simple management UIs
- Both auto-scale efficiently

### How It Works

```
You push to Git
↓
Fly.io detects push
↓
Builds Docker container
↓
Deploys to Fly.io machines
↓
Your app is live
```

### Alternatives Considered

1. **Vercel (frontend) + Heroku (backend):** Extra complexity
2. **AWS EC2:** More control, more complexity
3. **Google Cloud:** Similar to AWS
4. **DigitalOcean:** Simpler than AWS, not as simple as Fly.io
5. **Self-hosted VPS:** Cheap but lots of maintenance

### Impact on Development

- Need Docker knowledge (basic)
- fly.toml file already exists
- GitHub Actions for CI/CD (optional)
- Very simple scaling

### Cost Example

| Component | Free Tier | Paid Usage |
|-----------|-----------|-----------|
| Frontend (Next.js) | 3 shared CPU × 256MB RAM | $0.0000231/hour per machine |
| Backend (FastAPI) | 3 shared CPU × 256MB RAM | $0.0000231/hour per machine |
| Neon (PostgreSQL) | 0.5 GB storage, good compute | $0.16/hour overage |
| Cloudflare R2 | Free | $0.015/GB stored |
| **Total (small app)** | Free | ~$30-50/month at scale |

### Decision Status

✅ **FINAL** - Fly.io app already created (staging)

---

## 🔐 Decision 6: Token-Based Authentication (Now), OAuth2 (Later)

### What We Decided

Phase 0-1: Use simple token authentication (like an API key)
Phase 2+: Upgrade to OAuth2 with user accounts

### Why Tokens Now

**Simple for MVP:**
- Easy to implement
- Works with Twitch/gaming community
- Can share token with co-streamers
- No user account system needed yet

**Example:**
```
Admin uploads this token to OBS: admin_token_campaign123_xyz
All requests use: X-Token: admin_token_campaign123_xyz
```

### Why OAuth2 Later

**Better for scale:**
- Users log in with Twitch/Discord/GitHub
- Multiple users per campaign
- Permission levels (owner, editor, viewer)
- Audit trail (who changed what)
- Better security

### Migration Path

- Phase 0-1: Tokens work fine
- Phase 2: Add OAuth2 alongside tokens
- Phase 3: Tokens still work (backwards compatible)
- Phase 4: Deprecate tokens (eventually)

### Impact on Development

- Now: Simple header validation
- Later: OAuth2 setup (still simple with libraries)

### Decision Status

✅ **FINAL** - Tokens in Phase 0, OAuth2 planned for Phase 2

---

## 📱 Decision 7: App Naming - Defer Until End

### What We Decided

Keep "Critical Role Companion" as working name, rebrand at end of Phase 4.

### Why Defer

**Now is too early:**
- Don't know full feature set yet
- Product vision still developing
- Name will be more obvious once built
- Don't waste time on naming now

**Better to name at end:**
- See what makes this app unique
- Better name will emerge naturally
- Marketing + branding together
- Launch with professional name

### Current Approach

- Internally: "Critical Role Companion"
- Codebase: `critical-role-companion` (generic enough)
- Comments: Avoid brand-specific language
- At end: Rename everywhere at once

### Example Final Names

- "Encounter Nexus"
- "Campaign Vault"
- "Party Portal"
- "Character Hub"
- "Stream Companion"

### Decision Status

✅ **FINAL** - Added TODO to Phase 4 for naming

---

## 🔄 Decision 8: Keep Existing Backend API, Refactor for Multi-Tenant

### What We Decided

Don't rewrite backend from scratch, refactor existing code.

### Why

**Benefits of refactoring:**
- Keep working code
- Understand current patterns
- Less risk of breaking things
- Faster than starting over
- Can do incrementally

**Refactoring steps:**
1. Add SQLAlchemy ORM (keep existing logic)
2. Add campaign_id to all queries
3. Add new multi-tenant endpoints
4. Deprecate old single-tenant endpoints (over time)

### Why Not Rewrite

- "If it ain't broke, don't fix it"
- WebSocket logic is working
- Database logic is proven
- Risk of introducing new bugs

### Impact on Development

- Understand existing code
- Add models layer gradually
- Test heavily during refactor
- Keep backwards compatibility where possible

### Decision Status

✅ **FINAL** - Phase 0.3 will do this refactoring

---

## 📝 Summary: Why These Decisions?

| Decision | Chose | Why |
|----------|-------|-----|
| Architecture | Multi-tenant | Scale to many streamers |
| Database | PostgreSQL/Neon | Production-ready, scalable |
| Frontend | Next.js + TS | Modern, maintainable, fast |
| Styling | TailwindCSS | Fast development, consistent |
| Storage | R2 | Cheap, fast, integrated |
| Hosting | Fly.io | Simple, effective, scalable |
| Auth | Tokens now, OAuth2 later | Simple MVP, upgradeable |
| Naming | Defer to end | Let product speak for itself |

---

## 🎯 What's NOT Decided Yet

- Specific character card design (will do in Phase 1)
- Advanced features like lore wiki (Phase 4+)
- Chat integration (Phase 4+)
- Encounter tracking (Phase 4+)
- Mobile app (Phase 5+)

---

## 📞 Can We Change These Decisions?

**Short answer:** Only the non-core ones.

**Hard to change (would require major refactoring):**
- Database choice (PostgreSQL)
- Architecture (multi-tenant)

**Easy to change:**
- Styling (swap TailwindCSS for something else)
- Frontend components (shadcn/ui is replaceable)
- Hosting provider (Docker makes it portable)
- R2 to AWS S3 (same API)

**Should we change anything?**
- Ask yourself: "Why would we change this?"
- If there's a good reason, we can discuss
- Otherwise: Let's stick with the plan and see how it works

---

**End of decision document. You're building on solid foundations!**

Last updated: 2025-11-20
