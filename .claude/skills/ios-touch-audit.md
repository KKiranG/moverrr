# Skill: iOS Touch Target Audit & Fix

**Agent:** FrontendPolisher
**Risk:** Low — UI-only changes, no business logic
**Estimated turns:** 8-12

## Context

moverrr ships as an iOS native app. The web app is for development testing. Every interactive element must meet Apple's 44×44pt minimum touch target. This skill audits the full component tree and enforces compliance.

## Pre-Flight Checks

1. Read `CLAUDE.md` — iOS-first design contract section
2. Read `.agent-skills/DESIGN-SYSTEM.md` — full design rules
3. Read `.agent-skills/CARRIER-FLOW.md` — carrier is the highest-priority mobile user

## Step 1: Audit Hover-Only States

```bash
grep -rn "hover:" src/components/ --include="*.tsx" | grep -v "active:"
```

For each result: check if the `hover:` class is the ONLY interactive feedback. If so, add the matching `active:` equivalent:

| hover: class | Add active: equivalent |
|-------------|----------------------|
| `hover:bg-blue-600` | `active:bg-blue-700` |
| `hover:opacity-80` | `active:opacity-70` |
| `hover:shadow-lg` | `active:shadow-md` |
| `hover:scale-105` | `active:scale-[0.97]` |
| `hover:underline` | `active:underline` |

## Step 2: Audit Touch Target Sizes — Carrier Flow (Priority)

Check these files specifically (carrier is the primary mobile user):

- `src/components/carrier/carrier-trip-wizard.tsx` — step navigation, all buttons, checkboxes
- `src/components/carrier/carrier-dashboard.tsx` (if exists) — action buttons
- `src/app/(carrier)/carrier/dashboard/page.tsx` — trip action buttons
- `src/app/(carrier)/carrier/trips/[id]/page.tsx` — proof upload, status buttons

For each interactive element, verify computed height ≥ 44px:
- Buttons: need `min-h-[44px]` or `h-11` (h-11 = 44px in Tailwind)
- Links styled as buttons: same requirement
- Toggle/checkbox replacements: need 44px wrapper

## Step 3: Fix Native Checkboxes in Carrier Wizard

In `src/components/carrier/carrier-trip-wizard.tsx`, find all `<input type="checkbox">` elements. These render at 16×16px on iOS — far below the 44px minimum.

Replace with a custom toggle pattern using Radix UI (already available via `@radix-ui/react-slot`):

```tsx
// Before:
<input
  type="checkbox"
  checked={formData.helperAvailable}
  onChange={(e) => setFormData({ ...formData, helperAvailable: e.target.checked })}
/>

// After — custom toggle with 44px touch target:
<button
  type="button"
  role="checkbox"
  aria-checked={formData.helperAvailable}
  onClick={() => setFormData({ ...formData, helperAvailable: !formData.helperAvailable })}
  className={cn(
    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
    // Extend tap target beyond visual size:
    "before:absolute before:inset-0 before:-m-2",
    formData.helperAvailable ? "bg-blue-600" : "bg-gray-200"
  )}
>
  <span className={cn(
    "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
    formData.helperAvailable ? "translate-x-6" : "translate-x-1"
  )} />
</button>
```

Apply this pattern to ALL checkboxes in the wizard and any other carrier-facing forms.

## Step 4: Proof Upload — Camera First

Find all `<input type="file">` used for proof/photo uploads.

```bash
grep -rn "type=\"file\"" src/ --include="*.tsx"
```

For each proof upload input (pickup photos, delivery photos, document uploads):

```tsx
// Before:
<input type="file" accept="image/*" onChange={handleFile} />

// After (iOS camera opens directly):
<input
  type="file"
  accept="image/*,image/heic,image/heif"
  capture="environment"
  onChange={handleFile}
  className="sr-only"  // visually hidden — use a styled button as the trigger
/>
```

For carrier document uploads (license, insurance) where file picker is appropriate, use `accept` without `capture`:
```tsx
<input type="file" accept="image/*,image/heic,image/heif,.pdf" />
```

On mobile viewports (<768px), the proof upload button should say "Take Photo" as the primary label.

## Step 5: Safe Area CSS

In `src/app/globals.css`, add to the `:root` block:

```css
:root {
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-left: env(safe-area-inset-left, 0px);
  --safe-area-right: env(safe-area-inset-right, 0px);
}
```

In `tailwind.config.ts`, add to `theme.extend`:

```ts
spacing: {
  'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
  'safe-top': 'env(safe-area-inset-top, 0px)',
},
```

Apply to fixed bottom navigation or sticky footers:
```tsx
<div className="fixed bottom-0 pb-safe-bottom ...">
```

## Step 6: Scroll Container Optimization

In `src/app/globals.css`, find the `.page-shell` class (or equivalent main content wrapper). Add:

```css
.page-shell {
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}
```

Also add to any long list containers (search results, carrier dashboard):
```css
overscroll-behavior-y: contain;
```

## Step 7: Verify at 375px

Open Chrome DevTools, select iPhone SE preset (375×667):

- [ ] All buttons in carrier trip wizard visually appear large enough to tap
- [ ] Toggle switches replace all checkboxes
- [ ] Proof upload button is camera-first
- [ ] No element gets cut off or overflows horizontally
- [ ] Bottom nav/actions not covered by iOS home indicator area

## Step 8: Run Check

```bash
npm run check
```

Fix any TypeScript errors from the checkbox-to-toggle migration (type assertions on `onChange` → `onClick`).
