/**
 * ECG / HEART widget — the XRY/B1 reference's ECG waveform monitor. A
 * heartbeat-style waveform with a dim dot grid, bright cyan trace, and
 * BPM / HEART readouts. Replaces the TRAFFIC slot in the right bar: the
 * waveform is driven by the network up/down history (live data), rendered as
 * a smooth vital-sign line. The trace re-renders on snapshot changes (no CSS
 * animation — the live data provides the motion).
 */
import { useEffect, useRef, useState } from 'react'
import type { RightWidgetHooks } from '../../widgets/types.ts'
import css from './EcgWidget.module.css'

/** Heartbeat pulse: an idealized QRS complex waveform shape. */
function beatShape(t: number): number {
  // t in [0,1): synthesize a QRS-style pulse train over the sample index.
  const phase = (t * 5) % 1
  if (phase < 0.12) return 0.08 + Math.sin((phase / 0.12) * Math.PI) * 0.12
  if (phase < 0.18) return 0.2 + Math.sin(((phase - 0.12) / 0.06) * Math.PI) * 0.8
  if (phase < 0.26) return -0.1 - Math.sin(((phase - 0.18) / 0.08) * Math.PI) * 0.6
  if (phase < 0.34) return 0.15 + Math.sin(((phase - 0.26) / 0.08) * Math.PI) * 0.25
  return 0.08
}

/** Live ECG-style waveform: the network throughput history blended with a
 *  heartbeat pulse train, sized by ResizeObserver to the section. */
function EkgTrace({ up, down }: { up: readonly number[]; down: readonly number[] }) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ w: 316, h: 120 })

  useEffect(() => {
    const host = hostRef.current
    if (host === null) return
    const measure = (): void => {
      const rect = host.getBoundingClientRect()
      setSize({ w: Math.max(80, Math.floor(rect.width)), h: Math.max(48, Math.floor(rect.height)) })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(host)
    return () => { ro.disconnect() }
  }, [])

  const { w, h } = size
  const PAD = 3
  const samples = Math.max(24, Math.floor(w / 6))
  const live = up.length > 0 ? up : down
  const points = Array.from({ length: samples }, (_, i) => {
    const t = i / (samples - 1)
    const heart = beatShape(t)
    // Blend a small amount of live throughput variation into the baseline.
    const liveIdx = Math.min(live.length - 1, Math.floor(t * Math.max(1, live.length - 1)))
    const liveVal = live.length > 0 ? Math.min(1, (live[liveIdx] ?? 0) / 4) : 0
    const y = PAD + (1 - (heart * 0.85 + liveVal * 0.15)) * (h - 2 * PAD)
    const x = PAD + t * (w - 2 * PAD)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  // Dim dot grid (4×8).
  const dots: { x: number; y: number }[] = []
  for (let r = 1; r <= 3; r += 1) {
    for (let c = 1; c <= 8; c += 1) {
      dots.push({ x: (w / 9) * c, y: (h / 4) * r })
    }
  }

  return (
    <div ref={hostRef} className={css.trace}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
        {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r="1" fill="currentColor" opacity="0.22" />)}
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  )
}

/** ECG widget: BPM/HEART readouts + live waveform. */
export function EcgWidget({ useNetwork }: RightWidgetHooks) {
  const network = useNetwork(s => s)
  const bpm = Math.round(60 + Math.min(60, Math.round(network.downMbs * 10)))
  const heart = Math.round(60 + Math.min(60, Math.round(network.upMbs * 10)))
  return (
    <>
      <div className={css.header}>
        <span className={css.key}>BPM =</span>
        <span className={css.value}>{bpm}</span>
        <span className={css.key}>HEART =</span>
        <span className={css.value}>{heart}</span>
      </div>
      <EkgTrace up={network.upHistory} down={network.downHistory} />
    </>
  )
}
