# Supabase — Quitaia Market

Use a dedicated Supabase project for this marketplace. Do not reuse the database of UBUNTU, Escola IA, CaixaFácil or any other project.

## Apply schema

1. Open the SQL Editor in the dedicated project.
2. Run `migrations/0001_marketplace_phase1.sql`.
3. Run `migrations/0002_storage_policy_hardening.sql`.
4. Run `migrations/0003_product_category_guardrails.sql`.
5. Run `seed.sql` to add categories only.
6. Inspect the tables and RLS policies in the dashboard.

## Auth

- Enable Phone Auth.
- Configure an SMS provider and verify delivery to Angolan +244 numbers.
- Configure allowed redirect URLs for local development and the eventual production domain.
- Do not reduce OTP protections to make development easier.

## Storage and RLS

- Bucket `product-images` is private, with a 5 MiB upload limit and image MIME types. The frontend requests short-lived signed URLs for active ad photos.
- Owners can upload only into a storage path prefixed with their authenticated user ID.
- Migration 0002 restricts public storage reads to images referenced by active ads.
- Verify RLS with two different test accounts: neither account must read or mutate another owner's paused/sold ads except only public active ads may be visible.

## Pre-launch verification

- [ ] Test SMS OTP send, invalid code, valid code, logout and session persistence.
- [ ] Test creating ad with 0, 1 and 9 photos, then reject the 10th photo.
- [ ] Test upload failures and ensure the UI does not claim every image succeeded.
- [ ] Test pause, reactivate, sold and remove actions.
- [ ] Confirm paused/sold ads remain visible in owner management but disappear from public feed.
- [ ] Run Supabase security advisors and resolve material warnings.
