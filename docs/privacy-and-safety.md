# Privacy and listing safety — Quitaia Market

This document records the intended product behaviour of the current starter. It is not legal advice and must be checked against applicable Angolan law before public launch.

## Personal data in the current build

- Phone number is used for Supabase phone OTP authentication.
- The seller may optionally add a WhatsApp number to an individual listing. The form explicitly warns that this number is visible to interested people. Do not auto-fill it from the private authentication profile.
- Profile display name and city are intended to be visible only to the authenticated owner in the current database policies.
- Listing title, price, description, city, category and active listing photos are intended to be visible to visitors.
- Saved listing IDs are stored in browser local storage on that device.

## Photo access

Product photos must be stored in the private `product-images` bucket. The client requests short-lived signed URLs; public read policies should allow only images attached to active products. Do not change the bucket to public, since public object URLs bypass these storage-row policies.

## User safety and moderation

Before public launch, add listing reporting, a moderation workflow, prohibited-items rules, seller blocking, and an abuse contact channel. Define how complaints are reviewed and how listings/accounts may be restricted.

## Data lifecycle

Before public launch, define a retention/deletion policy for account data, listings and uploaded files. Test that deleting a listing also removes its database image rows and orphaned storage objects. Current status changes use soft-delete for listings, and the current starter does not yet provide complete account deletion.

## Launch requirement

Publish a privacy notice and terms in Portuguese. Explain what is public, how to withdraw a WhatsApp contact by editing/removing the listing, how to request account deletion, and how to report abuse. Have the policy reviewed for the target market before accepting real users.
