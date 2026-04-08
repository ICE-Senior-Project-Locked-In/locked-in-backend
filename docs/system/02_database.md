# Database Layer

The database layer provides all data persistence services. It is declared as a `@Global()` NestJS module, making its exports available throughout the application without explicit imports.

**Location:** `src/database/`

---

## PrismaService

**File:** `src/database/prisma.service.ts`

A thin wrapper around the Prisma ORM client. It is the sole point of database access across all feature modules.

### Responsibilities

- Extends `PrismaClient` to expose the full Prisma API.
- Implements `OnModuleInit` — calls `$connect()` when the application starts.
- Implements `OnModuleDestroy` — calls `$disconnect()` when the application shuts down.
- Prisma manages connection pooling internally.

### Usage

Inject `PrismaService` into any service to access the database:

```typescript
constructor(private readonly prisma: PrismaService) {}

// Example
const user = await this.prisma.user.findUnique({ where: { userId } });
```

---

## MasterDataService

**File:** `src/database/master-data/master-data.service.ts`

An in-memory cache for master/reference data that is frequently read and rarely written. This avoids repeated database queries for static lookup data.

### Responsibilities

- Implements `OnModuleInit` — queries the database once on startup and stores results in memory.
- Exposes `getUnblockActionIds()` and `getFocusTypeIds()` for fast synchronous access.

### Cached Data

| Property | Type | Source |
|----------|------|--------|
| `masterUnblockActionIds` | `string[]` | `unblockAction` where `isDefault = true` |
| `masterFocusTypeIds` | `string[]` | `focusType` where `isDefault = true` |

### Usage

```typescript
constructor(private readonly masterData: MasterDataService) {}

const defaultTypeIds = this.masterData.getFocusTypeIds();
```

### Exported By

`DatabaseModule` exports both `PrismaService` and `MasterDataService`.

---

## DatabaseModule

**File:** `src/database/database.module.ts`

```
DatabaseModule (@Global)
  ├── PrismaService
  └── MasterDataModule
        └── MasterDataService
```

Declared global — no other module needs to import `DatabaseModule` explicitly to access `PrismaService` or `MasterDataService`.
