# Review — XRY/B1 Medical HUD Variant

**Reference:** `Screenshot 2026-08-24 at 21.18.41.png` (1882×1014)
**Variant:** `dsh-edex-ui-xry-b1` | **Profile:** `web-edex-scratch` | **Port:** 3084
**Verdict: PASS**

## Center region — DSH working area (verified after retry)

The first render hid the DSH working area: the per-card chrome added to
`WidgetSection.module.css` (opaque panel-tone background + border + margin)
also applied to the **center** slot, which must stay transparent so the
ORIGINAL UI shows through the scanline texture. Fixed by a
`.section[data-widget='center']` override (transparent, no border/margin/
shadow/padding).

Re-verified after the fix: the center region renders the full DSH working
area — the sidebar (`[data-slot="sidebar"]`), the conversation
(`[data-conversation-scroll]`, text "Into the Unknown … ~/arisos …"), and the
composer (`[data-composer-card]`, visible) — with the center section computing
`background: transparent`, `border: none`, `margin: 0`, 0 console errors.

## Probe results (review-raw.json)

- Shell present: **true** (0 console errors, 0 page errors)
- Theme tokens on `body`: `--edex-green #03ffff`, `--edex-border #106060`,
  `--edex-panel-2 #061414`; token overrides `--dsw-alias-label-primary
  #03ffff`, `--dsw-alias-border-l1 #106060` — all match the analysis palette
  (primary accent `#03ffff`, border `#106060`).
- **Per-widget card granularity confirmed**: every widget section
  (`info/power/processes/ecg/radar/status/timeline/preview/terminal/center`)
  computes `border: 1px solid rgb(16,96,96)` (= `#106060`), `border-radius:
  0px` (square, matches `borderFeatures.cards.cornerRadiusPx: 0`), a subtle
  cyan `box-shadow` glow (`0 0 4px #03ffff@18%`), panel-tone fill, and a 2px
  float gap — exactly the per-module outlined-box treatment the analysis
  describes. The panel cells (`.leftBar/.rightBar/.bottomBar`) recede to the
  near-black canvas with no card border (per build.md granularity rule:
  per-card treatment on the widget sections, panels stay the canvas).
- Widget registry after reconciliation:
  `['info','power','processes','ecg','radar','status','timeline','preview','terminal','center']`
- **Featured-widget check**: `worldViewGone: true` — the WORLD VIEW globe is
  gone; `featuredRadarPresent: true` — the RADAR featured widget renders.
- Live content verified: DATA TIMELINE populates 37 scan-log rows from the
  filesystem listing (`0001 .clang-module-cache DIR DONE`, …), radar + ECG +
  POWER GEN + STATUS all present, zero console errors.

## Visual comparison

`vision_pixel_diff` (reference vs render): overall difference 9.33%. The worst
regions are all in the CENTER column (x≈941-1255) — the reference's center is
a human body DNA-scan figure, while the eDEX frame keeps the ORIGINAL web UI
in the center per build.md ("the eDEX frame structure (terminal shell, 5-panel
grid) stays"). That is a structural limitation, not a theme failure. The left
column diff (15.5%) reflects the radar disc moving to the right-bar globe
slot per the featured-widget rule (the eDEX left column keeps its info/power/
processes stack).

Side-by-side `vision_glance` confirms the palette and border language match:
cyan-on-near-black, neon glow, thin outlined modules, radar + ECG + stacked
meters + value blocks + data table all rendered in the reference's style.

## Granularity check (mandatory)

Zoomed crops of the rendered left and right columns confirm the analysis's
per-widget granularity: distinct card boxes, each with a full 1px thin cyan
border, gap to the next card, and a title; stacked meter columns and circular
knobs in the left bar; ECG waveform, radar disc (rings, crosshair, sweep
sector), and status value blocks in the right bar — matching
`borderFeatures.cards` (full 1px solid `#106060`, 0px radius, subtle glow).

## Animation verification (mandatory — RADAR sweep)

The RADAR featured widget introduces a CSS `@keyframes sweep` (conic-gradient
wedge, 4s linear infinite, `transform-origin: center`). Verified at runtime
(`animation-raw.json`):

| Check | Result |
|-------|--------|
| Running | `playState: running`, 1 animation attached, transform changes across all samples |
| Rate | unwrapped angles 4.4° → 49.5° → 96° → 141° → 187.5° → 232.5° → 277.5° over 3s = **91.03°/s** vs expected 90°/s (360°/4s) — within ±35% tolerance, clockwise |
| Pivot | matrix is a pure rotation; `transform-origin` = border-box center = disc center; applying the origin-aware mapping to the disc center gives **maxDrift 0** across frames — correct pivot |
| Extent | sweep layout box == frame box, frame inside the radar widget, no page scrollbar growth (`extentOk: true`) |
| Guards | `prefers-reduced-motion: false`; console/page errors 0 |
| Visual | screenshot pair 1s apart: pixel diff 0.08% overall, changes confined to the radar disc region (x1400-1600, y225-338) — a rotating wedge band, not page-wide shift |

The STATUS meter fill uses a `transform: scaleY` transition (0.6s, transform/
opacity-only rule satisfied); no other animations in the variant.

## Programmatic comparison

Render palette extracted from the screenshot matches the analysis within
tolerance: background near-black `#00090a` family, primary accent cyan
`#03ffff`, border `#106060`, semantic success `#02fd8a` (DONE rows + meter),
error `#d40202` (ERROR row), warn `#d1750f` (REPORTS frame).

## Verdict

**PASS.** Theme palette, per-card border style (width/style/color/radius/
glow), widget reconciliation (POWER GEN → cpu slot, ECG/HEART → traffic slot,
STATUS → network-status slot, DATA TIMELINE → files slot, RADAR → globe slot),
and the RADAR sweep animation all match the reference within tolerance. The
center region hosts the original UI by design (build.md frame structure) —
noted as a structural limitation, not a divergence.
