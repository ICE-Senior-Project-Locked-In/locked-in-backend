# NFC Module — Test Cases

Service: `NFCService`

---

## pair

### TC-NFC-01 — Pairs an NFC device for a user

**Description:** Creates a new NFC device record associating the given serial number with the user.

**Input:**
- `userId: "user-1"`
- `data: { serialNumber: "SN-123456" }`

**Expected Result:** Returns the created device `{ deviceId: "device-1", userId: "user-1", serialNumber: "SN-123456" }`. `nFCDevice.create` is called with `{ data: { userId, serialNumber: "SN-123456" } }`.

---

## unpair

### TC-NFC-02 — Unpairs the NFC device for a user

**Description:** Deletes the NFC device record associated with the given userId.

**Input:** `userId: "user-1"`

**Expected Result:** Returns the deleted device record `{ deviceId: "device-1", userId: "user-1", serialNumber: "SN-123456" }`. `nFCDevice.delete` is called with `{ where: { userId: "user-1" } }`.
