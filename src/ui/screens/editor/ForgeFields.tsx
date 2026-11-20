import type { ReactNode } from 'react';

/**
 * The forge's form pieces on paper: a row of stamped choices (one, or several), a checked line
 * and a number in a box. Each says its label, so a reader of the page hears what it sets.
 */

interface Choice {
  readonly id: string;
  readonly label: string;
}

/** One of a few, stamped in seal ink when picked. */
export function ChipPicker({
  label,
  choices,
  value,
  onPick,
}: {
  readonly label: string;
  readonly choices: readonly Choice[];
  readonly value: string;
  readonly onPick: (id: string) => void;
}) {
  return (
    <fieldset className="forge-field">
      <legend>{label}</legend>
      <div className="segments" role="radiogroup" aria-label={label}>
        {choices.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={c.id === value}
            className={c.id === value ? 'seg on' : 'seg'}
            onClick={() => {
              onPick(c.id);
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Any of a few, each stamped when on. */
export function ChipToggles({
  label,
  choices,
  picked,
  onChange,
}: {
  readonly label: string;
  readonly choices: readonly Choice[];
  readonly picked: readonly string[];
  readonly onChange: (ids: readonly string[]) => void;
}) {
  return (
    <fieldset className="forge-field">
      <legend>{label}</legend>
      <div className="segments" role="group" aria-label={label}>
        {choices.map((c) => {
          const on = picked.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              className={on ? 'seg on' : 'seg'}
              onClick={() => {
                onChange(on ? picked.filter((p) => p !== c.id) : [...picked, c.id]);
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** A line to tick, with what ticking it means; a reason in place of it when it can't be. */
export function CheckLine({
  checked,
  onChange,
  children,
  disabled = false,
}: {
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly children: ReactNode;
  readonly disabled?: boolean;
}) {
  return (
    <label className="forge-check">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => {
          onChange(e.target.checked);
        }}
      />
      <span>{children}</span>
    </label>
  );
}

/** A whole number in a box, kept within its range as it is typed. */
export function NumberBox({
  label,
  value,
  min,
  max,
  onChange,
}: {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly onChange: (value: number) => void;
}) {
  return (
    <label className="forge-number">
      <span>{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const typed = Math.round(Number(e.target.value));
          if (Number.isFinite(typed)) onChange(Math.min(max, Math.max(min, typed)));
        }}
      />
    </label>
  );
}
