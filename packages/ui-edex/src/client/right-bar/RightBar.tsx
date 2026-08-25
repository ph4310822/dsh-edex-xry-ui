/**
 * Right bar: a vertical stack of swappable widgets — the ECG/heart monitor,
 * the RADAR featured widget, and the STATUS value blocks. The composition
 * lives in the RIGHT_WIDGETS registry below: add, remove, or reorder a
 * widget by editing one line (its implementation lives in its own folder
 * under widgets/), and every section shares the same chrome via
 * WidgetSection.
 */
import type { RightWidgetHooks, RightWidgetSlot } from '../widgets/types.ts'
import { WidgetSection } from '../widgets/WidgetSection.tsx'
import { EcgWidget } from './widgets/EcgWidget.tsx'
import { RadarWidget } from './widgets/RadarWidget.tsx'
import { StatusWidget } from './widgets/StatusWidget.tsx'
import css from './RightBar.module.css'

/** The right panel's widget composition (top to bottom). */
const RIGHT_WIDGETS: RightWidgetSlot[] = [
  { id: 'ecg', title: 'ECG / HEART', Component: EcgWidget },
  // Compact padding so the square radar fills more of the bar.
  { id: 'radar', title: 'RADAR', compact: true, Component: RadarWidget },
  // Flex-fills the bar's leftover height (screen − bottom panel − other sections).
  { id: 'status', title: 'STATUS', fill: true, Component: StatusWidget },
]

/** The right column content (rendered inside the eDEX shell's right bar). */
export function RightBar({ useNetwork, color }: RightWidgetHooks) {
  return (
    <div className={css.panel} data-testid="edex-right-bar">
      {RIGHT_WIDGETS.map(widget => (
        <WidgetSection key={widget.id} slot={widget}>
          <widget.Component useNetwork={useNetwork} color={color} />
        </WidgetSection>
      ))}
    </div>
  )
}