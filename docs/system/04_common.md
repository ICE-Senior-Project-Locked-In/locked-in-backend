# Common Layer

Shared utilities, abstractions, and cross-cutting concerns used across all feature modules.

**Location:** `src/common/`

---

## Guards

### JwtAuthGuard

**File:** `src/common/http/guards/jwt-auth.guard.ts`

Protects routes that require an authenticated user. Applied per-route or per-controller using `@UseGuards(JwtAuthGuard)`.

**Behavior:**
1. Extracts the `Bearer` token from the `Authorization` header.
2. Verifies the token signature using `jwtSecret` from environment config.
3. Validates that the decoded payload contains `userId` and `email`.
4. Attaches the decoded user as `request.user` (`AuthUser`).
5. Throws `UnauthorizedException` for missing, expired, or malformed tokens, with distinct error messages per failure mode.

---

## Interceptors

### ApiResponseInterceptor

**File:** `src/common/http/interceptors/api-response.interceptor.ts`

A global interceptor that wraps every successful response in a standard envelope.

**Response envelope:**
```json
{
  "success": true,
  "message": "string | null",
  "data": "<handler return value>",
  "timestamp": "ISO 8601"
}
```

**Behavior:**
- Reads `SKIP_RESPONSE_WRAPPER_METADATA_KEY` from handler metadata — if set, passes the response through unchanged.
- Reads `RESPONSE_MESSAGE_METADATA_KEY` to populate the `message` field.
- Determines `success` from the HTTP status code (200–299 = `true`).
- Adds an ISO 8601 `timestamp` to every response.

---

## Decorators

### @CurrentUser()

**File:** `src/common/http/decorators/current-user.decorator.ts`

A parameter decorator that injects the authenticated user into a controller method.

```typescript
@Get('profile')
getProfile(@CurrentUser() user: AuthUser) { ... }
```

Reads from `request.user`, which is populated by `JwtAuthGuard`.

---

### @ResponseMessage(message)

**File:** `src/common/http/decorators/response-message.decorator.ts`

Sets a custom `message` field on the response envelope via handler metadata.

```typescript
@ResponseMessage('User created successfully')
@Post()
create() { ... }
```

---

### @SkipResponseWrapper()

**File:** `src/common/http/decorators/skip-response.decorator.ts`

Instructs `ApiResponseInterceptor` to skip wrapping the response. Useful for file downloads, redirects, or any endpoint that must return a raw response.

```typescript
@SkipResponseWrapper()
@Get('download')
download() { ... }
```

---

## Exceptions

### HttpApiException

**File:** `src/common/exceptions/http-api.exception.ts`

Extends NestJS `HttpException` to produce a standardized error response body.

**Constructor options:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | `HttpStatus` | Yes | HTTP status code |
| `message` | `string` | Yes | Human-readable error message |
| `code` | `string` | No | Machine-readable error code (default: `"UNHANDLED_ERROR"`) |
| `details` | `any` | No | Additional context |
| `cause` | `Error` | No | Original error for stack tracing |

**Error response body:**
```json
{
  "message": "string",
  "code": "ERROR_CODE_CONSTANT",
  "details": "<optional>"
}
```

---

## Helpers

### PaginationHelper

**File:** `src/common/helper/pagination.helper.ts`

Static utility class for consistent pagination across list endpoints.

| Method | Input | Output | Description |
|--------|-------|--------|-------------|
| `getOptions(query)` | Raw query object | `PaginationOptions` | Extracts `page` and `itemsPerPage` |
| `getOffset(pagination)` | `PaginationOptions` | `OffsetPaginationOptions` | Converts to Prisma `{ skip, take }` |
| `getMetaData(total, pagination)` | total count + options | `PaginationMetaData` | Builds metadata for response |

---

## Interfaces

### AuthUser

**File:** `src/common/interfaces/auth-user.interface.ts`

The shape of the authenticated user attached to the request context by `JwtAuthGuard`.

```typescript
interface AuthUser {
  userId: string;
  email: string;
}
```

---

### Pagination Interfaces

**File:** `src/common/interfaces/pagination.interface.ts`

| Interface | Fields | Description |
|-----------|--------|-------------|
| `PaginationOptions` | `page`, `itemsPerPage` | 1-based page/size input |
| `OffsetPaginationOptions` | `skip`, `take` | Prisma-compatible offset/limit |
| `PaginationMetaData` | `offset`, `limit`, `total`, `hasNext`, `hasPrevious` | Response metadata |
| `PaginatedResponse<T>` | `data: T[]`, `pagination: PaginationMetaData` | Generic paginated list |

---

## DTOs and Schemas

### Base Response Schemas

**File:** `src/common/api/api.schema.ts`

Zod schemas used to define and validate API response shapes:

| Export | Description |
|--------|-------------|
| `baseResponseSchema` | Core shape: `{ success, message, timestamp }` |
| `createApiResponseSchema<T>` | Generic factory adding a typed `data` field |
| `emptyResponseSchema` | For endpoints that return no data payload |

### EmptyResponseDto

**File:** `src/common/dto/common.dto.ts`

Derived from `emptyResponseSchema` via `nestjs-zod`. Used for endpoints that return `204 No Content` or an equivalent empty-data response.

---

## Constants

### Metadata Keys

**File:** `src/common/constants/metadata-keys.ts`

| Constant | Value | Used By |
|----------|-------|---------|
| `RESPONSE_MESSAGE_METADATA_KEY` | `"responseMessage"` | `@ResponseMessage()`, `ApiResponseInterceptor` |
| `SKIP_RESPONSE_WRAPPER_METADATA_KEY` | `"skipResponseWrapper"` | `@SkipResponseWrapper()`, `ApiResponseInterceptor` |
