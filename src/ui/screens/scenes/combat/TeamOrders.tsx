import { useState } from 'react';

import type { CombatOption } from '@/game';

import { PlanPicker } from './Choices';

type Pick = (option: CombatOption) => void;

/**
 * Orders to the team between rounds: the mark, then each teammate's stance. An order a
 * teammate won't take yet shows what they're doing and why you can't change it.
 */

function groupsOf(options: readonly CombatOption[]): string[] {
  return [...new Set(options.map((o) => o.group ?? ''))];
}

function settingsOf(options: readonly CombatOption[]): string[] {
  return [...new Set(options.map((o) => o.setting ?? ''))];
}

function Order({
  group,
  setting,
  choices,
  onPick,
}: {
  readonly group: string;
  readonly setting: string;
  readonly choices: readonly CombatOption[];
  readonly onPick: Pick;
}) {
  const current = choices.find((c) => c.selected);
  const locked = choices.find((c) => c.disabledReason !== undefined);
  if (locked && choices.every((c) => c.disabledReason !== undefined)) {
    return (
      <div className="plan-setting order-locked">
        <span>{setting}</span>
        {current && <b>{current.label}</b>}
        <small>{locked.disabledReason}</small>
      </div>
    );
  }
  return (
    <label className="plan-setting">
      <span>{setting}</span>
      <select
        aria-label={`${setting} for ${group}`}
        value={current?.id ?? ''}
        onChange={(event) => {
          const chosen = choices.find((c) => c.id === event.target.value);
          if (chosen) onPick(chosen);
        }}
      >
        {current === undefined && <option value="">Choose</option>}
        {choices.map((c) => (
          <option key={c.id} value={c.id} disabled={c.disabledReason !== undefined}>
            {c.label}
          </option>
        ))}
      </select>
      {current?.detail && <small>{current.detail}</small>}
    </label>
  );
}

export function TeamOrders({
  options,
  onPick,
}: {
  readonly options: readonly CombatOption[];
  readonly onPick: Pick;
}) {
  if (options.length === 0) return null;
  return (
    <section className="team-orders" aria-label="Orders">
      {groupsOf(options).map((group) => {
        const inGroup = options.filter((o) => (o.group ?? '') === group);
        return (
          <div key={group} className="order-group">
            <h3 className="plan-heading">{group}</h3>
            {settingsOf(inGroup).map((setting) => (
              <Order
                key={setting}
                group={group}
                setting={setting}
                choices={inGroup.filter((o) => (o.setting ?? '') === setting)}
                onPick={onPick}
              />
            ))}
          </div>
        );
      })}
    </section>
  );
}

function ownerLabel(id: string, names: Readonly<Record<string, string>>): string {
  if (id === '') return 'Your cards';
  const name = names[id];
  return name ? `${name}'s cards` : 'Their cards';
}

/**
 * The card table, and once teammates let you set their cards, a switch between whose cards you
 * are looking at.
 */
export function PlansByOwner({
  options,
  names,
  onPick,
}: {
  readonly options: readonly CombatOption[];
  readonly names: Readonly<Record<string, string>>;
  readonly onPick: Pick;
}) {
  const owners = [...new Set(options.map((o) => o.owner ?? ''))];
  const [owner, setOwner] = useState('');
  const shown = owners.includes(owner) ? owner : '';
  const mine = options.filter((o) => (o.owner ?? '') === shown);
  return (
    <>
      {owners.length > 1 && (
        <div className="plan-tabs plan-owners" role="tablist" aria-label="Whose cards">
          {owners.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={id === shown}
              className={id === shown ? 'btn small' : 'btn ghost small'}
              onClick={() => {
                setOwner(id);
              }}
            >
              {ownerLabel(id, names)}
            </button>
          ))}
        </div>
      )}
      <PlanPicker key={shown} options={mine} onPick={onPick} />
    </>
  );
}
