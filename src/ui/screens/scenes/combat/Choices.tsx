import { useState } from 'react';

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

function groupsOf(options: readonly CombatOption[]): string[] {
  return [...new Set(options.flatMap((o) => (o.group === undefined ? [] : [o.group])))];
}

/** One plan option: a list entry, or a card that toggles in and out of its slots. */
function PlanChoice({
  option: o,
  onPick,
}: {
  readonly option: CombatOption;
  readonly onPick: Pick;
}) {
  const toggle = o.selected !== undefined;
  return (
    <button
      type="button"
      className={toggle ? `plan-card${o.selected ? ' on' : ''}` : 'choice'}
      data-discipline={o.discipline ?? 'basic'}
      aria-pressed={toggle ? o.selected : undefined}
      disabled={o.disabledReason !== undefined}
      title={o.disabledReason}
      onClick={() => {
        onPick(o);
      }}
    >
      <b>{o.label}</b>
      <small>{o.detail}</small>
    </button>
  );
}

/** Plans to set up before (or between rounds of) a planned fight, by group when grouped. */
export function PlanPicker({
  options,
  onPick,
}: {
  readonly options: readonly CombatOption[];
  readonly onPick: Pick;
}) {
  const groups = groupsOf(options);
  const [tab, setTab] = useState<string | null>(null);
  if (options.length === 0) return null;
  const shown = tab ?? groups[0];
  const visible = groups.length > 0 ? options.filter((o) => o.group === shown) : options;
  return (
    <nav className="plan-picker" aria-label="Plan">
      {groups.length > 0 && (
        <div className="plan-tabs" role="tablist">
          {groups.map((g) => (
            <button
              key={g}
              type="button"
              role="tab"
              aria-selected={g === shown}
              className={g === shown ? 'btn small' : 'btn ghost small'}
              onClick={() => {
                setTab(g);
              }}
            >
              {g} <small>{options.filter((o) => o.group === g && o.selected).length}</small>
            </button>
          ))}
        </div>
      )}
      <div className={groups.length > 0 ? 'plan-cards' : 'plan-list'}>
        {visible.map((o) => (
          <PlanChoice key={o.id} option={o} onPick={onPick} />
        ))}
      </div>
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
