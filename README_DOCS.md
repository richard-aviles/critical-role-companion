# Documentation Index

**Welcome!** This folder contains all the project documentation you need.

---

## 🚀 Start Here (First Time?)

1. **`PROJECT_STATUS.md`** - Overview of the entire project
   - What we're building
   - Current phase & status
   - Who should read what next

2. **`NEXT_ACTIONS.md`** - What to do in your next session
   - Step-by-step checklist
   - Time estimates
   - Quick reference commands

---

## 📚 Documentation by Purpose

### Understanding the Big Picture

- **`PROJECT_STATUS.md`** - High-level overview, quick reference
- **`ARCHITECTURE.md`** - Technical design, how things fit together
- **`DECISIONS.md`** - Why we chose each technology/approach
- **`SESSION_8_STARTUP.md`** - What was just completed in Phase 3 Tiers 1 & 2

### Getting Things Done

- **`NEXT_ACTIONS.md`** - What to do today, step-by-step (Phase 3 Tier 3 tasks)
- **`PHASE_0_PROGRESS.md`** - Phase 0 completion details
- **`TROUBLESHOOTING.md`** - Common issues and solutions
- **`KNOWN_ISSUES.md`** - Documented issues and workarounds

### Technical Reference (Coming Soon)

- **`API_DESIGN.md`** - REST API endpoint specifications
- **`DATABASE_SCHEMA.md`** - Database table structures
- **`DEPLOYMENT.md`** - How to deploy to Fly.io

---

## 📖 How to Use Each Document

### PROJECT_STATUS.md
**Purpose:** Quick reference for project overview
**When to read:** Every session start, when you need the big picture
**Time:** 5-10 minutes
**Contains:** Phase status, tech stack, links, checklist

### NEXT_ACTIONS.md
**Purpose:** Your TODO list for the next session
**When to read:** Every session start, to know what to do
**Time:** 5 minutes to read, varies by tasks
**Contains:** Priority 1-5 tasks, time estimates, quick reference

### PHASE_0_PROGRESS.md
**Purpose:** Detailed breakdown of Phase 0 status
**When to read:** During Phase 0, to track specific tasks
**Time:** 10 minutes
**Contains:** What's done, what's next, detailed steps

### ARCHITECTURE.md
**Purpose:** Understand the technical structure
**When to read:** When you want to understand how things work
**Time:** 20-30 minutes
**Contains:** System design, data models, API structure, data flows

### DECISIONS.md
**Purpose:** Understand WHY we chose what we did
**When to read:** When you question a choice, or want to understand the thinking
**Time:** 15-20 minutes
**Contains:** Decision rationale, alternatives considered, impact

### TROUBLESHOOTING.md
**Purpose:** Fix problems
**When to read:** When something breaks
**Time:** 5-20 minutes (depends on problem)
**Contains:** Common issues, diagnosis steps, solutions

### KNOWN_ISSUES.md
**Purpose:** Understand documented issues and workarounds
**When to read:** When encountering known issues, or before starting work
**Time:** 5-10 minutes
**Contains:** Known bugs, their impact, workarounds, when they'll be fixed

### SESSION_8_STARTUP.md
**Purpose:** Quick reference for Session 8 context and status
**When to read:** Starting Session 8+ to understand what was completed
**Time:** 5 minutes
**Contains:** Session 8 completion summary, current status, next steps

### PHASE_3_TIER_2_TEST_REPORT.md
**Purpose:** Detailed report of Phase 3 Tier 2 (Admin UI Color Override) implementation
**When to read:** To understand color override UI components, or as reference for similar work
**Time:** 15-20 minutes
**Contains:** Component specifications, API integration details, test coverage, code examples

---

## 🗓️ Reading Schedule by Session

### Session 8 (Just Completed!)
- ✅ Completed Phase 3 Tier 1 (Backend Color Override Endpoints)
- ✅ Completed Phase 3 Tier 2 (Admin UI Color Override Components)
- ✅ Created PHASE_3_TIER_2_TEST_REPORT.md
- ✅ Created SESSION_8_STARTUP.md
- ✅ Updated PROJECT_STATUS.md

