# moverrr Overview

## What this product is

A **browse-first spare-capacity marketplace** for medium-sized moves in Sydney.
**Platform target: iOS app.** The web app is used for development and testing only.

Carriers post:
- route
- date
- time window
- spare space
- price
- handling rules

Customers:
- browse trips
- compare price and savings
- pick a route-fit option
- book into it

## What this product is not

- not a removalist company
- not a courier service
- not a quote-comparison engine
- not a job-bidding marketplace
- not an AI matching product

## Product wedge

- Sydney metro only
- awkward-middle jobs (single furniture, appliances, marketplace pickups)
- student moves
- small business overflow / café supply runs

## Core objects

- `capacity_listings`: inventory posted by carriers
- `bookings`: customer claims on that inventory
- `trip_templates`: carrier saved routes for quick re-posting
- `saved_searches`: customer demand signals for route alerts
- `reviews`: post-completion trust
- `disputes`: manual-first issue handling

## Build priorities

1. **Trust** — carrier verified, proof uploaded, disputes handled
2. **Simplicity** — carrier posting in <60 seconds, customer booking in ~4 steps
3. **Supply speed** — carrier flow must be radically simple and iOS-optimised
4. **Customer clarity** — pricing transparent, savings always shown
5. **Automation** — only after manual ops are proven
6. **Polish** — last priority

## MVP success criteria

- 10+ active verified carriers posting usable availability weekly
- 50+ completed Sydney jobs in the wedge
- 30%+ of inbound demand matches genuine spare capacity

## Critical validation question

Can we get reliable recurring inventory from Sydney carriers if posting takes under 60 seconds and jobs arrive without negotiation?
