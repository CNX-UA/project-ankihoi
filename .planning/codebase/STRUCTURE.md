# Codebase Structure

**Analysis Date:** 2026-06-29

## Directory Layout

```
[project-root]/
├── backend/                  # NestJS API backend service
│   ├── prisma/               # Schema configuration and database migrations
│   ├── src/                  # Application source code
│   │   ├── auth/             # Authentication module, guards, and strategies
│   │   ├── decks/            # Decks and cards domain logic (controllers, services)
│   │   ├── reviews/          # Card reviews and interval scheduling logic
│   │   └── prisma/           # Prisma service instantiation and exports
│   └── test/                 # Integration and Unit test files
├── frontend/                 # Next.js frontend application
│   ├── public/               # Static assets
│   └── src/                  # Frontend source code
│       ├── api/              # Axios instance and React Query client
│       ├── app/              # Next.js App Router (Layouts & Pages)
│       ├── features/         # Features-oriented logic split (e.g. auth components)
│       └── store/            # Zustand global client state stores
└── README.md                 # Project root documentation
```

## Directory Purposes

**backend/src:**
- Purpose: Contains NestJS backend modules and service-tier business logic.
- Contains: TypeScript controllers, services, decorators, DTOs, and modules.
- Key files: `main.ts`, `app.module.ts`.

**frontend/src:**
- Purpose: Contains Next.js React frontend source files.
- Contains: Layouts, pages, custom hooks, global state stores, React components.
- Key files: `app/layout.tsx`, `app/page.tsx`.

## Key File Locations

**Entry Points:**
- `backend/src/main.ts`: NestJS server bootstrapper.
- `frontend/src/app/page.tsx`: Root dashboard landing page for Next.js.

**Configuration:**
- `backend/prisma/schema.prisma`: Prisma schema defining PostgreSQL tables.
- `backend/package.json` / `frontend/package.json`: Dependency manifests and build/run scripts.
- `backend/eslint.config.mjs` / `frontend/eslint.config.mjs`: Code quality lint configs.

**Core Logic:**
- `backend/src/reviews/reviews.service.ts`: Implements SuperMemo-2 card intervals.
- `backend/src/decks/decks.service.ts`: Handles CRUD deck operations.
- `frontend/src/store/useAuthStore.ts`: Tracks logged-in users.

**Testing:**
- `backend/test/unit/`: Home for unit tests.
- `backend/test/decks.e2e-spec.ts`: E2E route testing for Deck API.

## Naming Conventions

**Files:**
- Backend: `[domain].[type].ts` (e.g., `decks.controller.ts`, `create-deck.dto.ts`).
- Frontend components: React PascalCase components or lower-case router layouts (e.g., `SocialAuth.tsx`, `layout.tsx`).

**Directories:**
- Pluralized lowercase folders (e.g., `decks`, `reviews`, `features`).

## Where to Add New Code

**New Feature:**
- Primary backend code: Create new module folder `backend/src/[domain]/` containing controller, service, module, and `dto/` files.
- Primary frontend code: Create hook or component in `frontend/src/features/[feature]/`.
- Tests: Add `.spec.ts` files to `backend/test/unit/` or E2E tests in `backend/test/`.

**New Component/Module:**
- Implementation: Frontend shared UI components go in `frontend/src/features/[feature]/components/`.

**Utilities:**
- Shared helpers: Define new service classes or pure TS modules in a `utils/` or `common/` folder under respective project source roots.

## Special Directories

**backend/prisma:**
- Purpose: Relational database schema models and SQL migrations histories.
- Generated: No.
- Committed: Yes.

**backend/dist / frontend/.next:**
- Purpose: Production compiled distribution targets.
- Generated: Yes.
- Committed: No (ignored via `.gitignore`).

---

*Structure analysis: 2026-06-29*
