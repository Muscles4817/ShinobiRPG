import {
  blankEffect,
  choiceLabel,
  FORGE_CHOICES,
  MADE_VERBS,
  MAX_EFFECTS,
  MAX_POWER,
  VERB_FIELDS,
  VERB_LABEL,
  type DraftEffect,
  type EffectOption,
  type MadeVerb,
  type VerbField,
} from '@/game';

import { CheckLine, ChipToggles, NumberBox } from './ForgeFields';

/**
 * What a made technique does, in order: each effect a verb, its power and whatever that verb
 * asks for besides (`VERB_FIELDS`), so a new field on a verb shows here without a change.
 */

const isVerb = (value: string): value is MadeVerb =>
  (MADE_VERBS as readonly string[]).includes(value);

function ChoiceField({
  field,
  value,
  onSet,
  name,
}: {
  readonly field: Extract<VerbField, { kind: 'choice' }>;
  readonly value: EffectOption | undefined;
  readonly onSet: (value: EffectOption | undefined) => void;
  readonly name: string;
}) {
  const picked = typeof value === 'string' ? value : '';
  return (
    <label className="forge-number">
      <span>{field.label}</span>
      <select
        aria-label={`${name}: ${field.label}`}
        value={picked}
        onChange={(e) => {
          onSet(e.target.value === '' ? undefined : e.target.value);
        }}
      >
        <option value="" disabled={field.unset === null}>
          {field.unset === null ? 'Choose…' : choiceLabel(field.unset)}
        </option>
        {field.values
          .filter((v) => v !== field.unset)
          .map((v) => (
            <option key={v} value={v}>
              {choiceLabel(v)}
            </option>
          ))}
      </select>
    </label>
  );
}

function FieldInput({
  field,
  value,
  onSet,
  name,
}: {
  readonly field: VerbField;
  readonly value: EffectOption | undefined;
  readonly onSet: (value: EffectOption | undefined) => void;
  readonly name: string;
}) {
  switch (field.kind) {
    case 'choice':
      return <ChoiceField field={field} value={value} onSet={onSet} name={name} />;
    case 'flag':
      return (
        <CheckLine
          checked={value === true}
          onChange={(on) => {
            onSet(on ? true : undefined);
          }}
        >
          {field.label}
        </CheckLine>
      );
    case 'count':
      return (
        <NumberBox
          label={field.label}
          value={typeof value === 'number' ? value : (field.unset ?? field.min)}
          min={field.min}
          max={field.max}
          onChange={onSet}
        />
      );
    case 'stats':
      return (
        <ChipToggles
          label={field.label}
          choices={FORGE_CHOICES.boosts}
          picked={Array.isArray(value) ? value : []}
          onChange={(ids) => {
            onSet(ids.length > 0 ? ids : undefined);
          }}
        />
      );
  }
}

function withOption(effect: DraftEffect, key: string, value: EffectOption | undefined) {
  const { [key]: _was, ...rest } = effect.options;
  return { ...effect, options: value === undefined ? rest : { ...rest, [key]: value } };
}

function EffectRow({
  effect,
  n,
  onChange,
  onRemove,
}: {
  readonly effect: DraftEffect;
  readonly n: number;
  readonly onChange: (effect: DraftEffect) => void;
  readonly onRemove: (() => void) | null;
}) {
  const name = `Effect ${n}`;
  return (
    <li className="forge-effect">
      <div className="forge-effect-head">
        <span className="forge-effect-n" aria-hidden="true">
          {n}
        </span>
        <select
          aria-label={name}
          value={effect.verb}
          onChange={(e) => {
            if (isVerb(e.target.value))
              onChange({ ...blankEffect(e.target.value), power: effect.power });
          }}
        >
          {MADE_VERBS.map((v) => (
            <option key={v} value={v}>
              {VERB_LABEL[v]}
            </option>
          ))}
        </select>
        <NumberBox
          label="Power"
          value={effect.power}
          min={1}
          max={MAX_POWER}
          onChange={(power) => {
            onChange({ ...effect, power });
          }}
        />
        {onRemove && (
          <button
            type="button"
            className="btn ghost small"
            aria-label={`Remove ${name}`}
            onClick={onRemove}
          >
            Remove
          </button>
        )}
      </div>
      {VERB_FIELDS[effect.verb].map((field) => (
        <FieldInput
          key={field.key}
          field={field}
          name={name}
          value={effect.options[field.key]}
          onSet={(value) => {
            onChange(withOption(effect, field.key, value));
          }}
        />
      ))}
    </li>
  );
}

export function ForgeEffects({
  effects,
  onChange,
}: {
  readonly effects: readonly DraftEffect[];
  readonly onChange: (effects: readonly DraftEffect[]) => void;
}) {
  const replace = (i: number, next: DraftEffect) => {
    onChange(effects.map((e, j) => (j === i ? next : e)));
  };
  return (
    <fieldset className="forge-field forge-effects">
      <legend>What it does, in order</legend>
      <ol>
        {effects.map((effect, i) => (
          <EffectRow
            key={i}
            effect={effect}
            n={i + 1}
            onChange={(next) => {
              replace(i, next);
            }}
            onRemove={
              effects.length > 1
                ? () => {
                    onChange(effects.filter((_, j) => j !== i));
                  }
                : null
            }
          />
        ))}
      </ol>
      {effects.length < MAX_EFFECTS ? (
        <button
          type="button"
          className="btn ghost small"
          onClick={() => {
            onChange([...effects, blankEffect('daze')]);
          }}
        >
          Add an effect
        </button>
      ) : (
        <p className="muted">A technique does at most {MAX_EFFECTS} things.</p>
      )}
    </fieldset>
  );
}
