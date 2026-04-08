# Unblock Action Module

Manages unblock actions — activities a user must complete to unlock the app during a focus session. Supports global action definitions and per-user action associations.

---

## Endpoints

### GET `/v1/unblock-action`

Get all unblock actions (default and custom).

**Request** — No body.

**Response — `UnblockActionListResponseDto`**
```json
{
  "data": [
    {
      "actionId": "uuid",
      "name": "string",
      "isDefault": true,
      "createdAt": "ISO datetime",
      "updatedAt": "ISO datetime"
    }
  ]
}
```

---

### GET `/v1/unblock-action/default`

Get only default unblock actions.

**Request** — No body.

**Response — `UnblockActionListResponseDto`**
Same shape as GET all, filtered to `isDefault: true`.

---

### GET `/v1/unblock-action/me`

Get unblock actions associated with the authenticated user.

**Request** — No body. Requires auth.

**Response — `UserUnblockActionListResponseDto`**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "actionId": "uuid",
      "createdAt": "ISO datetime",
      "updatedAt": "ISO datetime"
    }
  ]
}
```

---

### POST `/v1/unblock-action`

Create a new global unblock action.

**Request DTO — `CreateUnblockActionDto`**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Action name |

**Response — `UnblockActionResponseDto`**
```json
{
  "data": {
    "actionId": "uuid",
    "name": "string",
    "isDefault": false,
    "createdAt": "ISO datetime",
    "updatedAt": "ISO datetime"
  }
}
```

---

### POST `/v1/unblock-action/me`

Associate an existing unblock action with the authenticated user.

**Request DTO — `CreateUserUnblockActionDto`**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `actionId` | `UUID` | Yes | Unblock action ID to associate |

**Response — `UserUnblockActionResponseDto`**
```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "actionId": "uuid",
    "createdAt": "ISO datetime",
    "updatedAt": "ISO datetime"
  }
}
```

---

### DELETE `/v1/unblock-action/me/:actionId`

Remove an unblock action association from the authenticated user.

**Path Params**
| Param | Type | Description |
|-------|------|-------------|
| `actionId` | `UUID` | Unblock action ID to disassociate |

**Response** — `204 No Content`
