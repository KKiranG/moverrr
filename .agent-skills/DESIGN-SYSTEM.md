# Design System

## Visual direction

Perplexity-inspired:
- clean
- narrow column
- information-dense
- low clutter

## Typography

- headings: Instrument Sans
- body: system stack

## Colours

- background: `#FAFAFA`
- surface: `#FFFFFF`
- text: `#1A1A1A`
- secondary text: `#666666`
- border: `#E5E5E5`
- accent: `#0066FF`
- success and savings: `#00A651`

## Layout

- mobile-first
- max content width `640px`
- 16px mobile side padding
- 12px radius cards

## Interaction rules

- **44px minimum tap targets** — enforced with `min-h-[44px] min-w-[44px]`, no exceptions
- **Touch feedback required** — every tap target needs `active:` state; `hover:` alone is not enough
- skeletons before spinners
- transitions under 300ms
- `active:scale-[0.97]` or `active:opacity-80` on buttons for haptic-like feedback

## iOS-First Rules

This product ships as an iOS native app. Design for iPhone first.

- **Camera inputs**: proof upload uses `capture="environment"` — opens rear camera directly
- **Safe area**: fixed/sticky elements use `pb-[env(safe-area-inset-bottom)]`
- **Scroll containers**: `overscroll-behavior: contain`
- **File inputs**: always include `image/heic,image/heif` in `accept` — iOS camera default format
- **No hover-only states** — hover is not available on touch devices
- **Test at 375px** (iPhone SE) as the minimum supported width

## Avoid

- decorative gradients
- heavy shadows
- rounded-full primary buttons
- emoji in UI
- stock photography
- hover-only interactive states
- native `<input type="checkbox">` for important carrier-flow toggles (use custom toggle)
