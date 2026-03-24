# Payments

## Provider

Stripe Connect Express.

## MVP behaviour

- customer authorizes payment when booking
- payment is released to carrier after successful completion
- booking fee is added on top of carrier price
- platform commission is withheld from carrier payout

## Required flows

- create payment intent
- verify webhook events
- create or link carrier connect account
- release payout after delivery confirmation
- handle refund before pickup when needed

## Operational rule

Do not over-automate edge cases before the basic payout path works.
