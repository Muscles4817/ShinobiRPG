import type { GearItem } from '@/game';

interface GearTagProps {
  readonly item: GearItem;
}

/** What kind of piece it is, with its rank as an ink stamp: "Blade" [C]. */
export function GearKind({ item }: GearTagProps) {
  return (
    <span className="gear-kind">
      {item.unique ? `${item.kind}, one of a kind` : item.kind}
      <span className="badge" aria-label={`Rank ${item.rank}`}>
        {item.rank}
      </span>
    </span>
  );
}

/** What a piece does in a fight, as chips: green what it gives, amber what it costs. */
export function GearChips({ item }: GearTagProps) {
  return (
    <span className="chips gear-chips">
      {item.effects.map((chip) => (
        <span key={chip.label} className={`chip ${chip.tone}`}>
          {chip.label}
        </span>
      ))}
    </span>
  );
}
