import type { RangeBand } from '@/game';

const BANDS: readonly { id: RangeBand; label: string }[] = [
  { id: 'close', label: 'Close' },
  { id: 'mid', label: 'Mid' },
  { id: 'far', label: 'Far' },
];

/** How far apart the two sides stand. */
export function RangeStrip({ range }: { readonly range: RangeBand }) {
  return (
    <div className="range-strip" aria-label={`Range: ${range}`}>
      {BANDS.map((b) => (
        <span key={b.id} className={b.id === range ? 'band on' : 'band'}>
          {b.label}
        </span>
      ))}
    </div>
  );
}
