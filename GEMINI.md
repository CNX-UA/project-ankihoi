<!-- GSD:project-start source:PROJECT.md -->

## Project

**Project Ankihoi**

Ankihoi is a spaced-repetition flashcard review application. It enables users to create customizable decks, add study cards, and practice/memorize content effectively using the SuperMemo-2 (SM-2) scheduling algorithm.

**Core Value:** Enable users to master information through highly responsive, simple, and reliable spaced-repetition card reviews.

### Constraints

- **Tech Stack**: Next.js v16.2.6, NestJS v11.0.1, Prisma ORM, PostgreSQL.
- **Local Time**: 2026-06-29.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Next.js** | v16.2.6 | Frontend Application Framework | Standard for App Router, Server Components, and optimized client interactivity. |
| **NestJS** | v11.0.1 | Backend API & Orchestration | Structured, highly scalable, and modular framework perfect for backend service calculation of SM-2 logic. |
| **Prisma ORM** | v6.x.x | Database Access Provider | Type-safe queries that streamline the atomic database updates needed when scaling card schedules. |
| **PostgreSQL** | v16.x | Relational Database Storage | Highly indexable and transactional database ideal for tracking dynamic due dates and review histories. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **react-hotkeys-hook** | v4.6.x | Declarative keyboard shortcut listener | Use for handling "Space" (flip) and "0-5" (performance rating) keybinds safely. |
| **Tailwind CSS / Vanilla CSS** | Native | 3D Transforms (`perspective`, `rotateY`) | Use to build zero-dependency, GPU-accelerated card flip transitions. |
| **Custom Backend SM-2 Service** | Pure TS | Run SM-2 scheduling logic | Use to compute next review intervals, repetitions, and E-factors directly within database transactions. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **Prisma Studio** | Database Visualizer | Useful for inspecting card states (`interval`, `efactor`, `repetition`, `nextReview`) during local testing. |
| **ESLint & Prettier** | Code Quality & Consistency | Standard configuration hooks for TypeScript typing sanity. |

## Installation

# Core (Existing)

# (NestJS and Next.js are already setup in the monorepo)

# Supporting

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **Custom Backend SM-2 Service** | `supermemo` npm package | If you want a quick plug-and-play solution without writing the basic formula code yourself, though the custom implementation is only ~15 lines of math. |
| **Custom CSS 3D Transforms** | `react-card-flip` npm package | If you need a rapid component structure and prefer not to deal with cross-browser prefixes or manual CSS perspective properties. |
| **react-hotkeys-hook** | Native `keydown` event listener | If you want zero dependencies and only need simple page-level global listeners that do not require scope containment. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Client-side SM-2 math** | Clock tampering vulnerabilities, out-of-sync client states, and redundant database round-trips. | **Backend database transactions** executing the logic in NestJS. |
| **Framer Motion / heavy JS animations** | Excessive bundle size and CPU overhead during simple 3D card flips (can stutter on low-end mobile devices). | **GPU-accelerated CSS Transitions** (`transform-style: preserve-3d`). |
| **Global input listeners without scope** | Hotkeys will trigger ratings and flip cards while the user is typing in a deck/card edit form field. | **Scoped key hooks** via `react-hotkeys-hook` or check `e.target` tag name. |

## Stack Patterns by Variant

- Use scoped `react-hotkeys-hook` scopes (`useHotkeys('space', handler, { scopes: 'review' })`)
- Because this prevents card flip keybindings from firing while the user is editing, searching, or interacting with form inputs.
- Use React lazy loading or dynamic imports for backend-rendered cards.
- Because it keeps the card flip animation fast (60 FPS) by preventing heavy client-side paint calculations during the rotation transition.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `react-hotkeys-hook@4.6.x` | `react@19.x` / `next@16.2.6` | Verified to work without peer dependency issues in modern React environments. |
| `@prisma/client@6.x` | `postgresql@16.x` | Native compatibility for standard temporal fields and calculations. |

## Sources

- [react-hotkeys-hook docs](https://react-hotkeys-hook.vercel.app/) — Key bindings hook verification.
- [SuperMemo SM-2 Algorithm description](https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-learning-process-supermemo-december-1989) — Verified the core formulas for interval calculation, repetitions, and easiness factor updates.
- [MDN 3D Transforms Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transforms/Using_CSS_transforms) — Verified GPU-accelerated card flip CSS implementation parameters.

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.agents/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
