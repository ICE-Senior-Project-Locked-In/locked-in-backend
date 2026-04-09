# User Module — Test Cases

Service: `UserService`

---

## getUsers

### TC-USER-01 — Returns paginated users without filters

**Description:** Retrieves all users in descending `createdAt` order with no additional filters applied.

**Input:** `userId: "user-1"` *(two other users exist)*

**Expected Result:** Returns `{ data: [{ userId: "user-2" }, { userId: "user-3" }], pagination: <defined> }`. `user.findMany` is called with `{ where: {}, orderBy: { createdAt: "desc" } }`.

---

### TC-USER-02 — Filters users by name (case-insensitive)

**Description:** When a `name` filter is provided, only users whose name contains the search string (case-insensitive) are returned.

**Input:** `userId: "user-1"`, `filters: { name: "alice" }`

**Expected Result:** `user.findMany` and `user.count` are called with `{ where: { name: { contains: "alice", mode: "insensitive" } } }`.

---

### TC-USER-03 — Excludes the current user when excludeCurrentUser is true

**Description:** When `excludeCurrentUser` is set, the requesting user's own record is filtered out of the results.

**Input:** `userId: "user-1"`, `filters: { excludeCurrentUser: true }`

**Expected Result:** `user.findMany` is called with `{ where: { userId: { not: "user-1" } } }`.

---

### TC-USER-04 — Applies both name filter and excludeCurrentUser together

**Description:** Both filters can be combined in a single query.

**Input:** `userId: "user-1"`, `filters: { name: "bob", excludeCurrentUser: true }`

**Expected Result:** `user.findMany` is called with:
```json
{
  "where": {
    "name": { "contains": "bob", "mode": "insensitive" },
    "userId": { "not": "user-1" }
  }
}
```

---

### TC-USER-05 — Includes pagination metadata in the response

**Description:** The response always includes pagination metadata reflecting total count and the requested page parameters.

**Input:** `userId: "user-1"`, `filters: {}`, `pagination: { page: 1, itemsPerPage: 10 }` *(count returns 1)*

**Expected Result:** `result.pagination` contains `{ total: 1 }`.

---

## getUserById

### TC-USER-06 — Returns the user when found

**Description:** Retrieves a single user record by their ID.

**Input:** `userId: "user-1"` *(user exists)*

**Expected Result:** Returns `{ userId: "user-1", email: "test@example.com" }`. `user.findUnique` is called with `{ where: { userId: "user-1" } }`.

---

### TC-USER-07 — Returns null when user is not found

**Description:** Returns `null` when no user matches the given ID.

**Input:** `userId: "user-missing"` *(no record)*

**Expected Result:** Returns `null`.

---

## updateUser

### TC-USER-08 — Updates and returns the user when user exists

**Description:** Updates the user's fields and returns the updated record.

**Input:**
- `userId: "user-1"` *(user exists)*
- `data: { name: "Alice Updated" }`

**Expected Result:** Returns `{ userId: "user-1", email: "test@example.com", name: "Alice Updated" }`. `user.findUnique` verifies existence before `user.update` is called with `{ where: { userId }, data }`.

---

### TC-USER-09 — Throws NOT_FOUND when user does not exist

**Description:** Rejects the update when no user record matches the given ID.

**Input:**
- `userId: "user-missing"` *(no record)*
- `data: { name: "Alice" }`

**Expected Result:** Throws `HttpApiException` with HTTP 404 Not Found, error code `USER_NOT_FOUND`, and message `"User not found with ID 'user-missing'."`. `user.update` is never called.
