# Inventory Module

Manages the authenticated user's inventory of items, including quantities and custom attributes.

---

## Endpoints

### GET `/v1/inventory`

List all inventory items belonging to the authenticated user.

**Request** — No body. Requires auth.

**Response — `InventoryItemListResponseDto`**
```json
{
  "data": [
    {
      "id": "uuid",
      "inventoryId": "uuid",
      "itemId": "uuid",
      "quantity": 1,
      "customAttributes": {
        "key": "value"
      },
      "createdAt": "ISO datetime",
      "updatedAt": "ISO datetime"
    }
  ]
}
```

---

### POST `/v1/inventory`

Add a new item to the authenticated user's inventory.

**Request DTO — `CreateInventoryItemDto`**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `itemId` | `UUID` | Yes | ID of the item to add |
| `quantity` | `number` | No | Quantity (default: 1) |
| `customAttributes` | `Record<string, string>` | No | Arbitrary key-value metadata |

**Response — `InventoryItemResponseDto`**
```json
{
  "data": {
    "id": "uuid",
    "inventoryId": "uuid",
    "itemId": "uuid",
    "quantity": 1,
    "customAttributes": {},
    "createdAt": "ISO datetime",
    "updatedAt": "ISO datetime"
  }
}
```

---

### PUT `/v1/inventory/:itemId`

Update an existing inventory item.

**Path Params**
| Param | Type | Description |
|-------|------|-------------|
| `itemId` | `UUID` | ID of the inventory item to update |

**Request DTO — `UpdateInventoryItemDto`**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `quantity` | `number` | No | Updated quantity |
| `customAttributes` | `Record<string, string>` | No | Updated custom attributes |

**Response — `InventoryItemResponseDto`**
Same shape as POST response, with updated fields.