### Session 9+ (Coming Next!)
- Read SESSION_8_STARTUP.md (5 min) - Understand what just completed
- Read PROJECT_STATUS.md (5 min) - Quick refresh
- Read PHASE_3_TIER_2_TEST_REPORT.md (15 min) - See completed work as reference
- Read NEXT_ACTIONS.md (follow Phase 3 Tier 3 tasks)
- Reference TROUBLESHOOTING.md and KNOWN_ISSUES.md as needed

---

## 🎯 Quick Navigation

**I need to...**

| Task | Document | Section |
|------|----------|---------|
| Understand what we're building | PROJECT_STATUS.md | 📊 Project Overview |
| Know where we are now | SESSION_8_STARTUP.md | 📍 Session 8 Completion |
| Know what was just done | PHASE_3_TIER_2_TEST_REPORT.md | Executive Summary |
| See what to do next | NEXT_ACTIONS.md | 📋 Session 9 Task List |
| Understand the architecture | ARCHITECTURE.md | 🏗️ System Architecture |
| Know why we chose X | DECISIONS.md | Each decision header |
| Fix a broken thing | TROUBLESHOOTING.md | Search your error |
| Understand known issues | KNOWN_ISSUES.md | Issue list & workarounds |
| See the roadmap | PROJECT_STATUS.md | 🚀 High-Level Roadmap |
| Deploy to production | DEPLOYMENT.md | (Coming soon) |
| Understand the database | DATABASE_SCHEMA.md | (Coming soon) |
| Build an API endpoint | API_DESIGN.md | (Coming soon) |

---

## 📋 Documentation Files

```
critical-role-companion/
├── PROJECT_STATUS.md                      ← Start here
├── NEXT_ACTIONS.md                        ← Your TODO list
├── PHASE_0_PROGRESS.md                    ← Phase 0 status (completed)
├── PHASE_1_PROGRESS.md                    ← Phase 1 status (completed)
├── PHASE_1_COMPLETION_SUMMARY.md          ← Phase 1 detailed summary
├── PHASE_2_PLANNING.md                    ← Phase 2 architecture (completed)
├── PHASE_3_TIER_1_COMPLETION_SUMMARY.md   ← Phase 3 Tier 1 summary (backend colors)
├── PHASE_3_TIER_2_TEST_REPORT.md          ← Phase 3 Tier 2 (admin UI colors) [NEW]
├── ARCHITECTURE.md                        ← Technical design
├── DECISIONS.md                           ← Why we chose things
├── TROUBLESHOOTING.md                     ← Fix problems
├── KNOWN_ISSUES.md                        ← Documented issues [NEW]
├── SESSION_8_STARTUP.md                   ← Session 8 quick start [NEW]
├── README_DOCS.md                         ← You are here
├── API_DESIGN.md                          (Coming soon)
├── DATABASE_SCHEMA.md                     (Coming soon)
└── DEPLOYMENT.md                          (Coming soon)
```

---

## 🔐 Important Notes

### The `.env` File

