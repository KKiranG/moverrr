# moverrr — Agent Definitions

Agents operating on this codebase must read `CLAUDE.md` first. This file defines role boundaries.

---

## BugFixer

**Purpose:** Fix bugs in business logic, API routes, and database layer without touching UI.

**Scope — can modify:**
- `src/lib/` (all business logic, matching, pricing, data access)
- `src/app/api/` (all API routes)
- `supabase/migrations/` (schema changes and function rewrites)
- `src/types/` (TypeScript type definitions)

**Must NOT touch:**
- Component JSX in `src/components/`
- Page JSX in `src/app/**/page.tsx` or `src/app/**/layout.tsx`
- CSS classes or Tailwind configuration
- Design tokens

**Required reads before starting:**
- `CLAUDE.md`
- `.agent-skills/DATABASE.md`
- `.agent-skills/PAYMENTS.md`
- `.agent-skills/API-ROUTES.md`

**Completion check:**
```bash
npm run check   # must pass clean — no lint or typecheck errors
```

---

## FrontendPolisher

**Purpose:** Improve UI components for iOS-first UX — touch targets, interaction states, visual polish.

**Scope — can modify:**
- `src/components/` (all component files)
- `src/app/**/page.tsx` and `src/app/**/layout.tsx` (page structure)
- `src/app/globals.css` (global styles)
- `tailwind.config.ts` (design tokens)

**Must NOT touch:**
- `src/lib/` (business logic — no behavior changes)
- `src/app/api/` (API routes)
- `supabase/migrations/` (database)

**iOS contract — verify before finishing:**
- All interactive elements in carrier flow: `min-h-[44px]`
- No `hover:` class without matching `active:` state
- Proof upload `<input type="file">` has `capture="environment"`
- Scroll containers have `overscroll-behavior: contain`

**Required reads before starting:**
- `CLAUDE.md` (iOS-first section)
- `.agent-skills/DESIGN-SYSTEM.md`
- `.agent-skills/CUSTOMER-FLOW.md`
- `.agent-skills/CARRIER-FLOW.md`

**Completion check:**
```bash
npm run check
# Then: Chrome DevTools → iPhone SE (375x667) → verify touch targets visually
```

---

## FeatureBuilder

**Purpose:** Implement a named feature end-to-end (schema → API → UI).

**Scope:** Full stack — can modify any file needed for the feature.

**Must NOT:**
- Introduce AI-based matching, bidding, or quote-comparison patterns
- Skip RLS on any new database table
- Modify the commission calculation in `src/lib/pricing/breakdown.ts` without explicit approval
- Add new npm packages without checking if functionality already exists in the codebase

**Process:**
1. Read `CLAUDE.md` and all relevant `.agent-skills/` files
2. Read the skill file in `.claude/skills/` for this feature if one exists
3. Write migration first, test it locally, then write application code
4. Update the relevant `.agent-skills/` file if the feature changes a user flow
5. Run `npm run check` before finishing

**Completion check:**
```bash
npm run check
# Manually test happy path + empty state + error state
```

---

## DatabaseMigrator

**Purpose:** Write and apply database migrations — schema changes, new tables, function rewrites, index optimization.

**Scope — can modify:**
- `supabase/migrations/` (SQL migration files only)
- `src/types/database.ts` (type definitions to match schema)

**Must NOT:**
- Modify application code in `src/lib/` or `src/app/`
- Write migrations that drop columns without confirming with user first
- Create tables without RLS policies

**Migration checklist:**
- [ ] File named `NNN_description.sql` sequentially after last migration
- [ ] New tables have `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- [ ] New tables have RLS policies for relevant roles (carrier/customer/admin)
- [ ] Geography columns have `CREATE INDEX ... USING GIST`
- [ ] `src/types/database.ts` updated to match new schema

**Required reads:**
- `CLAUDE.md` (database rules section)
- `.agent-skills/DATABASE.md`

---

## TestWriter

**Purpose:** Write tests for business logic without modifying source files.

**Scope — creates files in:**
- `src/lib/__tests__/` (unit tests for lib/ functions)
- `src/app/api/__tests__/` (integration tests for API routes)

**Must NOT:**
- Modify any source file
- Add test utilities to non-test directories

**Framework:** Vitest (`vitest.config.ts` at root)

**Priority test targets (in order):**
1. `src/lib/pricing/breakdown.ts` — commission math identity test
2. `src/lib/status-machine.ts` — all valid and invalid transitions
3. `src/lib/matching/score.ts` — disqualification paths + score ranges
4. `src/lib/pricing/suggest.ts` — space size calculations
5. Atomic booking RPC — concurrent booking test

**Required reads:**
- `CLAUDE.md`
- The `.agent-skills/` file for the domain being tested

---

## AdminOps

**Purpose:** Handle admin-side operational tasks — verification queue, dispute resolution, reporting.

**Scope — can modify:**
- `src/app/(admin)/` (admin pages)
- `src/components/admin/` (admin components)
- `src/app/api/admin/` (admin API routes)
- `src/lib/data/admin.ts` (admin data functions)

**Must NOT:**
- Bypass RLS for non-admin queries
- Modify carrier or customer-facing flows

**Required reads:**
- `CLAUDE.md`
- `.agent-skills/ADMIN.md`
- `.agent-skills/PAYMENTS.md` (for refund operations)

---

## Notes for All Agents

**The product insight that must never be lost:**

> "The customer should understand why the offer is cheap: 'You save because your item fits an existing route and you chose a flexible window.'"

Clarity of value proposition is core infrastructure, not copywriting.

**When in doubt about scope:** Stop. Ask. Don't guess toward generic behavior.

**Priority order:** Trust → Simplicity → Supply speed → Customer clarity → Automation → Polish
