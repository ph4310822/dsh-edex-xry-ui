/**
 * POWER GEN widget — the XRY/B1 reference's stacked energy-cell columns and
 * circular knobs with POWER GEN / CODE labels. Replaces the CPU slot in the
 * left bar: the four stacked columns are driven by live panel data (per-core
 * busy, memory, swap, tasks), each column filling from the bottom like the
 * reference's cascade lights. The two 2x2 knobs echo the reference's circular
 * control rings (thermal + load).
 */
import type { LeftWidgetHooks } from '../../widgets/types.ts'
import css from './PowerWidget.module.css'

/** One stacked segment column: `filled` of `total` cells light up. */
function StackColumn({ label, pct }: { label: string; pct: number }) {
  const CELLS = 12
  const filled = Math.round((Math.min(100, Math.max(0, pct)) / 100) * CELLS)
  return (
    <div className={css.column}>
      <div className={css.cells}>
        {Array.from({ length: CELLS }, (_, i) => (
          <span key={i} className={i < filled ? css.cellOn : css.cellOff} />
        ))}
      </div>
      <span className={css.columnLabel}>{label}</span>
    </div>
  )
}

/** 2x2 circular knob cluster: rings with a center dot (reference's control
 *  rings). Fill state derived from a 0-100 value. */
function Knob({ pct }: { pct: number }) {
  return (
    <div className={css.knob}>
      <span className={css.knobRing} />
      <span className={css.knobRingInner} />
      <span className={pct > 50 ? css.knobCoreOn : css.knobCore} />
    </div>
  )
}

/** POWER GEN widget: stacked columns + knob cluster + labels. */
export function PowerWidget({ usePanel }: LeftWidgetHooks) {
  const panel = usePanel(s => s)
  const avg = (arr: readonly number[]): number =>
    arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length
  const memPct = panel.memoryTotalGiB > 0 ? (panel.memoryUsedGiB / panel.memoryTotalGiB) * 100 : 0
  const swapPct = panel.swapTotalGiB > 0 ? (panel.swapUsedGiB / panel.swapTotalGiB) * 100 : 0
  const cpuPct = avg(panel.cpuBusy)
  const tempPct = panel.thermalLevel === null ? 40 : panel.thermalLevel
  return (
    <>
      <div className={css.columns}>
        <StackColumn label="PWR" pct={cpuPct} />
        <StackColumn label="MEM" pct={memPct} />
        <StackColumn label="SWP" pct={swapPct} />
        <StackColumn label="TMP" pct={tempPct} />
      </div>
      <div className={css.labelRow}>
        <span className={css.label}>POWER GEN / {String(Math.round(cpuPct)).padStart(3, '0')}</span>
        <span className={css.label}>CODE / ZX / {String(panel.tasks).padStart(5, '0')}</span>
      </div>
      <div className={css.knobs}>
        <Knob pct={tempPct} />
        <Knob pct={cpuPct} />
        <Knob pct={memPct} />
        <Knob pct={swapPct} />
      </div>
    </>
  )
}