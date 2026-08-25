/**
 * DATA TIMELINE widget — the XRY/B1 reference's full-width scan-log table.
 * Replaces the FILES slot in the bottom bar: the live filesystem listing is
 * rendered as timeline rows (NO. / DATA TIMELINE / DATA:XG / RESULT) with the
 * reference's orange header frames, thin row dividers, and status coloring
 * (directories green DONE, files dim RIGHT). Navigation is preserved: rows
 * open directories / select files like the original files widget.
 */
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import type { BottomWidgetHooks } from '../../widgets/types.ts'
import css from './TimelineWidget.module.css'

/** Reference-style status label per entry kind/selection. */
function statusFor(isDirectory: boolean, selected: boolean): { text: string; tone: 'done' | 'right' | 'error' } {
  if (selected) return { text: 'ERROR', tone: 'error' }
  return isDirectory ? { text: 'DONE', tone: 'done' } : { text: 'RIGHT', tone: 'right' }
}

/** One timeline row: NO. / name / type / result. */
function TimelineRow({
  index, name, isDirectory, selected, onOpen,
}: { index: number; name: string; isDirectory: boolean; selected: boolean; onOpen: () => void }) {
  const status = statusFor(isDirectory, selected)
  return (
    <button
      type="button"
      className={css.row}
      data-selected={selected || undefined}
      onClick={onOpen}
      title={name}
      data-testid="edex-timeline-row"
    >
      <span className={css.colNo}>{String(index).padStart(4, '0')}</span>
      <span className={css.colData}>{name}</span>
      <span className={css.colXg}>{isDirectory ? 'DIR' : 'FILE'}</span>
      <span className={`${css.colResult} ${css[status.tone]}`}>{status.text}</span>
    </button>
  )
}

/** DATA TIMELINE widget: header + scan-log rows from the live listing. */
export function TimelineWidget({ useFiles, refreshFiles, navigateFiles, selectFile }: BottomWidgetHooks) {
  const files = useFiles(s => s)

  useEffect(() => {
    refreshFiles()
  }, [refreshFiles])

  return (
    <div className={css.root} data-testid="edex-timeline-widget">
      <div className={css.header}>
        <span className={css.title}>DATA TIMELINE</span>
        <span className={css.reports}>REPORTS / {String(files.entries.length).padStart(4, '0')}</span>
      </div>
      <div className={css.actions}>
        <button type="button" className={css.upButton} onClick={() => { navigateFiles('..') }} aria-label="Up">↑</button>
        <button type="button" className={css.upButton} onClick={refreshFiles} aria-label="Refresh">⟳</button>
        {files.error !== null && <span className={css.error}>{files.error}</span>}
      </div>
      <div className={css.list}>
        {files.error === null && files.phase === 'loading' && files.entries.length === 0 && (
          <div className={css.hint}>loading…</div>
        )}
        {files.entries.map((entry, i) => (
          <TimelineRow
            key={entry.name}
            index={i + 1}
            name={entry.name}
            isDirectory={entry.isDirectory}
            selected={files.selected === entry.name}
            onOpen={() => {
              if (entry.isDirectory) navigateFiles(entry.name)
              else selectFile(entry.name)
            }}
          />
        ))}
      </div>
      <div className={css.footer}>
        <span className={css.footerText}>
          MOUNT {files.storage.path === '' ? '—' : files.storage.path} · used {files.storage.usedPct}%
        </span>
        <span className={css.footerGlyphs}>{'\u2630'} {'\u00d7'}</span>
      </div>
    </div>
  )
}

// Keep ReactNode referenced (used by older tsx configs for JSX inference).
export type { ReactNode }