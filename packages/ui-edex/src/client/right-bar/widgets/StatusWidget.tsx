/**
 * STATUS widget — the XRY/B1 reference's ALTIT/STATUS value blocks and
 * vertical meter. Replaces the NETWORK STATUS slot in the right bar: shows
 * status readouts from the network snapshot (rx/tx values, ping, speed) as
 * reference-style value blocks with a vertical green meter bar.
 */
import type { CSSProperties } from 'react'
import type { RightWidgetHooks } from '../../widgets/types.ts'
import css from './StatusWidget.module.css'

/** Semi-randomized value blocks for the "ALTIT" / "9400 / 8300 / 0511" look,
 *  derived from the live network snapshot. */
function ValueBlocks({ rx, tx, ping }: { rx: number; tx: number; ping: number | null }) {
  const blocks = [
    { label: 'RX', value: rx.toFixed(0) },
    { label: 'TX', value: tx.toFixed(0) },
    { label: 'PING', value: ping === null ? '--' : ping.toFixed(0) },
  ]
  return (
    <div className={css.blocks}>
      {blocks.map(b => (
        <div key={b.label} className={css.block}>
          <span className={css.blockLabel}>{b.label}</span>
          <span className={css.blockValue}>{b.value}</span>
        </div>
      ))}
    </div>
  )
}

/** Vertical green meter bar: the reference's thin green status indicator.
 *  Fill level is derived from the current throughput (0-100%). */
function VerticalMeter({ pct }: { pct: number }) {
  return (
    <div className={css.meterTrack}>
      <div
        className={css.meterFill}
        style={{ '--meter-pct': Math.min(1, Math.max(0.05, pct / 100)) } as CSSProperties}
      />
    </div>
  )
}

/** STATUS widget: value blocks + vertical meter + slide rail. */
export function StatusWidget({ useNetwork }: RightWidgetHooks) {
  const network = useNetwork(s => s)
  // Derive value-block numbers from the network snapshot.
  const rx = network.network.rxBytes / 1e6
  const tx = network.network.txBytes / 1e6
  const ping = network.network.pingMs
  const meterPct = network.downMbs > 0 ? Math.min(100, Math.round(network.downMbs * 20)) : 10
  return (
    <>
      <div className={css.topRow}>
        <VerticalMeter pct={meterPct} />
        <div className={css.altit}>
          <span className={css.altitLabel}>ALTIT</span>
          <span className={css.altitValue}>{String(Math.round(network.downMbs)).padStart(4, ' ')}</span>
        </div>
      </div>
      <ValueBlocks rx={rx} tx={tx} ping={ping} />
    </>
  )
}