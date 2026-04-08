# Pet Module

Manages the authenticated user's virtual pet, including creation, updates, and deletion.

---

## Endpoints

### GET `/v1/pet`

Get the authenticated user's pet.

**Request** — No body. Requires auth.

**Response — `PetResponseDto`**
```json
{
  "data": {
    "ownerId": "uuid",
    "name": "string",
    "xp": 0,
    "type": "PetType",
    "createdAt": "ISO datetime",
    "updatedAt": "ISO datetime",
    "deletedAt": "ISO datetime | null"
  }
}
```

---

### POST `/v1/pet`

Create a new pet for the authenticated user.

**Request DTO — `CreatePetDto`**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Pet name |
| `type` | `PetType` | Yes | Pet type (enum from Prisma schema) |

**Response — `PetResponseDto`**
Same shape as GET response.

---

### PUT `/v1/pet`

Update the authenticated user's pet.

**Request DTO — `UpdatePetDto`**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | No | Updated pet name |
| `type` | `PetType` | No | Updated pet type |
| `xp` | `number` | No | Updated experience points |

**Response — `PetResponseDto`**
Same shape as GET response, with updated fields.

---

### DELETE `/v1/pet`

Delete the authenticated user's pet.

**Request** — No body. Requires auth.

**Response** — `204 No Content`
