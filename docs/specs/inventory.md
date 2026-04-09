# Inventory Module — Test Cases

Service: `InventoryService`

---

## listItemsByUserId

### TC-INV-01 — Returns inventory items for the user

**Description:** Looks up the user's inventory by userId, then fetches all items belonging to that inventory.

**Input:** `userId: "user-1"` *(inventory `inv-1` exists; one item present)*

**Expected Result:** Returns `[{ id: "item-1", inventoryId: "inv-1" }]`. `inventory.findUnique` is called first, then `userInventoryItem.findMany` with `{ where: { inventoryId, item: { type: undefined } } }`.

---

### TC-INV-02 — Filters by item type when provided

**Description:** When an item type filter is passed, only items of that type are returned.

**Input:** `userId: "user-1"`, `type: "CONSUMABLE"` *(inventory exists)*

**Expected Result:** `userInventoryItem.findMany` is called with `{ where: { inventoryId, item: { type: "CONSUMABLE" } } }`.

---

### TC-INV-03 — Throws NOT_FOUND when user inventory does not exist

**Description:** Rejects the request when no inventory record is found for the user.

**Input:** `userId: "user-missing"` *(no inventory record)*

**Expected Result:** Throws `HttpApiException` with HTTP 404 Not Found, error code `INVENTORY_NOT_FOUND`, and message `"Inventory not found for user with ID 'user-missing'."`. `userInventoryItem.findMany` is never called.

---

## createItem

### TC-INV-04 — Creates an inventory item when inventory and item exist

**Description:** Adds a new item to the user's inventory after verifying both the inventory and the item master record exist.

**Input:**
- `userId: "user-1"`
- `data: { itemId: "item-1", quantity: 2 }`

**Expected Result:** Returns the created record `{ id: "ui-1", inventoryId: "inv-1", itemId: "item-1", quantity: 2 }`. `userInventoryItem.create` is called with `{ data: { inventoryId, itemId, quantity: 2 } }`.

---

### TC-INV-05 — Throws NOT_FOUND when inventory does not exist

**Description:** Rejects item creation when the user has no inventory record.

**Input:**
- `userId: "user-missing"`
- `data: { itemId: "item-1" }`

**Expected Result:** Throws `HttpApiException` with HTTP 404 Not Found and error code `INVENTORY_NOT_FOUND`. `userInventoryItem.create` is never called.

---

### TC-INV-06 — Throws NOT_FOUND when item master record does not exist

**Description:** Rejects item creation when the referenced item ID does not exist in the item catalogue.

**Input:**
- `userId: "user-1"` *(inventory exists)*
- `data: { itemId: "item-missing" }`

**Expected Result:** Throws `HttpApiException` with HTTP 404 Not Found, error code `ITEM_NOT_FOUND`, and message `"Item not found with ID 'item-missing'."`. `userInventoryItem.create` is never called.

---

### TC-INV-07 — Throws CONFLICT when item already exists in inventory (P2002)

**Description:** When Prisma raises a P2002 unique constraint violation, the error is converted to a CONFLICT response.

**Input:**
- `userId: "user-1"` *(inventory exists)*
- `data: { itemId: "item-1" }` *(item already in inventory)*

**Expected Result:** Throws `HttpApiException` with HTTP 409 Conflict, error code `INVENTORY_ITEM_ALREADY_EXISTS`, and message `"Item with ID 'item-1' already exists in user's inventory."`.

---

### TC-INV-08 — Rethrows unexpected errors from create

**Description:** Errors that are not P2002 (e.g. database connectivity issues) are rethrown as-is.

**Input:**
- `userId: "user-1"` *(inventory and item exist)*
- `data: { itemId: "item-1" }` — `userInventoryItem.create` rejects with `Error("Database connection lost")`

**Expected Result:** Promise rejects with `Error("Database connection lost")`.

---

## updateItem

### TC-INV-09 — Updates inventory item when item exists

**Description:** Updates fields on an existing inventory item record identified by the composite key (inventoryId, itemId).

**Input:**
- `userId: "user-1"`
- `itemId: "item-1"`
- `data: { quantity: 5 }`

**Expected Result:** Returns the updated record with `quantity: 5`. `userInventoryItem.findUnique` is called first to verify existence, then `userInventoryItem.update` is called with `{ where: { inventoryId_itemId: { inventoryId: "user-1", itemId: "item-1" } }, data }`.

---

### TC-INV-10 — Throws NOT_FOUND when inventory item does not exist

**Description:** Rejects the update when no inventory item matches the given (userId, itemId) composite key.

**Input:**
- `userId: "user-1"`
- `itemId: "item-missing"`
- `data: {}`

**Expected Result:** Throws `HttpApiException` with HTTP 404 Not Found, error code `INVENTORY_ITEM_NOT_FOUND`, and message `"Item not found with ID 'item-missing' in user's inventory."`. `userInventoryItem.update` is never called.
