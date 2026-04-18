# Auth Module — Test Cases

Service: `AuthService`

---

## register

### TC-AUTH-01 — Register a new user and return tokens

**Description:** Successfully registers a new user, hashes their password, seeds default unblock actions, stores a refresh token in Redis, and returns both JWT tokens along with the user profile.

**Input:**
```json
{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User"
}
```

**Expected Result:** Returns `{ user, accessToken, refreshToken }`. `user` matches the created record. Both tokens are non-empty strings. Redis `setex` is called once to store the refresh token.

---

### TC-AUTH-02 — Register seeds default unblock actions

**Description:** When a user is created, their account is pre-populated with all default unblock actions and an empty inventory is created. Focus modes are created by the user after registration.

**Input:**
```json
{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User"
}
```

**Expected Result:** `user.create` is called with `userUnblockActions.create` and `inventory.create` nested in the data payload.

---

### TC-AUTH-03 — Register without a name stores null

**Description:** When `name` is omitted from the registration payload, the user record is created with `name: null`.

**Input:**
```json
{
  "email": "test@example.com",
  "password": "pass"
}
```

**Expected Result:** `user.create` is called with `data.name === null`.

---

### TC-AUTH-04 — Register fails when email is already taken

**Description:** Registration is rejected if a user with the same email already exists in the database.

**Input:**
```json
{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User"
}
```
*(existing user with same email is present)*

**Expected Result:** Throws `HttpApiException` with HTTP 409 Conflict and error code `USER_EXISTS`. `user.create` is never called.

---

## login

### TC-AUTH-05 — Login with valid credentials returns tokens

**Description:** A user with matching email and password receives a fresh access token, a refresh token, and their profile.

**Input:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected Result:** Returns `{ user, accessToken, refreshToken }`. `bcrypt.compare` is called with the plain password and the stored hash. Redis `setex` stores the new refresh token.

---

### TC-AUTH-06 — Login fails when user is not found

**Description:** Login is rejected when no user exists with the provided email.

**Input:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
*(no user in database)*

**Expected Result:** Throws `HttpApiException` with HTTP 401 Unauthorized and error code `INVALID_CREDENTIALS`. `bcrypt.compare` is never called.

---

### TC-AUTH-07 — Login fails when user has no credential record

**Description:** Login is rejected when the user record exists but has no associated credential (e.g. OAuth-only account).

**Input:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
*(user exists but `credential` is null)*

**Expected Result:** Throws `HttpApiException` with HTTP 401 Unauthorized and error code `INVALID_CREDENTIALS`. `bcrypt.compare` is never called.

---

### TC-AUTH-08 — Login fails when password does not match

**Description:** Login is rejected when the user exists and has a credential, but the provided password does not match the stored hash.

**Input:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
*(bcrypt comparison returns false)*

**Expected Result:** Throws `HttpApiException` with HTTP 401 Unauthorized and error code `INVALID_CREDENTIALS`. Redis `setex` is never called.

---

## refreshAccessToken

### TC-AUTH-09 — Refresh tokens successfully rotates both tokens

**Description:** A valid, unexpired refresh JWT that matches a stored Redis record results in a new access token and a new refresh token being issued.

**Input:** A valid refresh JWT string whose decoded payload has `userId: "user-1"` and a `token` field. Redis holds a matching record with a future `expiresAt`.

**Expected Result:** Returns `{ user, accessToken: "new-access-token", refreshToken: "new-refresh-jwt" }`. Redis `setex` is called once to store the rotated token.

---

### TC-AUTH-10 — Refresh fails when token is not in Redis

**Description:** If the decoded JWT references a token ID that does not exist in Redis (e.g. already used or revoked), the request is rejected.

**Input:** Valid JWT; Redis returns `null` for the token key.

**Expected Result:** Throws `HttpApiException` with HTTP 401 Unauthorized and error code `INVALID_REFRESH_TOKEN`. `user.findUnique` is never called.

---

### TC-AUTH-11 — Refresh fails when stored token is expired

**Description:** If the Redis record has a past `expiresAt`, the token is treated as expired and deleted.

**Input:** Valid JWT; Redis record has `expiresAt` in the past.

