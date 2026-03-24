# moverrr Overview

## What this product is

A browse-first spare-capacity marketplace for medium-sized moves in Sydney.

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
- awkward-middle jobs
- marketplace pickups
- student moves
- small business overflow

## Core objects

- `capacity_listings`: inventory posted by carriers
- `bookings`: customer claims on that inventory
- `reviews`: post-completion trust
- `disputes`: manual-first issue handling

## Build priorities

1. Carrier posting must feel faster than posting to Airtasker.
2. Customer browsing must feel instant and transparent.
3. Manual-first operations are acceptable in MVP.
4. Matching stays deterministic and explainable.

## Critical validation question

Can we get reliable recurring inventory from Sydney carriers if posting takes under 60 seconds and jobs arrive without negotiation?
