# System Architecture Overview

This API is built with **NestJS** using a layered, modular architecture. Each concern is separated into distinct layers: bootstrap, feature modules, shared infrastructure, and common utilities.

---

## Layer Diagram

```
┌─────────────────────────────────────────────────┐
│                    main.ts                      │
│   (bootstrap, middleware, versioning, Swagger)  │
└────────────────────────┬────────────────────────┘
                         │
┌────────────────────────▼────────────────────────┐
│                  AppModule                      │
│          (root module, wires all layers)        │
└──┬───────────┬──────────────┬───────────────────┘
   │           │              │
   ▼           ▼              ▼
┌──────┐  ┌────────┐  ┌────────────────────────────┐
│Infra │  │  DB    │  │      Feature Modules       │
│Module│  │ Module │  │  auth, user, friend, nfc   │
│Redis │  │ Prisma │  │  focus, pet, schedule,     │
│      │  │ Master │  │  inventory, unblock-action │
│      │  │  Data  │  │                            │
└──────┘  └────────┘  └────────────────────────────┘
                         │
                         ▼
              ┌───────────────────────┐
              │    Common Layer       │
              │  guards, interceptors │
              │  decorators, helpers  │
              │  exceptions, DTOs     │
              └───────────────────────┘
```

---

## Bootstrap (`main.ts`)

The application entry point configures the following before listening:

| Concern | Implementation |
|---------|---------------|
| Security headers | Helmet with custom CSP directives |
| CORS | Configurable allowed origins via env |
| Cookie parsing | `cookie-parser` middleware |
| Request validation | Global `ZodValidationPipe` |
| API versioning | URI-based versioning, default version `1` (e.g. `/v1/...`) |
| API docs | Swagger/OpenAPI served at `/docs` |
| Response shaping | Global `ApiResponseInterceptor` |
| Unhandled errors | Listeners for `unhandledRejection` and `uncaughtException` |

---

## Module Graph

```
AppModule
├── LoggerModule
├── DatabaseModule (global)   ← PrismaService, MasterDataService
├── InfrastructureModule (global) ← RedisService
├── AuthModule
├── UserModule
├── FriendModule
├── NFCModule
├── FocusModeModule
├── FocusLogModule
├── UnblockActionModule
├── PetModule
├── ScheduleModule
└── InventoryModule
```

`DatabaseModule` and `InfrastructureModule` are declared `@Global()`, meaning their exported services (`PrismaService`, `RedisService`) are available to every module without an explicit import.

---

## Request Lifecycle

```
Incoming HTTP Request
       │
       ▼
  Middleware (Helmet, CORS, CookieParser)
       │
       ▼
  Guards (JwtAuthGuard — verifies Bearer token, attaches AuthUser)
       │
       ▼
  Route Handler (Controller)
       │
       ▼
  Service (business logic, calls PrismaService / RedisService)
       │
       ▼
  ApiResponseInterceptor (wraps response in standard envelope)
       │
       ▼
  HTTP Response
```

Errors thrown during any phase are caught by NestJS's built-in exception filter and shaped into the standard error format via `HttpApiException`.

---

## Standard Response Envelope

All endpoints (except those decorated with `@SkipResponseWrapper()`) return:

```json
{
  "success": true,
  "message": "string | null",
  "data": "<endpoint-specific payload>",
  "timestamp": "ISO 8601 datetime"
}
```

Paginated endpoints extend this with:

```json
{
  "pagination": {
    "offset": 0,
    "limit": 10,
    "total": 100,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

## Error Response Format

```json
{
  "message": "Human-readable error message",
  "code": "ERROR_CODE_CONSTANT",
  "details": "<optional additional context>"
}
```

Errors are raised via `HttpApiException`, which extends NestJS `HttpException` and maps to the above structure.
