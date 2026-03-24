# Database

## Core tables

- `carriers`
- `vehicles`
- `capacity_listings`
- `customers`
- `bookings`
- `reviews`
- `disputes`

## Important database rules

- use PostGIS geography types for location fields
- store listing inventory in `capacity_listings`
- bookings reference both listing and carrier
- ratings aggregate onto carriers manually or via jobs later
- `updated_at` should be auto-maintained

## Security

- enable RLS on all marketplace tables
- public can read active listings
- carriers can manage only their own supply records
- customers can manage only their own profile and bookings
- involved parties can read disputes

## Notes

- service-role admin workflows can bypass RLS
- matching logic should live close to the database for spatial efficiency
