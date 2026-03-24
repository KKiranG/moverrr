# API Routes

## Public

- `GET /api/search`
- `GET /api/trips/[id]`

## Carrier

- `GET /api/trips`
- `POST /api/trips`
- `PATCH /api/trips/[id]`
- `DELETE /api/trips/[id]`
- `PATCH /api/bookings/[id]`

## Customer

- `POST /api/bookings`
- `GET /api/bookings`
- `POST /api/bookings/[id]/confirm-receipt`
- `POST /api/bookings/[id]/dispute`

## Shared authenticated

- `POST /api/upload`

## Payments

- `POST /api/payments/create-intent`
- `POST /api/payments/webhook`

## Admin

- `GET /api/admin/bookings`
- `GET /api/admin/carriers`
- `PATCH /api/admin/carriers/[id]/verify`
