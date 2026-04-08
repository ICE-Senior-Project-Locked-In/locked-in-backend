# Auth Module

Handles user authentication including registration, login, token refresh, and logout. Uses JWT access tokens and httpOnly cookie-based refresh tokens.

---

## Endpoints

### POST `/v1/auth/register`

Register a new user account.

**Request DTO — `RegisterDto`**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes | User email address |
| `password` | `string` | Yes | User password |
| `name` | `string` | No | Display name |

**Response — `AuthResponseDto`**
```json
{
  "data": {
    "user": {
      "userId": "uuid",
      "email": "string",
      "name": "string",
      "createdAt": "ISO datetime",
      "updatedAt": "ISO datetime"
    },
    "accessToken": "string"
  }
}
```
Sets `refreshToken` as httpOnly cookie.

---

### POST `/v1/auth/login`

Authenticate an existing user.

**Request DTO — `LoginDto`**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes | User email address |
| `password` | `string` | Yes | User password |

**Response — `AuthResponseDto`**
Same as register response. Sets `refreshToken` as httpOnly cookie.

---

### POST `/v1/auth/refresh`

Refresh the access token using the refresh token stored in the cookie.

**Request** — No body. Reads `refreshToken` from httpOnly cookie.

**Response — `AuthResponseDto`**
Same as login response. Rotates the refresh token cookie.

---

### POST `/v1/auth/logout`

Invalidate the current refresh token session.

**Request** — No body. Reads `refreshToken` from httpOnly cookie.

**Response** — `204 No Content`. Clears the refresh token cookie.

---

### POST `/v1/auth/revoke`

Revoke a specific refresh token.

**Request** — No body. Reads `refreshToken` from httpOnly cookie.

**Response** — `204 No Content`.

---

### GET `/v1/auth/me`

Get the currently authenticated user's profile.

**Request** — No body. Requires `Authorization: Bearer <accessToken>` header.

**Response — `CurrentUserResponseDto`**
```json
{
  "data": {
    "userId": "uuid",
    "email": "string",
    "name": "string",
    "createdAt": "ISO datetime",
    "updatedAt": "ISO datetime"
  }
}
```

---

## Notes

- All endpoints except `register` and `login` require a valid access token or refresh token cookie.
- Access tokens are short-lived JWTs passed in the `Authorization: Bearer` header.
- Refresh tokens are stored as httpOnly cookies named `refreshToken`.
