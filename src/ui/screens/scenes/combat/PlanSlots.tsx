import type { CombatOption } from '@/game';

type Pick = (option: CombatOption) => void;

/**
 * A plan kept in priority order: the slotted entries first to last, each with the engine's
 * adjustments beside it. An adjustment that stands alone (move up) is a button; a set of
 * alternatives (when it plays, whom it aims at) is a picker showing the current choice.
 */

function settingsOf(adjustments: readonly CombatOption[]): [string, CombatOption[]][] {
  const named = new Map<string, CombatOption[]>();
  for (const o of adjustments) {
    const key = o.setting ?? o.label;
    named.set(key, [...(named.get(key) ?? []), o]);
  }
  return [...named.entries()];
}

function Setting({
  name,
  choices,
  entry,
  onPick,
}: {
  readonly name: string;
  readonly choices: readonly CombatOption[];
  readonly entry: CombatOption;
  readonly onPick: Pick;
}) {
  const [only] = choices;
  if (only && choices.length === 1) {
    return (
      <button
        type="button"
        className="btn ghost small plan-move"
        aria-label={`${only.label}: ${entry.label}`}
        disabled={only.disabledReason !== undefined}
        onClick={() => {
          onPick(only);
        }}
      >
        {only.label}
      </button>
    );
  }
  const current = choices.find((c) => c.selected) ?? only;
  return (
    <label className="plan-setting">
      <span>{name}</span>
      <select
        aria-label={`${name} for ${entry.label}`}
        value={current?.id}
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
    </label>
  );
}

/** One slotted entry: its place, the card (tap to take it out) and how it plays. */
function SlotRow({
  entry,
  adjustments,
  onPick,
}: {
  readonly entry: CombatOption;
  readonly adjustments: readonly CombatOption[];
  readonly onPick: Pick;
}) {
  const settings = settingsOf(adjustments);
  const buttons = settings.filter(([, choices]) => choices.length === 1);
  const pickers = settings.filter(([, choices]) => choices.length > 1);
  return (
    <li className="plan-slot">
      <span className="plan-rank num" aria-hidden="true">
        {(entry.rank ?? 0) + 1}
      </span>
      <button
        type="button"
        className="plan-card on"
        data-discipline={entry.discipline ?? 'basic'}
        aria-pressed={true}
        title="Take this card out"
        onClick={() => {
          onPick(entry);
        }}
      >
        <b>{entry.label}</b>
        <small>{entry.detail}</small>
      </button>
      {buttons.map(([name, choices]) => (
        <Setting key={name} name={name} choices={choices} entry={entry} onPick={onPick} />
      ))}
      {pickers.length > 0 && (
        <div className="plan-settings">
          {pickers.map(([name, choices]) => (
            <Setting key={name} name={name} choices={choices} entry={entry} onPick={onPick} />
          ))}
        </div>
      )}
    </li>
  );
}

/** The slotted entries of one group, first to last, with their adjustments. */
export function PlanSlots({
  entries,
  adjustments,
  label,
  onPick,
}: {
  readonly entries: readonly CombatOption[];
  readonly adjustments: readonly CombatOption[];
  readonly label: string;
  readonly onPick: Pick;
}) {
  if (entries.length === 0) {
    return <p className="plan-empty">Nothing slotted here yet. You will improvise.</p>;
  }
  const ordered = [...entries].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
  return (
    <ol className="plan-order" aria-label={label}>
      {ordered.map((entry) => (
        <SlotRow
          key={entry.id}
          entry={entry}
          adjustments={adjustments.filter((a) => a.adjusts === entry.id)}
          onPick={onPick}
        />
      ))}
    </ol>
  );
}
