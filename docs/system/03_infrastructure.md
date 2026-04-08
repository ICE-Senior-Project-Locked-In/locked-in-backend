# Infrastructure Layer

The infrastructure layer provides shared external service integrations. It is declared `@Global()`, so its exports are available application-wide without explicit imports.

**Location:** `src/infrastructure/`

---

## RedisService

**File:** `src/infrastructure/redis/redis.service.ts`

Wraps the `ioredis` client, managing connection lifecycle and exposing a single client instance to the rest of the application.

### Responsibilities

- Initializes an `ioredis` client using `redisUrl` from environment config.
- Implements `OnModuleDestroy` — gracefully quits the Redis connection on shutdown.
- Listens for Redis `error` events to prevent unhandled exceptions.
- Logs connection status (verbose in non-production environments).

### Configuration Options

| Option | Value |
|--------|-------|
| `maxRetriesPerRequest` | `null` (no limit on retries) |
| `enableReadyCheck` | `false` |
| Connection URL | `redisUrl` from environment config |

### Usage

Inject `RedisService` and call `getClient()` to access the underlying `ioredis` instance:

```typescript
constructor(private readonly redis: RedisService) {}

const client = this.redis.getClient();
await client.set('key', 'value', 'EX', 60);
const value = await client.get('key');
```

---

## InfrastructureModule

**File:** `src/infrastructure/infrastructure.module.ts`

```
InfrastructureModule (@Global)
  └── RedisService
```

Declared global — no module needs to import `InfrastructureModule` explicitly to inject `RedisService`.
