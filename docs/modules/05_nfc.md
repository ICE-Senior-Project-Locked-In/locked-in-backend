# NFC Module

Manages NFC device pairing for users. Each user can pair a single NFC device identified by its serial number.

---

## Endpoints

### POST `/v1/nfc`

Pair an NFC device with the authenticated user.

**Request DTO — `PairNFCDto`**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `serialNumber` | `string` | Yes | Serial number of the NFC device |

**Response — `NFCResponseDto`**
```json
{
  "data": {
    "deviceId": "uuid",
    "userId": "uuid",
    "serialNumber": "string",
    "createdAt": "ISO datetime",
    "updatedAt": "ISO datetime",
    "deletedAt": "ISO datetime | null"
  }
}
```

---

### DELETE `/v1/nfc`

Unpair the NFC device from the authenticated user.

**Request** — No body. Requires auth.

**Response** — `204 No Content`
