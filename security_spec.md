# TWINS Photography Studio — Firestore Security Specification

## 1. Data Invariants
1. **Default-Deny Catch-All**: Every undefined Firestore path rejects all reads and writes.
2. **Verified Admin Authority**: Admin privileges require `request.auth != null && request.auth.token.email_verified == true` AND either matching the bootstrapped studio owner email (`rituparno.tnts@gmail.com`) or having an active UID document in `/admins/{request.auth.uid}`.
3. **PII Isolation on Inquiries**: Client booking inquiries (`/inquiries/{inquiryId}`) contain PII (`name`, `email`, `phone`, `message`). Public visitors may ONLY `create` an inquiry with `status == 'new'` and server timestamps (`createdAt == request.time`, `updatedAt == request.time`). Reading, listing, updating, or deleting inquiries is strictly restricted to verified admins.
4. **Editorial Content Integrity**: Public collections (`/siteSettings`, `/categories`, `/portfolioItems`, `/projects`, `/services`, `/testimonials`) are publicly readable for portfolio rendering, while every `create`, `update`, and `delete` requires verified admin authentication, strict key allowlists (`hasAll`/`hasOnly`), type/length checks, ID regex validation (`isValidId`), and immutable `createdAt`.
5. **Temporal Integrity**: All `createdAt` (on create) and `updatedAt` (on create/update) fields MUST equal `request.time`. On update, `createdAt` must remain equal to `existing().createdAt`.
6. **Parent Reference Existence**: `portfolioItems.categoryId` must reference an existing `/categories/{categoryId}` document on create and update.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Shadow Field Injection on Inquiry Create**: `{ ...validInquiry, isApproved: true }` -> `PERMISSION_DENIED` (blocked by `hasOnly`).
2. **Inquiry Status Escalation on Create**: `{ ...validInquiry, status: "booked" }` -> `PERMISSION_DENIED` (`status == 'new'` required).
3. **Public PII Scraping (`list` on `/inquiries`)**: Unauthenticated or non-admin user queries `/inquiries` -> `PERMISSION_DENIED`.
4. **Public PII Single Read (`get` on `/inquiries/{id}`)**: Authenticated non-admin user reads an inquiry -> `PERMISSION_DENIED`.
5. **Client Timestamp Forgery**: Inquiry created with `createdAt: Timestamp(2020-01-01)` instead of `serverTimestamp()` -> `PERMISSION_DENIED`.
6. **Admin Spoofing (Unverified Email)**: User with matching email but `email_verified: false` attempts admin write on `/siteSettings/studio` -> `PERMISSION_DENIED`.
7. **Self-Assigned Admin Escalation**: Non-admin authenticated user writes to `/admins/{theirUid}` -> `PERMISSION_DENIED`.
8. **ID Poisoning Attack**: Admin or attacker attempts write to `/portfolioItems/invalid$id!@#` or 200-char ID -> `PERMISSION_DENIED` (blocked by `isValidId`).
9. **Orphaned Portfolio Item**: Admin creates `/portfolioItems/{id}` pointing to non-existent `categoryId: "nonexistent"` -> `PERMISSION_DENIED` (blocked by `exists()`).
10. **Denial-of-Wallet Oversized String**: Attacker submits inquiry with 10,000-character `message` -> `PERMISSION_DENIED` (`message.size() <= 2000`).
11. **Immutable Timestamp Mutation**: Admin updates `/projects/{id}` and modifies `createdAt` -> `PERMISSION_DENIED` (`incoming().createdAt == existing().createdAt`).
12. **Type Poisoning on Testimonial Rating**: Update sets `rating: "five"` or `rating: 99` -> `PERMISSION_DENIED` (`data.rating is number && data.rating >= 1 && data.rating <= 5`).
