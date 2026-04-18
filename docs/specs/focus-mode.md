# Focus Mode Module — Test Cases

Service: `FocusModeService`

---

## getFocusModes

### TC-FMODE-01 — Returns all focus modes for a user

**Description:** Retrieves every focus mode belonging to the authenticated user.

**Input:** `userId: "user-1"` *(two focus mode records)*

**Expected Result:** Returns `[{ modeId: "m1", title: "Study", ... }, { modeId: "m2", title: "Work", ... }]`. `focusMode.findMany` is called with `{ where: { userId } }`.

---

### TC-FMODE-02 — Returns empty array when user has no focus modes

**Description:** Passes through an empty array when no focus modes exist for the user.

**Input:** `userId: "user-1"` *(query returns `[]`)*

**Expected Result:** Returns `[]`.

---

## createFocusMode

### TC-FMODE-03 — Creates a focus mode with provided fields

**Description:** Successfully creates a new focus mode with all provided fields.

**Input:**
- `userId: "user-1"`
- `data: { title: "Deep Focus", blackListedApps: ["twitter", "instagram"], userUnblockActionId: undefined }`

**Expected Result:** Returns the created object. `focusMode.create` is called with `{ data: { userId, title, blackListedApps, userUnblockActionId } }`.

---

### TC-FMODE-04 — Defaults blackListedApps to empty array when not provided

**Description:** When `blackListedApps` is absent from the payload, it defaults to `[]`.

**Input:**
- `userId: "user-1"`
- `data: { title: "Light Focus" }` *(no blackListedApps)*

**Expected Result:** `focusMode.create` is called with `blackListedApps: []`.

---

## updateFocusMode

### TC-FMODE-05 — Updates focus mode when it belongs to user

**Description:** Updates the focus mode after verifying ownership.

**Input:**
- `userId: "user-1"`
- `modeId: "m1"` *(exists and belongs to user)*
- `data: { title: "Updated Study" }`

**Expected Result:** Returns the updated record. `focusMode.findFirst` verifies ownership, then `focusMode.update` is called with `{ where: { modeId }, data }`.

---

### TC-FMODE-06 — Throws NOT_FOUND when focus mode does not exist or belong to user

**Description:** Rejects the update when no focus mode matches both `modeId` and `userId`.

**Input:**
- `userId: "user-1"`
- `modeId: "m-missing"`
- `data: {}`

**Expected Result:** Throws `HttpApiException` with HTTP 404 Not Found, error code `FOCUS_MODE_NOT_FOUND`, and message `"Focus mode with ID 'm-missing' not found."`. `focusMode.update` is never called.

---

## deleteFocusMode

### TC-FMODE-07 — Deletes focus mode when it belongs to user

**Description:** Removes the focus mode record after confirming ownership.

**Input:**
- `userId: "user-1"`
- `modeId: "m1"` *(exists and belongs to user)*

**Expected Result:** Returns the deleted record. `focusMode.findFirst` verifies ownership before `focusMode.delete` is called with `{ where: { modeId } }`.

---

### TC-FMODE-08 — Throws NOT_FOUND when focus mode does not exist or belong to user

**Description:** Rejects deletion when no matching (`modeId`, `userId`) record is found.

**Input:**
- `userId: "user-1"`
- `modeId: "m-missing"`

**Expected Result:** Throws `HttpApiException` with HTTP 404 Not Found, error code `FOCUS_MODE_NOT_FOUND`, and message `"Focus mode with ID 'm-missing' not found."`. `focusMode.delete` is never called.
