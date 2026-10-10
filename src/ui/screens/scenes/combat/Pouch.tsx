import type { CombatOption } from '@/game';

interface PouchProps {
  readonly options: readonly CombatOption[];
  readonly onPick: (option: CombatOption) => void;
}

/** The tools you carried in, as a row of their own; each says why when it can't be used. */
export function Pouch({ options, onPick }: PouchProps) {
  if (options.length === 0) return null;
  return (
    <nav className="pouch" aria-label="Fight tools">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          className="btn ghost small"
          disabled={o.disabledReason !== undefined}
          title={o.disabledReason ?? o.detail}
          onClick={() => {
            onPick(o);
          }}
        >
          {o.cost !== undefined && <span className="cost-pip inline">{o.cost}</span>}
          {o.label}
          <small> · {o.disabledReason ?? o.detail}</small>
        </button>
      ))}
    </nav>
  );
}
