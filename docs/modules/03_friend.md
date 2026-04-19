# Friend Module

Manages friend relationships between users, including sending, accepting, rejecting, and removing friendships.

---

## Endpoints

### GET `/v1/friend`

Get the authenticated user's friends list (accepted friendships only), with pagination.

**Query Params — `FriendFiltersDto`**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
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

### POST `/v1/friend/request/:receiverId`

Send a friend request to another user.

**Path Params**
| Param | Type | Description |
|-------|------|-------------|
| `receiverId` | `UUID` | ID of the user to send the request to |

**Request** — No body. Requires auth.

**Response — `FriendshipResponseDto`**
```json
{
  "data": {
    "friendshipId": "uuid",
    "senderId": "uuid",
    "receiverId": "uuid",
    "status": "PENDING",
    "createdAt": "ISO datetime",
    "updatedAt": "ISO datetime"
  }
}
```

---

### PUT `/v1/friend/request/:friendshipId`

Accept or reject a pending friend request.

**Path Params**
| Param | Type | Description |
|-------|------|-------------|
| `friendshipId` | `UUID` | ID of the friendship to update |

**Query Params — `UpdateFriendRequestQueryDto`**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | `"ACCEPTED" \| "REJECTED"` | Yes | New friendship status |

**Response — `FriendshipResponseDto`**
Same shape as POST response, with updated `status`.

---

### DELETE `/v1/friend/:friendshipId`

Remove a friendship.

**Path Params**
| Param | Type | Description |
|-------|------|-------------|
| `friendshipId` | `UUID` | ID of the friendship to delete |

**Response** — `204 No Content`

---

### GET `/v1/friend/leaderboard`

Get the authenticated user and all their accepted friends ranked by total completed focus time.

**Query Params — `LeaderboardQueryDto`**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `startDate` | ISO 8601 datetime | No | Lower bound for focus log `startTime` filter |
| `endDate` | ISO 8601 datetime | No | Upper bound for focus log `startTime` filter |
| `top` | positive integer | No | Limit results to top N; current user always included even if outside top N |

- Omitting both `startDate` and `endDate` returns all-time totals.
- Only completed focus logs (`endTime != null`) are counted.
- `totalFocusTime` is in seconds.
- Ties share the same rank (dense ranking).

**Response — `LeaderboardResponseDto`**
```json
{
  "data": [
    {
      "rank": 1,
      "totalFocusTime": 7200,
      "user": {
        "userId": "uuid",
        "email": "string",
        "name": "string",
        "balance": 0,
        "createdAt": "ISO datetime",
        "updatedAt": "ISO datetime"
      }
    }
  ]
}
```

---

## Notes

- `FriendshipStatus` enum values: `PENDING`, `ACCEPTED`, `REJECTED`
- Only friendships with `ACCEPTED` status appear in the GET friends list.
