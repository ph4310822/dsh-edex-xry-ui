/**
 * RADAR widget — the XRY/B1 featured widget. Reproduces the reference's
 * signature circular radar/scan disc: bright segmented outer ring, concentric
 * inner rings, a crosshair, tick marks around the rim, a center target
 * reticle, and a rotating sweep (conic-gradient wedge, 360° linear infinite).
 * Replaces the WORLD VIEW globe slot in the right bar.
 *
 * The sweep pivot: the wedge is a full-square absolutely-positioned layer, so
 * its bounding box is symmetric about the disc center — `transform-origin:
 * center` rotates it exactly around the intended pivot (see Animation
 * Verification: a symmetric bbox means fill-box center == disc center).
 */
import type { RightWidgetHooks } from '../../widgets/types.ts'
import css from './RadarWidget.module.css'

/** Angle tick marks: 24 ticks around the rim (every 15°). */
const TICKS = Array.from({ length: 24 }, (_, i) => i * 15)

/** The featured radar disc: rings + crosshair + sweep + reticle. */
function ScanDisc() {
  return (
    <div className={css.disc}>
      {/* Concentric rings (outer to inner). */}
      <span className={css.ring} />
      <span className={css.ringInner} />
      <span className={css.ringCore} />
      {/* Crosshair through the center. */}
      <span className={css.crossH} />
      <span className={css.crossV} />
      {/* Rotating sweep wedge (conic-gradient, 360° linear infinite). */}
      <span className={css.sweep} aria-hidden="true" />
      {/* Center target reticle. */}
      <span className={css.reticle}>
        <span className={css.reticleCore} />
      </span>
      {/* Rim tick marks: each sits inside a full-size square wrapper whose
          center is the disc center, so rotating the wrapper orbits the tick
          around the disc center (correct pivot for every angle). */}
      {TICKS.map(deg => (
        <span key={deg} className={css.tickWrap} style={{ transform: `rotate(${deg}deg)` }}>
          <span className={css.tick} />
        </span>
      ))}
    </div>
  )
}

/** RADAR widget: the scan disc with a small status readout line. */
export function RadarWidget(_: RightWidgetHooks) {
  return (
    <div className={css.root} data-testid="edex-core-radar">
      <div className={css.frame}>
        <ScanDisc />
      </div>
      <div className={css.readout}>
        <span className={css.readoutKey}>SCAN</span>
        <span className={css.readoutValue}>RADAR</span>
      </div>
    </div>
  )
}
