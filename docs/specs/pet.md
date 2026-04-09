# Pet Module — Test Cases

Service: `PetService`

---

## findByOwnerId

### TC-PET-01 — Returns the pet for the given owner

**Description:** Retrieves the pet record associated with the specified owner ID.

**Input:** `ownerId: "owner-1"` *(pet `{ ownerId, name: "Buddy", type: "CAT" }` exists)*

**Expected Result:** Returns the pet object. `pet.findUnique` is called with `{ where: { ownerId: "owner-1" } }`.

---

### TC-PET-02 — Returns null when no pet exists for the owner

**Description:** Returns `null` when the owner has not created a pet yet.

**Input:** `ownerId: "owner-1"` *(no pet record)*

**Expected Result:** Returns `null`.

---

## create

### TC-PET-03 — Creates a pet when owner has no existing pet

**Description:** Successfully creates a pet for an owner who does not already have one.

**Input:**
- `ownerId: "owner-1"`
- `name: "Buddy"`
- `type: "CAT"`

*(no existing pet for this owner)*

**Expected Result:** Returns the created pet `{ ownerId, name: "Buddy", type: "CAT", xp: 0 }`. `pet.findUnique` is called to check for an existing pet before `pet.create` is called with `{ data: { ownerId, name, type } }`.

---

### TC-PET-04 — Throws CONFLICT when owner already has a pet

**Description:** Rejects pet creation if the owner already has a pet (one pet per owner constraint).

**Input:**
- `ownerId: "owner-1"` *(existing pet present)*
- `name: "NewPet"`
- `type: "CAT"`

**Expected Result:** Throws `HttpApiException` with HTTP 409 Conflict, error code `PET_ALREADY_EXISTS`, and message `"Pet already exists for owner with ID 'owner-1'."`. `pet.create` is never called.

---

## update

### TC-PET-05 — Updates pet fields when pet exists

**Description:** Updates the pet's name, type, and xp when the pet record is found.

**Input:**
- `ownerId: "owner-1"` *(existing pet)*
- `name: "Max"`
- `type: "DOG"`
- `xp: 100`

**Expected Result:** Returns the updated pet `{ ownerId, name: "Max", type: "DOG", xp: 100 }`. `pet.update` is called with `{ where: { ownerId }, data: { name: "Max", type: "DOG", xp: 100 } }`.

---

### TC-PET-06 — Updates with only provided fields

**Description:** When only some fields are passed, undefined values are included in the data payload (letting Prisma ignore them).

**Input:**
- `ownerId: "owner-1"` *(existing pet)*
- `name: "Max"` *(type and xp omitted)*

**Expected Result:** `pet.update` is called with `{ data: { name: "Max", type: undefined, xp: undefined } }`.

---

### TC-PET-07 — Throws NOT_FOUND when pet does not exist

**Description:** Rejects the update when no pet record is found for the owner.

**Input:** `ownerId: "owner-1"` *(no pet record)*, `name: "Max"`

**Expected Result:** Throws `HttpApiException` with HTTP 404 Not Found, error code `PET_NOT_FOUND`, and message `"Pet not found for owner with ID 'owner-1'."`. `pet.update` is never called.

---

## delete

### TC-PET-08 — Deletes pet when it exists

**Description:** Removes the pet record for the given owner after confirming it exists.

**Input:** `ownerId: "owner-1"` *(pet `{ ownerId, name: "Buddy" }` exists)*

**Expected Result:** Returns the deleted pet object. `pet.findUnique` is called first, then `pet.delete` with `{ where: { ownerId: "owner-1" } }`.

---

### TC-PET-09 — Throws NOT_FOUND when pet does not exist

**Description:** Rejects deletion when no pet record is found for the owner.

**Input:** `ownerId: "owner-1"` *(no pet record)*

**Expected Result:** Throws `HttpApiException` with HTTP 404 Not Found and error code `PET_NOT_FOUND`. `pet.delete` is never called.
