/**
 * "GHI CHÚ" pill shown on transactions marked as notes (excluded from
 * spending totals). Single home for the note badge styling.
 */
export function NoteBadge() {
  return (
    <span className="shrink-0 text-[9px] font-black text-sky-400 bg-sky-400/10 px-1.5 py-0.5 rounded-full border border-sky-400/20 leading-none">
      GHI CHÚ
    </span>
  )
}
