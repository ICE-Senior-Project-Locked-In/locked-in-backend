# Focus Log Module — Test Cases

Service: `FocusLogService`

---

## getFocusLogsByUserId

### TC-FLOG-01 — Returns all focus logs for a user ordered by createdAt descending

**Description:** Retrieves the complete list of focus session logs belonging to the specified user, sorted newest first.

**Input:** `userId: "user-1"` *(two logs exist for this user)*

**Expected Result:** Returns the array of log objects `[{ logId: "log-1" }, { logId: "log-2" }]` in descending `createdAt` order.

---

## getActiveFocusLogByUserId

### TC-FLOG-02 — Returns the active (open) focus log for a user

**Description:** Finds the most recently started focus log that has not yet been ended (i.e. `endTime` is null).

**Input:** `userId: "user-1"` *(one active log with `endTime: null` exists)*

**Expected Result:** Returns the active log object `{ logId: "log-active", endTime: null }`.

---

## startFocusLog

### TC-FLOG-03 — Creates and returns a new focus log entry

**Description:** Starts a new focus session for the user with the given focus type and start timestamp.

**Input:**
- `userId: "user-1"`
- `typeId: "type-1"`
- `startTime: new Date("2026-01-01T00:00:00.000Z")`

**Expected Result:** Returns the created log `{ logId: "log-1", userId: "user-1", typeId: "type-1", startTime }`. `focusLog.create` is called with `{ data: { userId, typeId, startTime } }`.

---

## endFocusLog

### TC-FLOG-04 — Ends a focus log that belongs to the user

**Description:** Sets the `endTime` on the specified log, provided the log exists and belongs to the requesting user.

**Input:**
- `userId: "user-1"`
- `logId: "log-1"`
- `endTime: new Date("2026-01-01T01:00:00.000Z")`

**Expected Result:** Returns the updated log `{ logId: "log-1", userId: "user-1", endTime }`. `focusLog.findFirst` is called to verify ownership before `focusLog.update` is called.

---

### TC-FLOG-05 — Throws NOT_FOUND when ending a log not owned by the user

**Description:** Rejects the request when no log matching both `logId` and `userId` is found (either wrong owner or non-existent log).

**Input:**
- `userId: "user-1"`
- `logId: "missing-log"`
- `endTime: new Date("2026-01-01T01:00:00.000Z")`

**Expected Result:** Throws `HttpApiException` with HTTP 404 Not Found and error code `FOCUS_LOG_NOT_FOUND` with message `"Focus log not found for the user"`. `focusLog.update` is never called.
