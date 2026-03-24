# Matching Engine

## Rule

Matching must stay deterministic and explainable.

## Hard disqualifiers

- pickup outside detour radius
- dropoff outside detour radius
- item does not fit available space
- carrier does not accept the item category
- listing is inactive or expired
- carrier is not verified

## Ranking weights

- pickup route fit: 35
- dropoff route fit: 35
- carrier reliability: 20
- price competitiveness: 10

## Why not AI

- easier to debug
- easier to tune
- easier to explain to users
- better for trust in an early marketplace

## Data sources

- PostGIS for proximity filtering
- carrier ratings
- listing price
- item/category constraints