**Expected Result:** Throws `HttpApiException` with HTTP 401 Unauthorized and error code `REFRESH_TOKEN_EXPIRED`. Redis `del` is called to clean up the expired entry. `user.findUnique` is never called.

---

### TC-AUTH-12 — Refresh fails when stored userId mismatches JWT userId

**Description:** If the `userId` in the Redis record does not match the `userId` decoded from the JWT, the token is rejected as invalid.

**Input:** Valid JWT with `userId: "user-1"`; Redis record contains `userId: "user-DIFFERENT"` with a future `expiresAt`.

**Expected Result:** Throws `HttpApiException` with HTTP 401 Unauthorized and error code `INVALID_REFRESH_TOKEN`.

---

### TC-AUTH-13 — Refresh fails when user no longer exists

**Description:** Token is valid and matches Redis, but the referenced user has been deleted.

**Input:** Valid JWT with `userId: "user-deleted"`; Redis record matches; `user.findUnique` returns `null`.

**Expected Result:** Throws `HttpApiException` with HTTP 404 Not Found and error code `USER_NOT_FOUND`.

---

### TC-AUTH-14 — Refresh fails when JWT is expired

**Description:** `jwt.verify` throws a `TokenExpiredError` because the JWT signature itself has expired.

**Input:** An expired refresh JWT string.

**Expected Result:** Throws `HttpApiException` with HTTP 401 Unauthorized and error code `REFRESH_TOKEN_EXPIRED`.

---

### TC-AUTH-15 — Refresh fails when JWT signature is invalid

**Description:** `jwt.verify` throws a `JsonWebTokenError` due to an invalid signature or malformed token.

**Input:** A tampered or invalid JWT string.

**Expected Result:** Throws `HttpApiException` with HTTP 401 Unauthorized and error code `INVALID_REFRESH_TOKEN`.

---

## logout

### TC-AUTH-16 — Logout deletes the refresh token from Redis

**Description:** Logging out verifies the refresh JWT and deletes the corresponding key from Redis.

**Input:** A valid refresh JWT string.

**Expected Result:** `jwt.verify` is called; Redis `del` is called with the token key. Resolves without error.

---

### TC-AUTH-17 — Logout silently ignores errors

**Description:** If token verification fails (e.g. malformed token), logout swallows the error and resolves cleanly.

**Input:** An invalid JWT string (`"bad-token"`).

**Expected Result:** Promise resolves to `undefined`. No exception is propagated.

---

## revokeRefreshToken

### TC-AUTH-18 — Revoke refresh token deletes it from Redis

**Description:** A valid refresh JWT is verified and the corresponding Redis key is deleted.

**Input:** A valid refresh JWT string.

**Expected Result:** Redis `del` is called. Resolves without error.

---

### TC-AUTH-19 — Revoke fails when JWT is invalid

**Description:** If the provided JWT cannot be verified, revocation throws an error.

**Input:** An invalid JWT string (`"bad-token"`).

**Expected Result:** Throws `HttpApiException` with HTTP 401 Unauthorized, error code `INVALID_REFRESH_TOKEN`, and message `"Invalid refresh token"`.

---

### TC-AUTH-20 — Revoke rethrows unexpected non-JWT errors

**Description:** If Redis raises an unexpected error (e.g. connection lost) after successful JWT verification, the error is rethrown.

**Input:** Valid JWT; Redis `del` rejects with `Error("Redis connection lost")`.

**Expected Result:** Promise rejects with `Error("Redis connection lost")`.

---

## getUserById

### TC-AUTH-21 — Returns user when found

**Description:** Fetches and returns the user record for the given userId.

**Input:** `userId: "user-1"` *(user exists in database)*

**Expected Result:** Returns the user object matching `userId: "user-1"`.

---

### TC-AUTH-22 — Throws NOT_FOUND when user does not exist

**Description:** Throws an error when no user matches the given ID.

**Input:** `userId: "user-missing"` *(no matching record)*

**Expected Result:** Throws `HttpApiException` with HTTP 404 Not Found, error code `USER_NOT_FOUND`, and message `"User not found"`.
