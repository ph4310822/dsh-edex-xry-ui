# UI Analysis — XRY/B1 Medical HUD

**Reference:** `Screenshot 2026-08-24 at 21.18.41.png` (1882×1014, PNG)
**Source:** vision (primary) + programmatic BMP measurement (pixel-exact values)
**Slug:** `xry-b1`

## Overview

A sci-fi medical/biotech HUD (X-ray body scanner terminal). Near-black canvas with
cyan neon frames, a large circular radar/scan disc, a human body DNA-scan figure,
an ECG heartbeat waveform, stacked energy-cell meters, and a full-width DATA
TIMELINE data table. No rounded corners anywhere — everything is square-cornered
thin-outline HUD modules with subtle cyan glow.

## Theme

| Role | Hex | Notes |
|------|-----|-------|
| background | `#00090a` | Dominant near-black canvas (60% share) |
| panelTone | `#021b1d` | Panel/card fill (11% share) |
| primaryAccent | `#03ffff` | Bright cyan — rings, waveforms, key text, glow |
| secondaryAccent | `#26c0c0` | Dimmed cyan midtone |
| textPrimary | `#03ffff` | Cyan labels (10.9% share of bright pixels) |
| textSecondary | `#8c9c9c` | Gray-cyan captions |
| success | `#02fd8a` | DONE status, vertical status bar, green meters |
| warn | `#d1750f` | Orange — header frames, title emphasis |
| error | `#d40202` | ERROR table text (measured `#d70200`) |
| info | `#03ffff` | Cyan info accent |
| glowColor | `#03ffff` | Neon cyan glow on rings/waveforms |

Programmatic measurement confirms: primary accent `#03ffff` (hue 180°, sat 1.0),
background `#00090a`, panel `#021b1d`. Border/ring line measurements: ECG line
`#00f8f8`, radar ring `#31f2f0`, green bar `#008048` modal.

## Border Style

The reference uses **square-cornered (0px radius) thin 1px cyan outlines** at the
per-widget-module granularity — each widget block is its own outlined box, not a
column-level frame. Corner-bracket HUD details on some modules. Very dark teal
dividers between blocks/table rows. Subtle 4px cyan glow on frames.

| Element | Presence | Style | Width | Color | Radius | Glow |
|---------|----------|-------|-------|-------|--------|------|
| frame (canvas trim) | full | solid | 1px | `#0f4a4d` | 0 | subtle cyan 4px |
| cards (widget modules) | full | solid | 1px | `#106060` | 0 | subtle cyan 4px |
| dividers | partial | solid | 1px | `#0d3a3d` | 0 | none |
| inputs | none | solid | 1px | `#0f4a4d` | 0 | none |
| active indicators | full | solid | 2px | `#02fd8a` | 0 | subtle green 6px |

## Layout Regions

1. **topBar** (0–140px): `XRY/B1` title (left), `ANALYSIS / DNA` tag, `ANALYSING ... [XXX]`, `ACTIVE / XRAY JZX / 05`, `BLOOD CIRCULATORY SYSTEM`, `ACTIVE PANELS` control strip, timer `00:00:08.750` (right).
2. **leftBar** (480px wide): top = large circular radar/scan disc (segmented outer ring `#31f2f0`, concentric rings, crosshair, tick marks, target reticle, glow); left edge = vertical green status bar `#02fd8a`; bottom = 4 stacked energy-cell columns (2 bright cyan, 2 dim) + 2×2 circular knobs + `POWER GEN / 252X` + `CODE / ZX / 01252X` labels.
3. **center** (922px wide): human body DNA scan figure (cyan skeleton + pink/purple `#9ba1cd`/`#455173` vascular highlights), concentric arcs/grids, `BODY DNA SCAN` arc title (DNA orange), `MEDICAL ANALYSIS BODY / JZX0154`, `SPEED 7200` / `ALTITUDE 1199` params, bottom scale `00:00:00.083`, `<` `>` nav buttons.
4. **rightBar** (480px wide): top = ECG waveform (grid dots, cyan line, `BPM=100`, `HEART=112`); middle = vertical green bar, `ALTIT` vertical label, value blocks `9400/8300/0511`; bottom = slide rail, `>` button, `157` angle, bottom scale.
5. **bottomBar** (134px tall): `DATA TIMELINE` table — columns `NO. / DATA TIMELINE / DATA/XG / RESULT / REPORTS / 0215`; 3 rows with `ERROR` (red), `RIGHT` (dim), `DONE` (green); orange header frames, thin row dividers, X/+/> icons, hamburger menu.

## Widget Reconciliation

| Reference widget | Existing eDEX slot | Match | Decision |
|------------------|--------------------|-------|----------|
| RADAR (scan disc) | — (no counterpart) | — | **Featured widget** → replaces `WORLD VIEW` globe slot |
| POWER GEN / CODE (stacked meters) | `cpu` | partial | Replace CpuWidget with stacked-meter + knobs widget (usePanel CPU data) |
| ECG / HEART (waveform) | `traffic` | partial | Replace TrafficWidget with ECG waveform widget (useNetwork Tx/Rx history as waveform) |
| ALTIT / STATS (value blocks) | `network-status` | partial | Replace NetworkStatusWidget with status-values widget |
| DATA TIMELINE (table) | `files` | partial | Replace FilesWidget with timeline log table (useFiles data as rows) |

**Featured widget — RADAR:** no existing eDEX widget matches the circular scan
disc; it is the reference's signature look and replaces the globe slot in the
right bar. Implementation: concentric rings, outer segmented ring, crosshair,
center target reticle, rotating sweep animation (conic-gradient wedge, 360°
linear infinite), tick marks, subtle cyan glow.

## Animation

- **Radar sweep (featured widget):** CSS `@keyframes` rotation of a conic-gradient
  wedge on a circular container. Pivot = disc center (`transform-origin: center`
  on a full-width/height element, symmetric bounding box → correct pivot). Verify
  with the Animation Verification plan.
- ECG waveform renders live data (re-renders on snapshot changes, no CSS
  animation needed).
