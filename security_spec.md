# TWINS Photography Studio — Firestore Security Specification

## 1. Data Invariants
1. **Default-Deny Catch-All**: Every undefined Firestore path rejects all reads and writes.
2. **Verified Admin Authority**: Admin privileges require `request.auth != null && request.auth.token.email_verified == true` AND either matching the bootstrapped studio owner email (`rituparno.tnts@gmail.com`) or having an active UID document in `/admins/{request.auth.uid}`.
3. **PII Isolation on Inquiries**: Client booking inquiries (`/inquiries/{inquiryId}`) contain PII (`name`, `email`, `phone`, `message`). Public visitors may ONLY `create` an inquiry with `status == 'new'` and server timestamps (`createdAt == request.time`, `updatedAt == request.time`). Reading, listing, updating, or deleting inquiries is strictly restricted to verified admins.
4. **Published vs. Draft Pages Isolation**: Public visitors may only `get` and `list` documents in `/pages` where `status == 'published'`. Draft pages are readable and writable solely by verified admins.
5. **Private Media Library & Activity Logs**: `/mediaAssets` and `/activityLogs` are readable and writable solely by verified admins.
6. **Editorial Content Integrity**: Public collections (`/siteSettings`, `/categories`, `/albums`, `/portfolioItems`, `/projects`, `/services`, `/testimonials`) are publicly readable for rendering, while every `create`, `update`, and `delete` requires verified admin authentication, strict key allowlists (`hasAll`/`hasOnly`), type/length checks, ID regex validation (`isValidId`), and immutable `createdAt`.
7. **Temporal Integrity**: All `createdAt` (on create) and `updatedAt` (on create/update) fields MUST equal `request.time`. On update, `createdAt` must remain equal to `existing().createdAt`.
8. **Parent Reference Existence**: `portfolioItems.categoryId` must reference an existing or atomically created `/categories/{categoryId}` document.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Shadow Field Injection on Inquiry Create**: `{ ...validInquiry, isApproved: true }` -> `PERMISSION_DENIED` (blocked by `hasOnly`).
2. **Inquiry Status Escalation on Create**: `{ ...validInquiry, status: "confirmed" }` -> `PERMISSION_DENIED` (`status == 'new'` required).
3. **Public PII Scraping (`list` on `/inquiries`)**: Unauthenticated or non-admin user queries `/inquiries` -> `PERMISSION_DENIED`.
4. **Public PII Single Read (`get` on `/inquiries/{id}`)**: Authenticated non-admin user reads an inquiry -> `PERMISSION_DENIED`.
5. **Client Timestamp Forgery**: Inquiry created with `createdAt: Timestamp(2020-01-01)` instead of `serverTimestamp()` -> `PERMISSION_DENIED`.
6. **Admin Spoofing (Unverified Email)**: User with matching email but `email_verified: false` attempts admin write on `/siteSettings/studio` -> `PERMISSION_DENIED`.
7. **Self-Assigned Admin Escalation**: Non-admin authenticated user writes to `/admins/{theirUid}` -> `PERMISSION_DENIED`.
8. **Draft Page Exposure**: Non-admin attempts `get` or unfiltered `list` on `/pages` containing `status: 'draft'` -> `PERMISSION_DENIED`.
9. **Orphaned Portfolio Item**: Admin creates `/portfolioItems/{id}` pointing to non-existent `categoryId: "nonexistent"` -> `PERMISSION_DENIED`.
10. **Denial-of-Wallet Oversized String**: Attacker submits inquiry with 10,000-character `message` -> `PERMISSION_DENIED` (`message.size() <= 2000`).
11. **Immutable Timestamp Mutation**: Admin updates `/projects/{id}` and modifies `createdAt` -> `PERMISSION_DENIED`.
12. **Activity Log Tampering**: User attempts `update` on `/activityLogs/{id}` -> `PERMISSION_DENIED` (`allow update: if false`).
