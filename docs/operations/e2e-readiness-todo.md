# E2E Readiness Todo

This is the missing work to move MoveMate from local smoke verification to repeatable end-to-end validation with test data.

## Current state

- No Playwright or Cypress E2E harness is configured.
- Local app startup works on port 3000.
- `/api/health` can prove configured Supabase and Stripe test-mode access.
- Supabase seed data exists for a customer, carrier, active listing, and authorized booking in `supabase/seed.sql`.
- Google Maps is intentionally mocked/degraded locally through `E2E_MOCK_MAPS=true` with blank Maps keys.
- Stripe webhooks have unit/replay coverage, but full local webhook delivery needs Stripe CLI forwarding.

## P0: Make E2E runnable

1. Add an E2E runner.
   - Recommended: Playwright.
   - Add scripts:
     - `e2e`: run the suite against `http://localhost:3000`
     - `e2e:headed`: run with a visible browser
     - `e2e:install`: install browser binaries if needed
   - Keep screenshots, videos, and traces ignored unless explicitly attached to a PR.

2. Add a deterministic E2E environment file.
   - Use `.env.e2e.example` for names only.
   - Use `.env.e2e.local` for local test values and keep it gitignored.
   - Required:
     - `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
     - `NEXT_PUBLIC_APP_ENV=development`
     - Supabase URL, anon key, and service role key for a non-production project
     - Stripe test publishable and secret keys
     - `STRIPE_WEBHOOK_SECRET` for webhook tests
     - `E2E_MOCK_MAPS=true` unless real Maps is being tested
   - Do not allow live Stripe keys or production Supabase project IDs in E2E mode.

3. Add a single preflight command.
   - Recommended script: `verify:e2e:preflight`.
   - It should fail if:
     - app is not running on port 3000
     - `/api/health` is not `overall: ok`
     - Supabase anon probe fails
     - Supabase service-role probe fails
     - Stripe key prefixes are not test-mode
     - Stripe balance probe fails
     - Maps is neither configured nor explicitly mocked

4. Add E2E data reset.
   - For local Supabase: run `npm run supabase:reset`.
   - For the cloud dev Supabase project: add a safe, idempotent `scripts/e2e-reset.ts` that only touches rows marked with deterministic E2E IDs or an `e2e` marker.
   - Never run reset/seed/bootstrap scripts against production.

## P0: Required E2E user/data contract

1. Define E2E users.
   - Customer and carrier seed users already exist in `supabase/seed.sql`.
   - Keep credentials deterministic for local-only testing.
   - Do not duplicate passwords in docs beyond the seed source of truth.

2. Define E2E fixtures.
   - Active carrier profile with verified status.
   - Active vehicle.
   - Active capacity listing from Penrith to Bondi.
   - Customer profile.
   - Authorized booking.
   - Optional pending booking request for carrier acceptance tests.

3. Add E2E-safe cleanup.
   - Delete only E2E-created move requests, booking requests, bookings, saved searches, uploads, and webhook event rows.
   - Preserve non-E2E dev data.

## P0: First automated flows

1. Public app smoke.
   - Load `/`.
   - Navigate to `/move/new`.
   - Fill pickup/dropoff using mock-compatible address values.
   - Confirm the flow reaches results, alert, or saved demand without JS/runtime errors.

2. Auth smoke.
   - Log in as seeded customer.
   - Confirm redirect lands on an authenticated customer page.
   - Log out or isolate storage between tests.
   - Log in as seeded carrier.
   - Confirm carrier pages render without unauthorized redirects.

3. Customer move flow.
   - Customer creates a move need using test data.
   - Search route returns deterministic result or deterministic zero-match state.
   - Saved alert/unmatched request path works when no match exists.

4. Carrier trip flow.
   - Carrier opens `/carrier/trips/new`.
   - Creates or edits a deterministic trip/listing.
   - Listing appears in carrier trip list.

5. Booking visibility flow.
   - Customer can see seeded booking.
   - Carrier can see corresponding live booking/request surface.
   - Booking detail pages render payment/proof/trust status correctly.

## P1: Payment and webhook E2E

1. Payment intent creation.
   - Use Stripe test keys only.
   - Create a payment intent for an E2E booking/request.
   - Assert returned publishable key is test-mode and client secret is present.

2. Webhook delivery.
   - Start Stripe CLI:
     - `stripe listen --forward-to localhost:3000/api/payments/webhook`
   - Put the emitted webhook secret into local E2E env.
   - Replay a payment intent lifecycle event.
   - Assert Supabase booking/request payment state changes.

3. Acceptance/capture flow.
   - Seed a pending booking request with authorization.
   - Carrier accepts it.
   - Assert claim-before-capture behavior and final booking state.

## P1: Maps E2E

1. Mock Maps mode.
   - Add a test helper for address fields that does not require Google Places.
   - Assert `E2E_MOCK_MAPS=true` is visible to the E2E preflight.
   - Do not fail local E2E because Google script is absent.

2. Real Maps mode.
   - Add a separate tagged test, not part of default local E2E.
   - Require `NEXT_PUBLIC_GOOGLE_MAPS_KEY` or `GOOGLE_MAPS_API_KEY`.
   - Verify browser Places script and server geocoding separately.

## P1: Preview E2E

1. Add preview target support.
   - `E2E_BASE_URL=https://<preview-url>`
   - Use Vercel preview env vars, not `.env.local`.
   - Require explicit confirmation that preview uses test Stripe keys.

2. Preview smoke.
   - Load public routes.
   - Hit `/api/health`.
   - Verify auth works against the intended non-production Supabase project.
   - Record degraded optional services in the PR.

## P2: Nice-to-have coverage

1. Upload flow with small fixture files.
2. Admin smoke for verification queue and payments dashboard.
3. Cron route manual auth checks.
4. Email log-mode assertions for notification paths.
5. Visual screenshots for the primary customer and carrier shells.

## Do not claim E2E-ready until

- `npm run check` passes.
- `npm run test` passes.
- `npm run build` passes.
- E2E preflight passes.
- Public, auth, customer, carrier, booking visibility, and at least one payment-intent path pass.
- Maps mode is explicitly recorded as mocked or real.
- Stripe webhook delivery is either tested with Stripe CLI or listed as a residual risk.
- Test data reset is safe and production-proof.
