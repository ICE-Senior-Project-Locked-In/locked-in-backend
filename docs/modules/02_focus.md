# Focus Module

Manages user focus sessions and focus types. Split into two sub-modules: **Focus Log** (session tracking) and **Focus Type** (session categories).

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
      "typeId": "uuid",
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
    "typeId": "uuid",
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
| `typeId` | `UUID` | Yes | Focus type ID |
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

## Focus Type

Manage categories (types) for focus sessions.

### GET `/v1/focus-type`

Get all focus types (default and custom).

**Request** — No body.

**Response — `FocusTypeListResponseDto`**
```json
{
  "data": [
    {
      "typeId": "uuid",
      "name": "string",
      "isDefault": "boolean",
      "createdAt": "ISO datetime",
      "updatedAt": "ISO datetime"
    }
  ]
}
```

---

### GET `/v1/focus-type/default`

Get only default focus types.

**Request** — No body.

**Response — `FocusTypeListResponseDto`**
Same shape as GET all, filtered to `isDefault: true`.

---

### GET `/v1/focus-type/me`

Get focus types associated with the authenticated user.

**Request** — No body. Requires auth.

**Response — `UserFocusTypeListResponseDto`**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "typeId": "uuid",
      "createdAt": "ISO datetime",
      "updatedAt": "ISO datetime"
    }
  ]
}
```

---

### POST `/v1/focus-type`

Create a new focus type.

**Request DTO — `CreateFocusTypeDto`**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Focus type name |

**Response — `FocusTypeResponseDto`**
```json
{
  "data": {
    "typeId": "uuid",
    "name": "string",
    "isDefault": false,
    "createdAt": "ISO datetime",
    "updatedAt": "ISO datetime"
  }
}
```

---

### POST `/v1/focus-type/me`

Associate an existing focus type with the authenticated user.

**Request DTO — `CreateUserFocusTypeDto`**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `typeId` | `UUID` | Yes | Focus type ID to associate |

**Response — `UserFocusTypeResponseDto`**
```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "typeId": "uuid",
    "createdAt": "ISO datetime",
    "updatedAt": "ISO datetime"
  }
}
```

---

### DELETE `/v1/focus-type/me/:typeId`

Remove a focus type association from the authenticated user.

**Path Params**
| Param | Type | Description |
|-------|------|-------------|
| `typeId` | `UUID` | Focus type ID to disassociate |

**Response** — `204 No Content`
