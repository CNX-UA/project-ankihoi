# Codebase Concerns

**Analysis Date:** 2026-06-29

## Tech Debt

**CORS Hardcoding:**
- Issue: CORS origins in the backend `main.ts` fall back to `http://localhost:3000` via OR syntax rather than strict environment-only checks.
- Files: `backend/src/main.ts`
- Impact: Could result in misconfigured headers or cross-origin issues in deployment environments.
- Fix approach: Load CORS origins exclusively from validated environment parameters.

## Known Bugs

**None Detected:**
- Symptoms: None
- Files: None
- Trigger: None
- Workaround: None

## Security Considerations

**Secrets Configuration:**
- Risk: Development `.env` settings could accidentally be staged or pushed if `.gitignore` files are modified.
- Files: `backend/.env`
- Current mitigation: Git-ignored locally.
- Recommendations: Implement config validations or remote vault loaders.

## Performance Bottlenecks

**Prisma Client Loading:**
- Problem: Cold starts on serverless hosting structures might suffer delays due to Prisma ORM model mapping.
- Files: `backend/src/prisma/prisma.service.ts`
- Cause: Cold boot connection initialization.
- Improvement path: Optimize connection pools or reuse database clients effectively.

## Fragile Areas

**Card Review Scheduling Logic:**
- Files: `backend/src/reviews/reviews.service.ts`
- Why fragile: SuperMemo-2 mathematical calculations depend on custom intervals and multiplication factors.
- Safe modification: Modify calculation algorithms after verifying via a mock test harness.
- Test coverage: Partially covered by unit tests.

## Scaling Limits

**Database Connections:**
- Current capacity: Dependent on PostgreSQL server connection limits.
- Limit: Can exhaust pool limits during parallel transaction spikes.
- Scaling path: Utilize Prisma Accelerate or pgBouncer proxy servers.

## Dependencies at Risk

**React 19 / Next.js 16:**
- Risk: React 19 is relatively new and might introduce package compatibility warnings with legacy component libraries.
- Impact: Potential package resolution warnings during npm installs.
- Migration plan: Keep libraries updated and use `--legacy-peer-deps` only if necessary.

## Missing Critical Features

**Frontend Testing:**
- Problem: Complete lack of UI validation testing.
- Blocks: Prevents automated verification of React user interactions, forms, and Zustand store updates.

## Test Coverage Gaps

**Next.js Frontend:**
- What's not tested: Entire frontend code (components, custom hooks, store bindings).
- Files: `frontend/src/`
- Risk: Regressions in user auth components, navigation, or Zustand store flows.
- Priority: High

---

*Concerns audit: 2026-06-29*
