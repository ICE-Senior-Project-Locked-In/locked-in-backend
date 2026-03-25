# API Documentation

This backend exposes a versioned REST API built with NestJS.

## Base URLs

- API base path: `/api/v1`
- Swagger UI: `/docs`
- OpenAPI JSON: `/openapi.json`

## Authentication

Most endpoints require a Bearer access token.

- Header: `Authorization: Bearer <accessToken>`
- Refresh token is handled through an HTTP-only cookie (`refreshToken`) on auth endpoints.

## Response Format

The project uses a global response wrapper for most endpoints. `DELETE` endpoints that use `@SkipResponseWrapper()` return no body (`204 No Content`).

## Endpoint Groups

### Auth (`/api/v1/auth`)

- `POST /register` — register user
- `POST /login` — login user
- `POST /refresh` — refresh access token (requires refresh cookie)
- `POST /logout` — logout and clear refresh cookie
- `POST /revoke` — revoke refresh token
- `GET /me` — current authenticated user

### User (`/api/v1/user`)

- `GET /` — paginated users list
- `GET /:userId` — user by id

### Friend (`/api/v1/friend`)

- `GET /` — current user's friends (paginated)
- `POST /request/:receiverId` — send friend request
- `PUT /request/:friendshipId?status=<status>` — update friend request status
- `DELETE /:friendshipId` — delete friendship

### Focus Type (`/api/v1/focus-type`)

- `GET /` — all focus types
- `GET /default` — default focus types
- `GET /me` — current user's focus types
- `POST /` — create focus type
- `POST /me` — add focus type to current user
- `DELETE /me/:typeId` — remove user focus type

### Focus Log (`/api/v1/focus-log`)

- `GET /me` — current user's focus logs
- `GET /me/active` — current user's active focus log
- `POST /me/start` — start focus log
- `PUT /me/:logId/end` — end focus log

### Unblock Action (`/api/v1/unblock-action`)

- `GET /` — all unblock actions
- `GET /default` — default unblock actions
- `GET /me` — current user's unblock actions
- `POST /` — create unblock action
- `POST /me` — add unblock action to current user
- `DELETE /me/:actionId` — remove user unblock action

### NFC (`/api/v1/nfc`)

- `POST /` — pair NFC device
- `DELETE /` — unpair NFC device

## Source of Truth

Use Swagger for request/response schema details, examples, and model definitions:

- `/docs` for interactive docs
- `/openapi.json` for machine-readable spec
