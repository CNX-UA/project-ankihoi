<!-- refreshed: 2026-06-29 -->
# Architecture

**Analysis Date:** 2026-06-29

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
├──────────────────┬──────────────────┬───────────────────────┤
│   Next.js UI     │  Zustand Store   │   React Query Cache   │
│  `frontend/src`  │  `frontend/src`  │  `frontend/src/api`   │
└────────┬─────────┴────────┬─────────┴──────────┬────────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      NestJS backend                         │
│         `backend/src`                                       │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  PostgreSQL Database                                        │
│  `backend/prisma`                                           │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| DecksController | Handles HTTP requests for deck resources and nested cards | `backend/src/decks/decks.controller.ts` |
| DecksService | Implements business logic for decks and card creation/retrieval | `backend/src/decks/decks.service.ts` |
| ReviewsService | Processes card review history and executes card scheduling logic | `backend/src/reviews/reviews.service.ts` |
| PrismaService | Exposes database client connections using Prisma | `backend/src/prisma/prisma.service.ts` |
| AuthModule | Configures Passport strategies (GitHub, Google, JWT) and token issuance | `backend/src/auth/auth.module.ts` |

## Pattern Overview

**Overall:** Monorepo with Model-View-Controller API and React Single Page App frontend.

**Key Characteristics:**
- **Modular NestJS Backend**: Each domain (auth, decks, reviews) is a self-contained module.
- **Next.js App Router**: Client-side page navigation, structured by layout components.
- **Client Caching Layer**: Async state synchronized and cached using React Query hooks.

## Layers

**Controller Layer (API):**
- Purpose: Directs HTTP traffic, extracts path parameters, binds request bodies, and calls business logic.
- Location: `backend/src/**/*.controller.ts`
- Contains: Decorator-driven class methods (`@Get`, `@Post`, `@Body`).
- Depends on: Services, DTO classes.
- Used by: External clients (Next.js app).

**Service Layer (Business Logic):**
- Purpose: Houses logical rules, validations, database queries, and algorithms.
- Location: `backend/src/**/*.service.ts`
- Contains: Service classes decorated with `@Injectable()`.
- Depends on: PrismaService.
- Used by: Controller classes.

**Data Access Layer:**
- Purpose: Direct ORM communication with database schema definition.
- Location: `backend/prisma/schema.prisma`
- Contains: Declarative database model schema.
- Used by: Prisma Service client generators.

## Data Flow

### Primary Request Path

1. User actions trigger API calls via Axios configured in `frontend/src/api/axios.ts`.
2. NestJS routing directs to controller action, e.g., `DecksController.findOne` in `backend/src/decks/decks.controller.ts:22`.
3. Controller delegates to `DecksService.findOne` in `backend/src/decks/decks.service.ts:39`.
4. Service Queries db via `prisma.deck.findUnique(...)` and returns output.
5. Controller serializes JSON response back to the frontend client.

### State Management:
- Global client state is stored in Zustand (`frontend/src/store/useAuthStore.ts`).
- Server query states are managed and cached by React Query client provider (`frontend/src/api/query-client.tsx`).

## Key Abstractions

**Prisma Service:**
- Purpose: Singular database connection instance reused via dependency injection.
- Examples: `backend/src/prisma/prisma.service.ts`
- Pattern: Dependency Injection / Singleton.

**Zustand Auth Store:**
- Purpose: Lightweight, reactive state containing authenticated user credentials.
- Examples: `frontend/src/store/useAuthStore.ts`
- Pattern: Hook-based state store.

## Entry Points

**NestJS bootstrap:**
- Location: `backend/src/main.ts`
- Triggers: Node.js server startup command `npm run start`.
- Responsibilities: Configures Global ValidationPipes, sets CORS configurations, and boots application modules on specified port.

**Next.js index:**
- Location: `frontend/src/app/page.tsx`
- Triggers: Loading root website path `/`.
- Responsibilities: Renders home page layout and main deck viewing dashboard.

## Architectural Constraints

- **Threading:** Single-threaded Node.js event-loop on both frontend and backend.
- **Global state:** User session status held in Zustand `useAuthStore` client-side.
- **Circular imports:** Guarded by NestJS compile-time module dependency resolution.

## Anti-Patterns

### Hardcoded URL/Config Fallbacks

**What happens:** Server configuration uses local fallback strings if environment variables are missing.
**Why it's wrong:** Vulnerable to environmental discrepancies during cloud staging/production setups.
**Do this instead:** Validate environments early at startup using schema validation libraries like Zod.

## Error Handling

**Strategy:** Exception Filters and NestJS HTTP exceptions.

**Patterns:**
- Throws standard HTTP Exceptions (`NotFoundException` / `BadRequestException`) inside service functions.
- Expressed using NestJS standard error payloads returning status codes (e.g. 404, 400).

## Cross-Cutting Concerns

**Logging:** Standard NestJS logger injection.
**Validation:** NestJS `ValidationPipe` running `class-validator` decorators on DTO instances.
**Authentication:** Passport strategies intercepting REST routes.

---

*Architecture analysis: 2026-06-29*
