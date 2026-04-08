# User Module

Manages user profiles, including searching/listing users and updating user information.

---

## Endpoints

### GET `/v1/user`

Get a paginated list of users, with optional filtering.

**Query Params — `UserFiltersDto`**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | No | Filter users by name (partial match) |
| `excludeCurrentUser` | `boolean` | No | Exclude the authenticated user from results |
| `page` | `number` | No | Page number |
| `itemsPerPage` | `number` | No | Items per page |

**Response — Paginated `User`**
```json
{
  "data": [
    {
      "userId": "uuid",
      "email": "string",
      "name": "string",
      "balance": 0,
      "createdAt": "ISO datetime",
      "updatedAt": "ISO datetime"
    }
  ],
  "pagination": {
    "page": 1,
    "itemsPerPage": 10,
    "total": 100,
    "hasMore": true
  }
}
```

---

### GET `/v1/user/:userId`

Get a specific user by ID.

**Path Params**
| Param | Type | Description |
|-------|------|-------------|
| `userId` | `UUID` | ID of the user to retrieve |

**Response — `UserResponseDto`**
```json
{
  "data": {
    "userId": "uuid",
    "email": "string",
    "name": "string",
    "balance": 0,
    "createdAt": "ISO datetime",
    "updatedAt": "ISO datetime"
  }
}
```

---

### PUT `/v1/user/:userId`

Update a user's profile.

**Path Params**
| Param | Type | Description |
|-------|------|-------------|
| `userId` | `UUID` | ID of the user to update |

**Request DTO — `UpdateUserDto`**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | No | Updated display name |
| `balance` | `number` | No | Updated balance (must be non-negative) |

**Response — `UserResponseDto`**
Same shape as GET by ID response, with updated fields.
