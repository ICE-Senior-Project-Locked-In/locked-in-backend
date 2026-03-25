# Test Specs Documentation

This project uses Jest for unit/integration tests and e2e tests.

## Test Locations

- Unit/integration: `src/**/*.spec.ts`
- E2E: `test/**/*.e2e-spec.ts`

Current examples:

- `src/app.controller.spec.ts`
- `test/app.e2e-spec.ts`

## Run Tests

```bash
# unit tests
pnpm run test

# e2e tests
pnpm run test:e2e

# coverage
pnpm run test:cov
```

## Test Conventions

- Name unit test files as `*.spec.ts` and colocate near source where practical.
- Name e2e files as `*.e2e-spec.ts` under `test/`.
- Use `@nestjs/testing` to construct the testing module.
- Use `supertest` for HTTP assertions in e2e tests.

## Unit Test Template

```ts
import { Test, TestingModule } from '@nestjs/testing';

describe('FeatureService', () => {
  let service: FeatureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeatureService],
    }).compile();

    service = module.get<FeatureService>(FeatureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

## E2E Test Template

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Feature (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET / should return 200', () => {
    return request(app.getHttpServer()).get('/').expect(200);
  });
});
```

## Notes

- Linting: `pnpm run lint`
- Build: `pnpm run build`
- If build fails with Prisma client typing errors, run `pnpm run db:generate` first.
