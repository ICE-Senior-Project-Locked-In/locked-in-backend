# Unblock Action Module — Test Cases

Service: `UnblockActionService`

---

## getAllUnblockActions

### TC-UBA-01 — Returns all unblock actions

**Description:** Retrieves every unblock action in the system without any filtering.

**Input:** *(none)*

**Expected Result:** Returns `[{ actionId: "a1" }, { actionId: "a2" }]`. `unblockAction.findMany` is called with no arguments.

---

## getDefaultUnblockActions

### TC-UBA-02 — Returns only default unblock actions

**Description:** Retrieves unblock actions where `isDefault` is true.

**Input:** *(none — filters internally by `isDefault: true`)*

**Expected Result:** Returns `[{ actionId: "a1", isDefault: true }]`.

---

## getUserUnblockActions

### TC-UBA-03 — Returns unblock actions mapped from user unblock action records

**Description:** Retrieves a user's assigned unblock actions and flattens the nested `unblockAction` relation into a flat array.

**Input:** `userId: "user-1"` *(two user-unblock-action records with nested `unblockAction`)*

**Expected Result:** Returns `[{ actionId: "a1", name: "Walk" }, { actionId: "a2", name: "Water" }]`.

---

### TC-UBA-04 — Returns null when query returns null

**Description:** Passes through `null` if the database query returns `null`.

**Input:** `userId: "user-1"` *(query returns null)*

**Expected Result:** Returns `null`.

---

## createUnblockAction

### TC-UBA-05 — Creates unblock action when name does not exist

**Description:** Creates a new unblock action after confirming no duplicate name exists.

**Input:** `name: "Stretch"` *(no existing record with this name)*

**Expected Result:** Returns `{ actionId: "a1", name: "Stretch" }`. `unblockAction.findFirst` checks for duplicates before `unblockAction.create` is called with `{ data: { name: "Stretch" } }`.

---

### TC-UBA-06 — Throws CONFLICT when creating duplicate unblock action name

**Description:** Rejects creation when an unblock action with the same name already exists.

**Input:** `name: "Stretch"` *(existing record with name "Stretch")*

**Expected Result:** Throws `HttpApiException` with HTTP 409 Conflict, error code `UNBLOCK_ACTION_ALREADY_EXISTS`, and message `"Unblock action with name 'Stretch' already exists."`. `unblockAction.create` is never called.

---

## createUserUnblockAction

### TC-UBA-07 — Creates user unblock action when pair does not exist

**Description:** Associates an unblock action with a user if the (userId, actionId) pair does not already exist.

**Input:**
- `userId: "user-1"`
- `actionId: "action-1"`

*(no existing record for this pair)*

**Expected Result:** Returns `{ userId: "user-1", actionId: "action-1" }`. `userUnblockAction.findFirst` checks for duplicates before `userUnblockAction.create` is called with `{ data: { userId, actionId } }`.

---

### TC-UBA-08 — Throws CONFLICT when creating duplicate user unblock action

**Description:** Rejects the request if the (userId, actionId) association already exists.

**Input:**
- `userId: "user-1"`
- `actionId: "action-1"`

*(existing record for this pair)*

**Expected Result:** Throws `HttpApiException` with HTTP 409 Conflict, error code `USER_UNBLOCK_ACTION_ALREADY_EXISTS`, and message `"User unblock action with actionId 'action-1' already exists for user 'user-1'."`. `userUnblockAction.create` is never called.

---

## deleteUserUnblockAction

### TC-UBA-09 — Deletes user unblock action by userId and actionId

**Description:** Removes the association between a user and an unblock action.

**Input:**
- `userId: "user-1"`
- `actionId: "action-1"`

**Expected Result:** Returns `{ count: 1 }`. `userUnblockAction.deleteMany` is called with `{ where: { userId: "user-1", actionId: "action-1" } }`.
