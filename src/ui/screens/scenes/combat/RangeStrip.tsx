import type { RangeBand } from '@/game';

const BANDS: readonly { id: RangeBand; label: string }[] = [
  { id: 'close', label: 'Close' },
  { id: 'mid', label: 'Mid' },
  { id: 'far', label: 'Far' },
];

/**
 * How far apart the two sides stand: a ruled distance scale with an ink mark at the current
 * band. It reads as information, not as tabs: no boxes, nothing to press.
 */
export function RangeStrip({ range }: { readonly range: RangeBand }) {
  const current = BANDS.find((b) => b.id === range)?.label ?? range;
  return (
    <div
      className="range-strip"
      role="img"
      aria-label={`Fighting at ${current.toLowerCase()} range`}
    >
      {BANDS.map((b) => (
        <span key={b.id} className={b.id === range ? 'band on' : 'band'} aria-hidden="true">
          {b.label}
        </span>
      ))}
    </div>
  );
}
