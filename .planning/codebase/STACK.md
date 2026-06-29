# Technology Stack

**Analysis Date:** 2026-06-29

## Languages

**Primary:**
- TypeScript 5.x - Used across both backend and frontend applications.

**Secondary:**
- JavaScript - Configuration files (e.g., eslint.config.mjs).

## Runtime

**Environment:**
- Node.js (v18+ recommended)

**Package Manager:**
- npm (using package-lock.json)
- Lockfile: present (`backend/package-lock.json`)

## Frameworks

**Core:**
- Next.js v16.2.6 - Frontend framework (App Router)
- NestJS v11.0.1 - Backend framework (Modular architecture)

**Testing:**
- Jest v30.0.0 - Backend testing framework
- ts-jest v29.2.5 - TypeScript preprocessor for Jest

**Build/Dev:**
- TypeScript v5.7.3 - Compiler for backend
- TypeScript v5.x - Compiler for frontend
- @nestjs/cli v11.0.0 - NestJS Command Line Interface

## Key Dependencies

**Critical:**
- @prisma/client v7.8.0 - Typesafe Database Client for PostgreSQL
- zustand v5.0.13 - Frontend state management
- @tanstack/react-query v5.100.14 - Frontend asynchronous state & caching
- axios v1.16.1 - HTTP request client

**Infrastructure:**
- prisma v7.8.0 - Database schema migration and modeling tool
- passport v0.7.0 - Authentication middleware

## Configuration

**Environment:**
- Configured using dotenv package loading from `.env` file in `backend/`
- Key configs required: `DATABASE_URL` (PostgreSQL connection), `PORT` (default 4000), `FRONTEND_URL` (default http://localhost:3000)

**Build:**
- `backend/tsconfig.json` - Backend TS compilation
- `backend/nest-cli.json` - Nest CLI config
- `frontend/package.json` - Frontend build scripts (Next.js build pipeline)

## Platform Requirements

**Development:**
- Node.js (v18+), npm or pnpm, and PostgreSQL database instance.

**Production:**
- Node.js application hosting (e.g. Docker containerized Next.js/NestJS application or platforms like Vercel, Heroku, or GCP Cloud Run).

---

*Stack analysis: 2026-06-29*
