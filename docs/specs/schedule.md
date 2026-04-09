# Schedule Module — Test Cases

Service: `ScheduleService`

---

## listByUserId

### TC-SCH-01 — Returns schedules with daysOfWeek mapped from days relation

**Description:** Retrieves all schedules for a user and flattens the nested `days` relation into a `daysOfWeek` number array on each schedule object.

**Input:** `userId: "user-1"` *(two schedules with nested `days` arrays)*

**Expected Result:** Returns:
```json
[
  { "scheduleId": "s1", "title": "Morning Focus", "daysOfWeek": [1, 3, 5], "days": [...] },
  { "scheduleId": "s2", "title": "Evening Review", "daysOfWeek": [0, 6], "days": [...] }
]
```
`focusSchedule.findMany` is called with `{ where: { userId }, include: { days: { select: { dayOfWeek: true } } } }`.

---

### TC-SCH-02 — Returns empty array when user has no schedules

**Description:** Returns an empty array when the user has not created any schedules.

**Input:** `userId: "user-1"` *(no schedule records)*

**Expected Result:** Returns `[]`.

---

## create

### TC-SCH-03 — Creates a schedule with days

**Description:** Creates a new focus schedule along with its associated day-of-week entries in a single nested write.

**Input:**
- `userId: "user-1"`
- `data: { typeId: "type-1", title: "Morning Focus", startTime: "09:00:00", endTime: "10:00:00", daysOfWeek: [1, 3, 5] }`

**Expected Result:** Returns the created schedule. `focusSchedule.create` is called with:
```json
{
  "data": {
    "typeId": "type-1",
    "title": "Morning Focus",
    "startTime": "09:00:00",
    "endTime": "10:00:00",
    "userId": "user-1",
    "days": {
      "create": [{ "dayOfWeek": 1 }, { "dayOfWeek": 3 }, { "dayOfWeek": 5 }]
    }
  }
}
```

---

## update

### TC-SCH-04 — Updates schedule fields and replaces days when schedule exists

**Description:** Updates the schedule's fields and performs a full replacement of its days (delete-then-create) when `daysOfWeek` is provided.

**Input:**
- `userId: "user-1"`
- `scheduleId: "s1"` *(exists and belongs to user)*
- `data: { title: "Updated Focus", daysOfWeek: [2, 4] }`

**Expected Result:** Returns the updated schedule. `focusSchedule.update` is called with `days: { deleteMany: {}, create: [{ dayOfWeek: 2 }, { dayOfWeek: 4 }] }`.

---

### TC-SCH-05 — Updates schedule without replacing days when daysOfWeek is not provided

**Description:** When `daysOfWeek` is absent from the update payload, the `days` relation is not touched.

**Input:**
- `userId: "user-1"`
- `scheduleId: "s1"` *(exists)*
- `data: { title: "Updated Focus" }` *(no daysOfWeek)*

**Expected Result:** `focusSchedule.update` is called without a `days` key in the data payload.

---

### TC-SCH-06 — Throws NOT_FOUND when schedule does not belong to user

**Description:** Rejects the update when no schedule matches both the `scheduleId` and `userId`.

**Input:**
- `userId: "user-1"`
- `scheduleId: "s-missing"`
- `data: {}`

**Expected Result:** Throws `HttpApiException` with HTTP 404 Not Found, error code `SCHEDULE_NOT_FOUND`, and message `"Schedule not found with ID 's-missing'."`. `focusSchedule.update` is never called.

---

## delete

### TC-SCH-07 — Deletes schedule when it belongs to user

**Description:** Removes the schedule record after confirming ownership.

**Input:**
- `userId: "user-1"`
- `scheduleId: "s1"` *(exists and belongs to user)*

**Expected Result:** Returns the deleted record. `focusSchedule.findUnique` verifies ownership before `focusSchedule.delete` is called with `{ where: { scheduleId: "s1", userId: "user-1" } }`.

---

### TC-SCH-08 — Throws NOT_FOUND when schedule does not exist or belong to user

**Description:** Rejects deletion when no matching (scheduleId, userId) record is found.

**Input:**
- `userId: "user-1"`
- `scheduleId: "s-missing"`

**Expected Result:** Throws `HttpApiException` with HTTP 404 Not Found and error code `SCHEDULE_NOT_FOUND`. `focusSchedule.delete` is never called.
