# Atelier — Perfume Store Design System

## Intent

**Who:** A customer browsing luxury fragrances — sensory, evaluative mindset, comparing products sold on feeling and prestige. Could be shopping for a gift or a personal luxury.

**Task:** Browse the collection, discover a fragrance, complete a purchase.

**Feel:** Stepping into a high perfumery boutique. Warm darkness like velvet and amber glass — intimate and refined, not cold tech-dark.

---

## Design Direction

**Atelier** — editorial luxury grounded in the perfumery world. Warmth over coolness. Serif for storytelling, sans-serif for chrome. Amber light through glass as the hover signature.

---

## Token Architecture

Defined in `frontend/src/app/app.scss` as CSS custom properties on `:root`.

### Surfaces
```css
--velvet:       #0E0C0A    /* warm near-black — luxury box interior */
--velvet-deep:  #141210    /* gradient depth */
```

### Accent
```css
--gold:         #E8C96A    /* champagne gold — atomizer caps */
--amber:        #C4852A    /* amber glass — bottle held to light; hover glow */
```

### Surface Overlays (on --velvet)
```css
--crystal-1:    rgba(255,255,255,0.04)   /* cards, form panels */
--crystal-2:    rgba(255,255,255,0.06)   /* hover state */
--crystal-3:    rgba(255,255,255,0.08)   /* interactive controls, pills */
```

### Borders
```css
--gossamer:     rgba(255,255,255,0.07)   /* standard dividers */
--gossamer-mid: rgba(255,255,255,0.12)   /* inputs, chips */
--gossamer-hi:  rgba(255,255,255,0.20)   /* emphasis, hover */
```

### Text
```css
--ink:          #ffffff                  /* primary */
--ink-soft:     rgba(255,255,255,0.72)   /* secondary */
--ink-faint:    rgba(255,255,255,0.45)   /* metadata, disabled */
```

### Semantic
```css
--success-bg: rgba(60,206,179,0.15)   --success-fg: #b9ffea
--warning-bg: rgba(232,201,106,0.15)  --warning-fg: #E8C96A
--info-bg:    rgba(96,165,250,0.15)   --info-fg:    #93c5fd
--danger-bg:  rgba(245,66,93,0.14)    --danger-fg:  #ffb0c7
```

---

## Typography

| Role | Font | Notes |
|------|------|-------|
| Product names, page titles (h1/h2) | Playfair Display | Editorial serif — evokes fragrance catalogues. Applied globally for h1/h2, and on `.product-body h3` |
| All UI chrome | Inter | Clean, contemporary |
| Labels | Inter, uppercase, `letter-spacing: 0.14–0.18em` | |
| Prices/totals | Inter or Playfair, `font-variant-numeric: tabular-nums` | |

Loaded via Google Fonts in `frontend/src/index.html`.

---

## Depth Strategy

**Borders-only** for structure. **Amber box-shadow** on card hover — the Atelier signature.

The amber glow evokes light passing through a glass bottle in a display case. It can only exist in a perfume store.

```scss
/* Standard card */
background: var(--crystal-1);
border: 1px solid var(--gossamer);
border-radius: 24px;

/* Card hover */
border-color: rgba(196, 133, 42, 0.32);
box-shadow:
  0 0 48px rgba(196, 133, 42, 0.14),
  0 24px 64px rgba(0, 0, 0, 0.35);
```

Do not mix shadow strategies — amber glow is for product cards only.

---

## Spacing

Base unit: `1rem`. Scale: `0.5rem / 0.75rem / 1rem / 1.25rem / 1.5rem / 2rem / 2.5rem / 3rem`.

Responsive padding uses `clamp()`: `clamp(1.5rem, 4vw, 5rem)` for page sections.

---

## Border Radius

| Context | Value |
|---------|-------|
| Cards, modals, panels | `24px` |
| Inputs, textareas | `14px` |
| Buttons, pills, chips, badges | `999px` |
| Image insets within cards | `20px` |

---

## Component Patterns

### Product Card
- `min-height: 420px`, grid `auto 1fr` (image top, content bottom)
- Image zooms 4% on card hover (`transform: scale(1.04)`)
- h3 uses Playfair Display, `font-weight: 500`
- Button: `background: #fff; color: #111` (primary white pill)

### Page Headers
- `.small-label` — pill chip with `--crystal-3` bg, `--ink-soft` text, uppercase
- h1 — Playfair Display (from global rule), `clamp(2.25rem, 4vw, 3rem)`

### Header/Footer
- `background: rgba(14, 12, 10, 0.75)` with `backdrop-filter: blur(18px)`
- Sticky header with `border-bottom: 1px solid var(--gossamer)`

### Brand Chip (active)
- `background: rgba(232, 201, 106, 0.1); border-color: var(--gold); color: var(--gold)`

### Input Focus
- `border-color: rgba(196, 133, 42, 0.5)` — amber focus ring, no outline

### Status Badges / Selects
- Use semantic token pairs: pending → warning, processing → info, delivered → success

---

## What to Avoid

- Mixing the amber hover glow with other elements — it belongs exclusively to product cards
- Adding purple/blue tints to surfaces (`#1a1a2e` was replaced with `#1a1612` — keep warm)
- Using `rgba(255,255,255,X)` directly in components — use the crystal/gossamer/ink tokens
- Switching font-family on nav links or labels — Inter only for UI chrome
