# Testing Patterns

**Analysis Date:** 2026-06-29

## Test Framework

**Runner:**
- Jest v30.0.0 (backend)
- Config: `backend/package.json` under the `"jest"` key.

**Assertion Library:**
- Jest Built-in assertions (`expect`).

**Run Commands:**
```bash
npm run test           # Run all backend unit tests
npm run test:watch     # Run backend tests in watch mode
npm run test:cov       # Run backend tests with coverage report
npm run test:e2e       # Run backend E2E integration tests
```

## Test File Organization

**Location:**
- Unit tests are located separately under `backend/test/unit/`.
- E2E integration tests are located under `backend/test/` (e.g. `backend/test/decks.e2e-spec.ts`).

**Naming:**
- Unit tests: `*.spec.ts`
- E2E tests: `*.e2e-spec.ts`

**Structure:**
```
backend/test/
├── unit/
│   ├── app.controller.spec.ts
│   ├── decks.controller.spec.ts
│   ├── decks.service.spec.ts
│   └── reviews.service.spec.ts
├── app.e2e-spec.ts
├── decks.e2e-spec.ts
└── jest-e2e.json
```

## Test Structure

**Suite Organization:**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { DecksService } from '../../src/decks/decks.service';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('DecksService', () => {
  let service: DecksService;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DecksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DecksService>(DecksService);
  });

  describe('create', () => {
    it('should successfully create...', async () => {
      // test logic
    });
  });
});
```

**Patterns:**
- **Setup pattern:** NestJS `Test.createTestingModule` compiler boots lightweight sub-modules in `beforeEach` to compile mock dependencies.
- **Teardown pattern:** Standard global Jest hooks.
- **Assertion pattern:** Mocking responses using `jest.fn().mockResolvedValue(...)` and verifying invocations using `toHaveBeenCalledWith(...)`.

## Mocking

**Framework:** Jest mock functions (`jest.fn()`).

**Patterns:**
```typescript
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
  },
  deck: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};
```

**What to Mock:**
- External service gateways (e.g. Prisma client services).
- Remote API network transactions.

**What NOT to Mock:**
- Domain DTO mapping rules and local data calculations.

## Fixtures and Factories

**Test Data:**
```typescript
const createDto = { 
  title: 'Test Deck', 
  description: 'Desc', 
  userId: 'user-uuid' 
};
```

**Location:**
- Created inline inside test suites.

## Coverage

**Requirements:** None enforced.

**View Coverage:**
```bash
npm run test:cov
```

## Test Types

**Unit Tests:**
- Located in `backend/test/unit/` targeting services and controllers class-by-class.

**Integration Tests:**
- Located in `backend/test/` as `*.e2e-spec.ts` executing actual HTTP requests via Supertest.

**E2E Tests:**
- Not used on frontend.

## Common Patterns

**Async Testing:**
```typescript
it('should return async result', async () => {
  const result = await service.findOne('id');
  expect(result).toBeDefined();
});
```

**Error Testing:**
```typescript
await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
```

---

*Testing analysis: 2026-06-29*
