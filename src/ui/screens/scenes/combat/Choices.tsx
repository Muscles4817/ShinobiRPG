import { useState } from 'react';

import type { CombatOption, Discipline } from '@/game';

import { TechniqueCard } from '../../../components/TechniqueCard';
import { usePlanPreview } from './planPreview';
import { PlanSlots } from './PlanSlots';

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

/** The one reason every card shown is blocked (slots full), said once instead of on each. */
function sharedBlocker(options: readonly CombatOption[]): string | null {
  const reasons = new Set(options.map((o) => o.disabledReason));
  const [only] = reasons;
  return reasons.size === 1 && only !== undefined ? only : null;
}

/**
 * One plan option: a list entry, or a card that toggles in and out of its slots. A blocked
 * option says why on the card, unless the reason is already said once above the cards.
 */
function PlanChoice({
  option: o,
  onPick,
  reasonShown,
}: {
  readonly option: CombatOption;
  readonly onPick: Pick;
  readonly reasonShown: boolean;
}) {
  const toggle = o.selected !== undefined;
  const preview = usePlanPreview(o);
  return (
    <button
      {...preview}
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
      <small>{reasonShown ? o.detail : (o.disabledReason ?? o.detail)}</small>
    </button>
  );
}

/**
 * A distance's own settings, each a picker showing the current choice: the defence kept ready
 * there, and where you fight.
 */
function RangeSettings({
  settings,
  onPick,
}: {
  readonly settings: readonly CombatOption[];
  readonly onPick: Pick;
}) {
  if (settings.length === 0) return null;
  const names = [...new Set(settings.map((o) => o.setting ?? ''))];
  return (
    <div className="plan-range-settings">
      {names.map((name) => {
        const choices = settings.filter((o) => o.setting === name);
        const current = choices.find((c) => c.selected) ?? choices[0];
        return (
          <label key={name} className="plan-setting">
            <span>{name}</span>
            <select
              aria-label={name}
              value={current?.id ?? ''}
              onChange={(event) => {
                const chosen = choices.find((c) => c.id === event.target.value);
                if (chosen) onPick(chosen);
              }}
            >
              {choices.map((c) => (
                <option key={c.id} value={c.id} disabled={c.disabledReason !== undefined}>
                  {c.label}
                </option>
              ))}
            </select>
            {current?.detail && <small>{current.detail}</small>}
          </label>
        );
      })}
    </div>
  );
}

/** Plans to set up before (or between rounds of) a planned fight, by group when grouped. */
export function PlanPicker({
  options,
  here,
  onPick,
}: {
  readonly options: readonly CombatOption[];
  /** The distance the fight is at ("mid"): its group opens first and is marked. */
  readonly here?: string | undefined;
  readonly onPick: Pick;
}) {
  const groups = groupsOf(options);
  const [tab, setTab] = useState<string | null>(null);
  if (options.length === 0) return null;
  const isHere = (group: string) => group.toLowerCase() === here;
  const shown = tab ?? groups.find(isHere) ?? groups[0];
  const inGroup = groups.length > 0 ? options.filter((o) => o.group === shown) : options;
  const adjustments = inGroup.filter((o) => o.adjusts !== undefined);
  // A setting that belongs to the distance, not to a slot: its defence, where to fight.
  const settings = inGroup.filter((o) => o.adjusts === undefined && o.setting !== undefined);
  const entries = inGroup.filter((o) => o.adjusts === undefined && o.setting === undefined);
  const ordered = entries.filter((o) => o.rank !== undefined);
  const visible = entries.filter((o) => o.rank === undefined);
  const ranks = options.some((o) => o.rank !== undefined || o.adjusts !== undefined);
  const blocker = sharedBlocker(visible);
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
              {g}{' '}
              <small>
                {isHere(g)
                  ? 'You are here'
                  : options.filter((o) => o.group === g && o.selected && !o.adjusts && !o.setting)
                      .length}
              </small>
            </button>
          ))}
        </div>
      )}
      <RangeSettings settings={settings} onPick={onPick} />
      {ranks && (
        <PlanSlots
          entries={ordered}
          adjustments={adjustments}
          label={`${shown ?? 'Plan'}: first to last`}
          onPick={onPick}
        />
      )}
      {ranks && visible.length > 0 && <h3 className="plan-heading">Cards you could add</h3>}
      {blocker && <p className="plan-empty">{blocker}</p>}
      <div className={groups.length > 0 ? 'plan-cards' : 'plan-list'}>
        {visible.map((o) => (
          <PlanChoice key={o.id} option={o} onPick={onPick} reasonShown={blocker !== null} />
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
          {o.kind !== 'move' && o.detail ? <small>{o.detail}</small> : null}
          {o.disabledReason && o.kind === 'move' ? <small>{o.disabledReason}</small> : null}
        </button>
      ))}
    </nav>
  );
}
