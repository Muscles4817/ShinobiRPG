import type { CombatOption, Discipline } from '@/game';

import { TechniqueCard } from '../../../components/TechniqueCard';

type Pick = (option: CombatOption) => void;

function cardDiscipline(o: CombatOption): Discipline | 'basic' {
  return o.kind === 'technique' && o.discipline ? o.discipline : 'basic';
}

/** Basics and techniques as a fanned hand of cards. */
export function Hand({
  options,
  onPick,
}: {
  readonly options: readonly CombatOption[];
  readonly onPick: Pick;
}) {
  if (options.length === 0) return null;
  return (
    <nav className="hand" aria-label="Your techniques">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          className="hand-slot"
          disabled={o.disabledReason !== undefined}
          title={o.disabledReason}
          onClick={() => {
            onPick(o);
          }}
        >
          {o.cost !== undefined && <span className="cost-pip">{o.cost}</span>}
          <TechniqueCard
            name={o.label}
            detail={o.disabledReason ?? o.detail}
            discipline={cardDiscipline(o)}
          />
        </button>
      ))}
    </nav>
  );
}

/** Tactics to choose between before a planned fight. */
export function PlanPicker({
  options,
  onPick,
}: {
  readonly options: readonly CombatOption[];
  readonly onPick: Pick;
}) {
  if (options.length === 0) return null;
  return (
    <nav className="plan-picker" aria-label="Tactics">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          className="choice"
          onClick={() => {
            onPick(o);
          }}
        >
          <b>{o.label}</b>
          <small>{o.detail}</small>
        </button>
      ))}
    </nav>
  );
}

/** Small buttons for moves (stepping in or back) and the turn-ending choices. */
export function ActionBar({
  options,
  onPick,
}: {
  readonly options: readonly CombatOption[];
  readonly onPick: Pick;
}) {
  if (options.length === 0) return null;
  return (
    <nav className="action-bar" aria-label="Actions">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          className={o.kind === 'move' ? 'btn ghost small' : 'btn small'}
          disabled={o.disabledReason !== undefined}
          title={o.disabledReason}
          onClick={() => {
            onPick(o);
          }}
        >
          {o.cost !== undefined && <span className="cost-pip inline">{o.cost}</span>}
          {o.label}
          {o.kind !== 'move' && o.detail ? <small> · {o.detail}</small> : null}
          {o.disabledReason && o.kind === 'move' ? <small> · {o.disabledReason}</small> : null}
        </button>
      ))}
    </nav>
  );
}
