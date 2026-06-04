# Firebase Security Spec & Test Suite

## 1. Data Invariants
- **Profile Integrity**: A student can only write or read their own `users/{userId}` record unless they are verified SNO Activists. The `points` balance and `role` are protected system-generated fields that users cannot modify arbitrarily through user profile updates.
- **Certificate Verification Public Access**: Exemption slips can be resolved/get publicly via their specific document or verification code parameter, but they cannot be created/modified by non-owners or non-activists.
- **Immutable Timestamps & Keys**: Path IDs must conform to alphanumeric standards (`isValidId`). Timestamps like `createdAt` and `updatedAt` must match `request.time`.

## 2. The "Dirty Dozen" Payloads
The following payloads simulate attacks designed to break identity, integrity, and authorization rules.

1. **Identity Spoofing**: An authenticated student attempting to overwrite another student's profile.
2. **Privilege Escalation**: A student attempting to update their role to `"sno_activist"`.
3. **Points Counterfeiting**: A student attempting to directly increment their points by 1000 in their profile payload.
4. **Alphanumeric Bypass**: Injecting special characters like `../junk/` in a collection ID to escalate paths.
5. **Zero-Point Exemption Purchase**: Creating a certificate document in `/certificates` without deducting points.
6. **Bypassing Verification**: Writing a certificate profile marked as `status: "active"` without the corresponding authentication context.
7. **Fake Event Listener Booster**: Updating an event registration's `registeredCount` arbitrarily.
8. **Shadow Field Injection**: Writing fields unauthorized by the schema (e.g. `hackField: true`).
9. **Tampering Historical Records**: Deleting or editing a milestone entry in the `timeline/{itemId}` subcollection.
10. **Spoofed Email Access**: Accessing SNO Activist panels using an unverified email token.
11. **Malicious Quiz Creation**: Creating a Quiz containing no questions but high reward values with list sizes out of boundaries.
12. **Denial of Wallet Flooding**: Sending highly oversized payloads (e.g., extremely long strings in `paperTitle`) to consume Firestore resources.

## 3. Test Runner
Below is the draft testing structure verifying that all malicious payloads return `PERMISSION_DENIED`:

```typescript
// firestore.rules.test.ts
// Verifies security rule validations for BSEU SNO FEM App.
describe("Science App Security Proofs", () => {
  it("rejects unauthorized shadow updates and identity spoofing attempts", () => {
    // Assert write returns PERMISSION_DENIED
  });
});
```