- **Location:** `backend/.env`
- **DO NOT commit to Git** (it's in `.gitignore`)
- **DO NOT share publicly** (contains secrets)
- **Keep secure** (has your database and R2 credentials)

### Updating Documentation

When things change (Phase progress, decisions, etc.):
1. Update the relevant `.md` file
2. Add "Last Updated: DATE" at top
3. Add brief note in PROJECT_STATUS.md

### Adding New Docs

When we need new documentation:
1. Create `.md` file in this folder
2. Add link to README_DOCS.md
3. Keep consistent with existing style

---

## 💡 Documentation Philosophy

**These docs are designed to be:**

1. **Clear** - Written for humans, not machines
2. **Complete** - Everything you need to know
3. **Navigable** - Easy to find what you want
4. **Living** - Updated as project evolves
5. **Linked** - References between docs to avoid repetition

**They are NOT:**
- ❌ Marketing material (internal use)
- ❌ API documentation (see API_DESIGN.md when it's written)
- ❌ Step-by-step tutorials (see NEXT_ACTIONS.md instead)
- ❌ Comprehensive (we keep it focused on critical info)

---

## 🚨 If Something in Docs is Wrong

**Update it!** The docs are for YOU to use, so if something is outdated:

1. Edit the `.md` file
2. Update the "Last Updated" date
3. Make a note in PROJECT_STATUS.md that something changed

**Or tell the next session what's wrong** so they can fix it.

---

## 📞 Getting Help

**Before asking for help:**
1. Check TROUBLESHOOTING.md
2. Check the relevant doc (ARCHITECTURE.md, DECISIONS.md, etc.)
3. Check NEXT_ACTIONS.md for guidance on current task

**When asking for help:**
- Reference which doc you're reading
- Describe what you expected vs. what happened
- Include error messages (copy-paste)
- Include steps you already tried

---

## ✅ Documentation Checklist

- [x] PROJECT_STATUS.md - Project overview
- [x] NEXT_ACTIONS.md - What to do next
- [x] PHASE_0_PROGRESS.md - Phase 0 status
- [x] PHASE_1_PROGRESS.md - Phase 1 status
- [x] PHASE_1_COMPLETION_SUMMARY.md - Phase 1 detailed summary
- [x] PHASE_2_PLANNING.md - Phase 2 architecture
- [x] PHASE_3_TIER_1_COMPLETION_SUMMARY.md - Phase 3 Tier 1 summary
- [x] PHASE_3_TIER_2_TEST_REPORT.md - Phase 3 Tier 2 report [NEW - Session 8]
- [x] SESSION_8_STARTUP.md - Session 8 context [NEW - Session 8]
- [x] KNOWN_ISSUES.md - Known issues [NEW - Session 8]
- [x] ARCHITECTURE.md - Technical design
- [x] DECISIONS.md - Why we chose things
- [x] TROUBLESHOOTING.md - Common issues
- [x] README_DOCS.md - This file
- [ ] API_DESIGN.md - (Phase 3 Tier 3+)
- [ ] DATABASE_SCHEMA.md - (Phase 3 Tier 3+)
- [ ] DEPLOYMENT.md - (Phase 3 Tier 4+)

---

## 🎓 Example: Using These Docs

### Scenario: You're starting Session 9 and want to continue from where Session 8 left off

1. Open SESSION_8_STARTUP.md (5 min) - See what was just completed
2. Read PHASE_3_TIER_2_TEST_REPORT.md (15 min) - Understand the color override components
3. Open NEXT_ACTIONS.md - Go to "Session 9 Task List"
4. Start Phase 3 Tier 3: Public Campaign Pages

### Scenario: You need to understand how character color overrides work

1. Open PHASE_3_TIER_2_TEST_REPORT.md
2. Go to "Component Implementation Details"
3. Read ColorPickerModal, ColorPresetSelector, CharacterColorOverrideForm specs
4. Look at "ColorPreset Interface" to understand data structure
5. See "API Client Updates" for integration details

### Scenario: You encounter a known issue

1. Open KNOWN_ISSUES.md
2. Search for your issue
3. Read the description and workaround
4. If it needs to be fixed, note it in the issue
5. File a note for next session if it affects your work

### Scenario: You're building public campaign pages

1. Open NEXT_ACTIONS.md → "Phase 3 Tier 3 Task List"
2. Read PHASE_3_TIER_2_TEST_REPORT.md to see how color overrides work
3. For examples of component patterns, see PHASE_1_COMPLETION_SUMMARY.md
4. Reference ARCHITECTURE.md for system design
5. If something breaks, check TROUBLESHOOTING.md

---

## 📝 Last Updated

**Overall Docs Version:** 3.0
**Last Updated:** 2025-11-22 (Session 8)
**Status:** Phase 3 Tiers 1 & 2 Complete, Phase 3 Tier 3 Ready to Begin

**Recent Updates (Session 8):**
- ✅ Phase 3 Tier 2 Admin UI Components completed
- ✅ PHASE_3_TIER_2_TEST_REPORT.md created with full component documentation
- ✅ SESSION_8_STARTUP.md created for context handoff
- ✅ KNOWN_ISSUES.md created documenting SQLAlchemy issue
- ✅ NEXT_ACTIONS.md updated with Phase 3 Tier 3 (Public Campaign Pages) planning

---

## 🎯 Your Next Step

👉 **Go to `NEXT_ACTIONS.md` and follow Priority 1**

It's designed to be your step-by-step guide for the next session.

---

**Questions? Check the relevant doc first. Then ask!**

Happy building! 🚀
