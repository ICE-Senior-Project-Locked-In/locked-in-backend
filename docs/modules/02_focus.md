# Focus Module

Manages user focus sessions and focus modes. Split into two sub-modules: **Focus Log** (session tracking) and **Focus Mode** (user-defined session configurations).

---

## Focus Log

Track the start and end of user focus sessions.

### GET `/v1/focus-log`

Get all focus logs for the authenticated user.

**Request** — No body. Requires auth.

**Response — `FocusLogListResponseDto`**
```json
{
  "data": [
    {
      "logId": "uuid",
      "userId": "uuid",
      "modeId": "uuid",
      "startTime": "ISO datetime",
      "endTime": "ISO datetime | null",
      "createdAt": "ISO datetime",
      "updatedAt": "ISO datetime"
    }
  ]
}
```

---

### GET `/v1/focus-log/active`

Get the currently active (unfinished) focus log for the authenticated user.

**Request** — No body. Requires auth.

**Response — `FocusLogResponseDto`**
```json
{
  "data": {
    "logId": "uuid",
    "userId": "uuid",
    "modeId": "uuid",
    "startTime": "ISO datetime",
    "endTime": null,
    "createdAt": "ISO datetime",
    "updatedAt": "ISO datetime"
  }
}
```

---

### POST `/v1/focus-log/start`

Start a new focus log session.

**Request DTO — `StartFocusLogDto`**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `modeId` | `UUID` | Yes | Focus mode ID |
| `startTime` | `ISO datetime` | Yes | Session start time |

**Response — `FocusLogResponseDto`**
Same shape as GET active response.

---

### PUT `/v1/focus-log/:logId/end`

End an active focus log session.

**Path Params**
| Param | Type | Description |
|-------|------|-------------|
| `logId` | `UUID` | ID of the focus log to end |

**Request DTO — `EndFocusLogDto`**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `endTime` | `ISO datetime` | Yes | Session end time |

**Response — `FocusLogResponseDto`**
Same shape as GET active response, with `endTime` populated.

---

## Focus Mode

Manage user-defined focus modes. Each mode belongs to the authenticated user and specifies a title, blocked apps, and an optional unblock action.

### GET `/v1/focus-mode`

Get all focus modes for the authenticated user.

**Request** — No body. Requires auth.

**Response — `FocusModeListResponseDto`**
```json
{
  "data": [
    {
      "modeId": "uuid",
      "userId": "uuid",
      "title": "string",
      "blackListedApps": ["string"],
      "userUnblockActionId": "uuid | null",
      "createdAt": "ISO datetime",
      "updatedAt": "ISO datetime"
    }
  ]
}
```

---

### POST `/v1/focus-mode`

Create a new focus mode for the authenticated user.

**Request DTO — `CreateFocusModeDto`**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | Yes | Name for the focus mode |
| `blackListedApps` | `string[]` | No | Apps to block during this mode (default: `[]`) |
| `userUnblockActionId` | `UUID` | No | User unblock action assigned to this mode |

**Response — `FocusModeResponseDto`**
```json
{
  "data": {
    "modeId": "uuid",
    "userId": "uuid",
    "title": "string",
    "blackListedApps": ["string"],
    "userUnblockActionId": "uuid | null",
    "createdAt": "ISO datetime",
    "updatedAt": "ISO datetime"
  }
}
```

---

### PUT `/v1/focus-mode/:modeId`

Update an existing focus mode.

**Path Params**
| Param | Type | Description |
|-------|------|-------------|
| `modeId` | `UUID` | ID of the focus mode to update |

**Request DTO — `UpdateFocusModeDto`**
All fields are optional.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | No | Name for the focus mode |
| `blackListedApps` | `string[]` | No | Apps to block during this mode |
| `userUnblockActionId` | `UUID` | No | User unblock action assigned to this mode |

**Response — `FocusModeResponseDto`**
Same shape as POST response, with updated fields.

---

### DELETE `/v1/focus-mode/:modeId`

Delete a focus mode belonging to the authenticated user.

**Path Params**
| Param | Type | Description |
|-------|------|-------------|
| `modeId` | `UUID` | ID of the focus mode to delete |

**Response** — `204 No Content`
