# Friend Module — Test Cases

Service: `FriendService`

---

## getFriends

### TC-FRIEND-01 — Returns accepted friends with the other user mapped correctly

**Description:** Fetches all friendships with status `ACCEPTED` where the user is either sender or receiver, and maps each record to the *other* user in the relationship.

**Input:** `userId: "user-1"` *(two accepted friendships: one where user is sender, one where user is receiver)*

**Expected Result:** Returns `{ data: [friend1, friend2], pagination }`. For friendships where the user is the sender, `receiver` is returned; where the user is the receiver, `sender` is returned.

---

### TC-FRIEND-02 — Returns empty data when user has no accepted friends

**Description:** Returns an empty list when no accepted friendships exist for the user.

**Input:** `userId: "user-1"` *(no accepted friendships)*

**Expected Result:** Returns `{ data: [], pagination: <defined> }`.

---

### TC-FRIEND-03 — Includes pagination metadata

**Description:** The response always includes pagination metadata, including the total count.

**Input:** `userId: "user-1"`, `{ page: 1, itemsPerPage: 10 }` *(count returns 5)*

**Expected Result:** `result.pagination` contains `{ total: 5 }`.

---

## createFriendRequest

### TC-FRIEND-04 — Creates a pending friend request

**Description:** Creates a new friendship record with status `PENDING` from sender to receiver.

**Input:**
- `senderId: "user-1"`
- `receiverId: "user-2"`

**Expected Result:** Returns the friendship object `{ friendshipId: "f1", senderId: "user-1", receiverId: "user-2", status: PENDING }`. `friendship.create` is called with the correct data.

---

## updateFriendRequest

### TC-FRIEND-05 — Updates status when user is the sender

**Description:** Allows the sender to update the friendship status (e.g. to `ACCEPTED`).

**Input:**
- `userId: "user-1"` (sender)
- `friendshipId: "f1"`
- `status: FriendshipStatus.ACCEPTED`

**Expected Result:** Returns the updated friendship with `status: ACCEPTED`. `friendship.findFirst` verifies the user is a participant before calling `friendship.update`.

---

### TC-FRIEND-06 — Updates status when user is the receiver

**Description:** Allows the receiver to update the friendship status (e.g. to `REJECTED`).

**Input:**
- `userId: "user-2"` (receiver)
- `friendshipId: "f1"`
- `status: FriendshipStatus.REJECTED`

**Expected Result:** `friendship.update` is called with `{ status: REJECTED }`.

---

### TC-FRIEND-07 — Throws NOT_FOUND when user is not part of the friendship

**Description:** Rejects the update when the user is neither the sender nor the receiver of the specified friendship.

**Input:**
- `userId: "user-99"` (not a participant)
- `friendshipId: "f1"`
- `status: FriendshipStatus.ACCEPTED`

**Expected Result:** Throws `HttpApiException` with HTTP 404 Not Found and error code `FOCUS_LOG_NOT_FOUND`. `friendship.update` is never called.

---

## deleteFriendship

### TC-FRIEND-08 — Deletes friendship when user is part of it

**Description:** Removes the friendship record when the requesting user is either the sender or receiver.

**Input:**
- `userId: "user-1"`
- `friendshipId: "f1"`

**Expected Result:** `friendship.findFirst` verifies participation, then `friendship.delete` is called with `{ where: { friendshipId: "f1" } }`.

---

### TC-FRIEND-09 — Throws NOT_FOUND when user is not part of the friendship

**Description:** Rejects deletion when the user is not a participant in the friendship.

**Input:**
- `userId: "user-99"` (not a participant)
- `friendshipId: "f1"`

**Expected Result:** Throws `HttpApiException` with HTTP 404 Not Found and error code `FOCUS_LOG_NOT_FOUND`. `friendship.delete` is never called.
