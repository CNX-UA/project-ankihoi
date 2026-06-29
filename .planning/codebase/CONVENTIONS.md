# Coding Conventions

**Analysis Date:** 2026-06-29

## Naming Patterns

**Files:**
- Backend: lower-case dot-separated naming (e.g. `decks.service.ts`, `decks.controller.ts`, `create-deck.dto.ts`).
- Frontend layout/pages: lower-case Next.js structure (e.g. `layout.tsx`, `page.tsx`).
- React components: PascalCase filenames (e.g. `SocialAuth.tsx`).

**Functions:**
- camelCase for standard functions (e.g., `findAll()`, `createCard()`).

**Variables:**
- camelCase for local values, parameters, and service properties (e.g. `createDeckDto`).

**Types:**
- PascalCase for TypeScript Classes, Interfaces, Modules, and DTOs (e.g. `DecksService`, `CreateDeckDto`, `AppModule`).

## Code Style

**Formatting:**
- Prettier (configured in `backend/.prettierrc` containing formatting rules).
- Integrated into formatting script `"format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\""` in backend.

**Linting:**
- ESLint (configured via `backend/eslint.config.mjs`).
- Lint command runs via script `"lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix"`.

## Import Organization

**Order:**
1. Global libraries and modules (e.g. `@nestjs/common`, `react`, `zustand`).
2. Local module providers / service bindings (e.g., `import { DecksService } from './decks.service'`).
3. Local data contracts and definitions (e.g., DTO types, client queries).

**Path Aliases:**
- Backend uses relative path mappings and tsconfig routes resolver `"tsconfig-paths"`.

## Error Handling

**Patterns:**
- Services throw standard NestJS HTTP Exceptions (`NotFoundException` / `BadRequestException`).
- Controllers handle validation automatically via `ValidationPipe({ whitelist: true, transform: true })` bound globally in `backend/src/main.ts`.

## Logging

**Framework:** NestJS native Logger context.

**Patterns:**
- Console warnings or logging events during runtime errors.

## Comments

**When to Comment:**
- Business logic algorithms (e.g. SuperMemo-2 mathematical rules in `backend/src/reviews/reviews.service.ts`).
- Route segments grouping within controllers.

**JSDoc/TSDoc:**
- Basic comment declarations for complex logic blocks.

## Function Design

**Size:** Concise methods focused on single business responsibilities.

**Parameters:** Grouped parameters passed via DTO structures rather than long positional parameter lists.

**Return Values:** Asynchronous Promise returns for database transactions, returning created or updated entity instances.

## Module Design

**Exports:** Classes exported explicitly from modules (`export class DecksModule {}`).

**Barrel Files:** Not explicitly used; files imported directly from module folder paths.

---

*Convention analysis: 2026-06-29*
