# Focus Type Module — Test Cases

Service: `FocusTypeService`

---

## getAllFocusTypes

### TC-FTYPE-01 — Returns all focus types

**Description:** Retrieves every focus type in the system without any filtering.

**Input:** *(none)*

**Expected Result:** Returns the full array `[{ typeId: "t1" }, { typeId: "t2" }]`.

---

## getDefaultFocusTypes

### TC-FTYPE-02 — Returns only default focus types

**Description:** Retrieves focus types where `isDefault` is true.

**Input:** *(none — filters internally by `isDefault: true`)*

**Expected Result:** Returns `[{ typeId: "t1", isDefault: true }]`.

---

## getUserFocusTypes

### TC-FTYPE-03 — Returns focus types mapped from user focus type records

**Description:** Retrieves the user's assigned focus types and maps each `userFocusType.focusType` to a flat array of focus type objects.

**Input:** `userId: "user-1"` *(two user-focus-type records with nested `focusType`)*

**Expected Result:** Returns `[{ typeId: "t1", name: "Study" }, { typeId: "t2", name: "Work" }]`.

---

### TC-FTYPE-04 — Returns null when query returns null

**Description:** Passes through `null` if the database query returns `null`.

**Input:** `userId: "user-1"` *(query returns null)*

**Expected Result:** Returns `null`.

---

### TC-FTYPE-05 — Returns empty array when user has no focus types

**Description:** Passes through an empty array if the user has no assigned focus types.

**Input:** `userId: "user-1"` *(query returns `[]`)*

**Expected Result:** Returns `[]`.

---

## createFocusType

### TC-FTYPE-06 — Creates a focus type when the name does not exist

**Description:** Successfully creates a new focus type after confirming no duplicate name exists.

**Input:** `name: "Deep Work"` *(no existing record with this name)*

**Expected Result:** Returns the created object `{ typeId: "t1", name: "Deep Work" }`. `focusType.create` is called with `{ data: { name } }`.

---

### TC-FTYPE-07 — Throws CONFLICT when focus type name already exists

**Description:** Rejects creation when a focus type with the same name already exists.

**Input:** `name: "Deep Work"` *(existing record with name "Deep Work" present)*

**Expected Result:** Throws `HttpApiException` with HTTP 409 Conflict, error code `FOCUS_TYPE_ALREADY_EXISTS`, and message `"Focus type with name 'Deep Work' already exists."`. `focusType.create` is never called.

---

## createUserFocusType

### TC-FTYPE-08 — Creates a user focus type when the pair does not exist

**Description:** Associates a focus type with a user if the (userId, typeId) pair is not already linked.

**Input:**
- `userId: "user-1"`
- `typeId: "type-1"`

*(no existing record for this pair)*

**Expected Result:** Returns the created record `{ id: "uf-1", userId: "user-1", typeId: "type-1" }`. `userFocusType.create` is called with `{ data: { userId, typeId } }`.

---

### TC-FTYPE-09 — Throws CONFLICT when user focus type pair already exists

**Description:** Rejects the request if the (userId, typeId) association already exists.

**Input:**
- `userId: "user-1"`
- `typeId: "type-1"`

*(existing record for this pair)*

**Expected Result:** Throws `HttpApiException` with HTTP 409 Conflict, error code `USER_FOCUS_TYPE_ALREADY_EXISTS`, and message `"User focus type with typeId 'type-1' already exists for user 'user-1'."`. `userFocusType.create` is never called.

---

## deleteUserFocusType

### TC-FTYPE-10 — Deletes user focus type by userId and typeId

**Description:** Removes the association between a user and a focus type.

**Input:**
- `userId: "user-1"`
- `typeId: "type-1"`

**Expected Result:** Returns `{ count: 1 }`. `userFocusType.deleteMany` is called with `{ where: { userId, typeId } }`.
