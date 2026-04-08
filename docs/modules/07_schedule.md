# Schedule Module

Manages recurring focus schedules for users. Each schedule defines a focus session that repeats on specified days of the week at a given time range.

---

## Endpoints

### GET `/v1/schedule`

List all focus schedules for the authenticated user.

**Request** — No body. Requires auth.

**Response — `ScheduleListResponseDto`**
```json
{
  "data": [
    {
      "scheduleId": "uuid",
      "userId": "uuid",
      "typeId": "uuid",
      "title": "string",
      "icon": "string | null",
      "startTime": "HH:MM:SS",
      "endTime": "HH:MM:SS",
      "timezone": "string",
      "active": true,
      "daysOfWeek": [0, 1, 2],
      "createdAt": "ISO datetime",
      "updatedAt": "ISO datetime"
    }
  ]
}
```

---

### POST `/v1/schedule`

Create a new focus schedule.

**Request DTO — `CreateScheduleDto`**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `typeId` | `UUID` | Yes | Focus type ID |
| `title` | `string` | Yes | Schedule title |
| `icon` | `string` | No | Icon identifier |
| `startTime` | `ISO time` | Yes | Daily start time |
| `endTime` | `ISO time` | Yes | Daily end time |
| `timezone` | `string` | No | Timezone string (e.g. `"Asia/Bangkok"`) |
| `daysOfWeek` | `number[]` | Yes | Days of week (0=Sun … 6=Sat); min 1, no duplicates |

**Response — `ScheduleResponseDto`**
```json
{
  "data": {
    "scheduleId": "uuid",
    "userId": "uuid",
    "typeId": "uuid",
    "title": "string",
    "icon": "string | null",
    "startTime": "HH:MM:SS",
    "endTime": "HH:MM:SS",
    "timezone": "string",
    "active": true,
    "daysOfWeek": [1, 3, 5],
    "createdAt": "ISO datetime",
    "updatedAt": "ISO datetime"
  }
}
```

---

### PUT `/v1/schedule/:scheduleId`

Update an existing focus schedule.

**Path Params**
| Param | Type | Description |
|-------|------|-------------|
| `scheduleId` | `UUID` | ID of the schedule to update |

**Request DTO — `UpdateScheduleDto`**
All fields from `CreateScheduleDto` are optional.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `typeId` | `UUID` | No | Focus type ID |
| `title` | `string` | No | Schedule title |
| `icon` | `string` | No | Icon identifier |
| `startTime` | `ISO time` | No | Daily start time |
| `endTime` | `ISO time` | No | Daily end time |
| `timezone` | `string` | No | Timezone string |
| `daysOfWeek` | `number[]` | No | Days of week (0=Sun … 6=Sat) |

**Response — `ScheduleResponseDto`**
Same shape as POST response, with updated fields.

---

### DELETE `/v1/schedule/:scheduleId`

Delete a focus schedule.

**Path Params**
| Param | Type | Description |
|-------|------|-------------|
| `scheduleId` | `UUID` | ID of the schedule to delete |

**Response** — `204 No Content`

---

## Notes

- `daysOfWeek` values: `0` = Sunday, `1` = Monday, …, `6` = Saturday.
- At least one day must be specified; duplicate values are not allowed.
