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

---

## getLeaderboard

### TC-FRIEND-10 — Returns current user and friends ranked by total focus time

**Description:** Fetches all accepted friends plus the current user, sums their completed focus log durations, and returns them sorted descending with dense ranks.

**Input:**
- `userId: "user-1"` *(one accepted friend "user-2")*
- No `startDate`, `endDate`, or `top`
- user-1 has 3600s of completed logs; user-2 has 7200s

**Expected Result:** Returns `[{ rank: 1, totalFocusTime: 7200, user: user-2 }, { rank: 2, totalFocusTime: 3600, user: user-1 }]`.

---

### TC-FRIEND-11 — Users with no completed logs receive totalFocusTime of 0

**Description:** A participant with no matching completed focus logs is included in the result with `totalFocusTime: 0`.

**Input:**
- `userId: "user-1"` *(one accepted friend "user-2")*
- user-1 has 3600s of completed logs; user-2 has no logs

**Expected Result:** Returns `[{ rank: 1, totalFocusTime: 3600, user: user-1 }, { rank: 2, totalFocusTime: 0, user: user-2 }]`.

---

### TC-FRIEND-12 — Ties share the same dense rank

**Description:** When two participants have equal `totalFocusTime`, they receive the same rank and the next rank is not skipped.

**Input:**
- `userId: "user-1"`, friends: `["user-2", "user-3"]`
- All three have 3600s of completed logs

**Expected Result:** All three entries have `rank: 1`.

---

### TC-FRIEND-13 — Filters focus logs by startDate and endDate

**Description:** Only focus logs whose `startTime` falls within the provided range are counted.

**Input:**
- `userId: "user-1"`, one friend `"user-2"`
- `startDate: "2025-01-01T00:00:00.000Z"`, `endDate: "2025-01-31T23:59:59.000Z"`
- user-1 has one log within range (1800s) and one outside range (3600s)

**Expected Result:** `totalFocusTime` for user-1 is `1800`.

---

### TC-FRIEND-14 — top param limits results and always includes the current user

**Description:** When `top` is set and the current user ranks outside the top N, they are appended at the end with their actual rank.

**Input:**
- `userId: "user-1"` *(two friends: user-2 with 7200s, user-3 with 3600s)*
- user-1 has 0s; `top: 1`

**Expected Result:** Returns two entries: `[{ rank: 1, user: user-2 }, { rank: 3, user: user-1 }]`. user-3 is excluded.

---

### TC-FRIEND-15 — Current user is within top N and not duplicated

**Description:** When the current user already appears within the top N, they are not appended again.

**Input:**
- `userId: "user-1"` *(one friend: user-2 with 3600s)*
- user-1 has 7200s; `top: 1`

**Expected Result:** Returns `[{ rank: 1, totalFocusTime: 7200, user: user-1 }]` — only one entry, no duplicate.
