# Quitaia Market — release checklist

## Repository and build
- [x] Initial React + TypeScript + Vite app committed to `main`.
- [x] GitHub Actions runs dependency installation, TypeScript validation, unit tests and a production build.
- [x] Price format tested as `24.999,00 Kz`.
- [ ] Ensure GitHub repository visibility matches the owner's intent; it is currently public.
- [x] Commit the npm lockfile and validate it in CI.

## Supabase
- [ ] Choose and provision a dedicated Supabase project for Quitaia Market (do not reuse any other project).
- [ ] Apply migrations in order and run category seed.
- [ ] Configure phone OTP and an SMS provider that delivers to Angolan numbers.
- [ ] Configure allowed auth redirect URLs.
- [ ] Test RLS using two independent user accounts, including read/update attempts against another user's products and profile.
- [ ] Confirm inactive categories cannot be used for new listings.
- [ ] Confirm private photo bucket, signed URL expiry and access after pause/sale.
- [ ] Review Supabase Security and Performance Advisors.

## Functional acceptance
- [ ] Valid/invalid OTP, resend, logout and refresh persistence.
- [ ] Create, edit, pause, reactivate, mark sold and soft-delete a listing.
- [ ] Test zero, one and nine photos; reject ten, unsupported MIME types and oversized originals.
- [ ] Confirm image compression, upload retry/error messages and cleanup of orphan files.
- [ ] Confirm active listings appear publicly and paused/sold listings only appear in seller management.
- [ ] Test optional WhatsApp contact via real test numbers.
- [ ] Test responsive layout, keyboard interactions, accessibility and empty/error/loading states.

## Before launch
- [ ] Add reporting/moderation and prohibited-listing policy.
- [x] Add preliminary privacy and terms views inside the app.
- [ ] Publish final terms and privacy notice reviewed for Angola.
- [ ] Confirm support contact and data deletion process.
- [ ] Set the correct repository visibility and production domain.
- [ ] Perform end-to-end tests against a staging Supabase project before production publication.
