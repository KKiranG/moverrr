# Auth

## Provider

Supabase Auth with email and password.

## Roles

MVP does not need complex role infrastructure.

Primary user shapes:
- customer
- carrier
- admin handled through trusted internal access or service-role actions

## Requirements

- browsing search can be public
- booking requires auth
- posting capacity requires auth
- carrier verification happens after signup

## Trust considerations

- verified email
- verified carrier documents
- no anonymous booking
