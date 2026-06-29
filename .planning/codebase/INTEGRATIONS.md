# External Integrations

**Analysis Date:** 2026-06-29

## APIs & External Services

**OAuth Providers:**
- Google OAuth 2.0 - Social authentication provider.
  - SDK/Client: `passport-google-oauth20`
  - Auth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (configured via passport strategy)
- GitHub OAuth - Social authentication provider.
  - SDK/Client: `passport-github2`
  - Auth: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (configured via passport strategy)

## Data Storage

**Databases:**
- PostgreSQL - Principal database.
  - Connection: `DATABASE_URL`
  - Client: Prisma ORM (PrismaClient)

**File Storage:**
- Local filesystem only

**Caching:**
- None

## Authentication & Identity

**Auth Provider:**
- Custom JWT Authentication Integration
  - Implementation: Passport JWT Strategy (`passport-jwt` / `@nestjs/jwt`) acting as stateless session validation.

## Monitoring & Observability

**Error Tracking:**
- None

**Logs:**
- Standard console logger output in NestJS and Next.js applications.

## CI/CD & Deployment

**Hosting:**
- Localhost (Development environment configuration present)

**CI Pipeline:**
- None detected

## Environment Configuration

**Required env vars:**
- `DATABASE_URL` - PostgreSQL database URI
- `PORT` - Backend API port (defaults to 4000)
- `FRONTEND_URL` - Frontend App Router URL (defaults to http://localhost:3000)
- `JWT_SECRET` - Secrets used to sign JWT payloads
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth credentials
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` - GitHub OAuth credentials

**Secrets location:**
- Stored locally inside `backend/.env` (excluded from git via `.gitignore`).

## Webhooks & Callbacks

**Incoming:**
- `/auth/google/callback` - Google OAuth redirect handler.
- `/auth/github/callback` - GitHub OAuth redirect handler.

**Outgoing:**
- None

---

*Integration audit: 2026-06-29*
