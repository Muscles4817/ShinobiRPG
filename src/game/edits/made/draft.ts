import type { StatGrade } from '@/systems/stats';
import type {
  Accuracy,
  Discipline,
  Element,
  MoveDistance,
  TechniqueDef,
  TechniqueEffect,
  TechniqueNeeds,
} from '@/systems/techniques';

import { BOOSTABLE, isMadeVerb, VERB_FIELDS, type MadeVerb, type VerbField } from './verbFields';

/**
 * A technique being made in the editor, as its form holds it, and the `TechniqueDef` it becomes.
 * Only what the form offers is here; the rest of a technique (levels, ladders, stages, combos)
 * stays the pack's to write. Its chakra cost is never written: the fight charges what the
 * technique does (`chakraWorth`), so a made technique can't be cheap for what it is.
 */

export type EffectOption = string | number | boolean | readonly string[];

export interface DraftEffect {
  readonly verb: MadeVerb;
  readonly power: number;
  /** The verb's own fields (`VERB_FIELDS`), by key; anything else is dropped. */
  readonly options: Readonly<Record<string, EffectOption>>;
}

export interface TechniqueDraft {
  readonly name: string;
  readonly description: string;
  readonly discipline: Discipline;
  readonly element: Element | null;
  readonly rank: StatGrade;
  readonly accuracy: Accuracy;
  /** The distances it works at; null: its art's usual reach. */
  readonly reach: readonly MoveDistance[] | null;
  readonly effects: readonly DraftEffect[];
  readonly lethal: boolean;
  readonly oncePerFight: boolean;
  /** Only someone of its element's nature can use it. */
  readonly needsNature: boolean;
  /** A body move that moulds chakra: it costs chakra, not breath. */
  readonly moulded: boolean;
}

/** The most an effect's power may be (the strongest authored hit is in the thirties). */
export const MAX_POWER = 40;
/** The most effects one technique does. */
export const MAX_EFFECTS = 4;
/** What studying a technique takes, by rank: the middle of what the packs write. */
const DIFFICULTY: Readonly<Record<StatGrade, number>> = {
  E: 30,
  D: 55,
  C: 80,
  B: 105,
  A: 140,
  S: 175,
};
const BODY_ARTS: readonly Discipline[] = ['taijutsu', 'kenjutsu'];
const WOUNDING: readonly MadeVerb[] = ['damage', 'break', 'area'];
const DEFAULT_DESCRIPTION = 'A technique made in the editor.';

export const BLANK_DRAFT: TechniqueDraft = {
  name: '',
  description: '',
  discipline: 'ninjutsu',
  element: null,
  rank: 'D',
  accuracy: 'steady',
  reach: null,
  effects: [{ verb: 'damage', power: 12, options: {} }],
  lethal: false,
  oncePerFight: false,
  needsNature: false,
  moulded: false,
};

/** A fresh effect of a verb: a middling power and nothing chosen yet. */
export function blankEffect(verb: MadeVerb): DraftEffect {
  return { verb, power: 10, options: {} };
}

/** A field's value as the technique keeps it, or undefined where the verb's default holds. */
function kept(field: VerbField, value: EffectOption | undefined): EffectOption | undefined {
  switch (field.kind) {
    case 'choice':
      return typeof value === 'string' && field.values.includes(value) ? value : undefined;
    case 'flag':
      return value === true ? true : undefined;
    case 'count':
      return Number.isInteger(value) && value !== field.unset ? value : undefined;
    case 'stats':
      return Array.isArray(value) &&
        value.length > 0 &&
        value.every((s: unknown) => (BOOSTABLE as readonly unknown[]).includes(s))
        ? value
        : undefined;
  }
}

/** The effect a draft's effect becomes: its verb, its power and the fields it set. */
export function effectOf(effect: DraftEffect): TechniqueEffect {
  const extras = VERB_FIELDS[effect.verb].flatMap((field) => {
    const value = kept(field, effect.options[field.key]);
    return value === undefined ? [] : [[field.key, value] as const];
  });
  // Built only from the fields `VERB_FIELDS` declares for this verb, each of the type its kind
  // says, and the checker (`draftProblems`) refuses a draft missing one a verb needs.
  return {
    verb: effect.verb,
    power: effect.power,
    ...Object.fromEntries(extras),
  } as TechniqueEffect;
}

function needsOf(draft: TechniqueDraft): TechniqueNeeds | null {
  const needs: TechniqueNeeds = {
    ...(draft.discipline === 'kenjutsu' ? { weapon: 'blade' as const } : {}),
    ...(draft.needsNature && draft.element ? { nature: draft.element } : {}),
  };
  return Object.keys(needs).length > 0 ? needs : null;
}

/** The technique a draft becomes, under the id it is kept by. */
export function madeTechnique(draft: TechniqueDraft, id: string): TechniqueDef {
  const needs = needsOf(draft);
  const moulded = draft.moulded && BODY_ARTS.includes(draft.discipline);
  return {
    id,
    name: draft.name.trim(),
    description: draft.description.trim() || DEFAULT_DESCRIPTION,
    discipline: draft.discipline,
    ...(draft.element ? { element: draft.element } : {}),
    effects: draft.effects.map(effectOf),
    chakraCost: 0,
    rank: draft.rank,
    difficulty: DIFFICULTY[draft.rank],
    ...(needs ? { needs } : {}),
    ...(draft.accuracy !== 'steady' ? { accuracy: draft.accuracy } : {}),
    ...(draft.reach ? { reach: draft.reach } : {}),
    ...(draft.lethal ? { lethal: true as const } : {}),
    ...(draft.oncePerFight ? { oncePerFight: true as const } : {}),
    ...(moulded ? { moulded: true as const } : {}),
  };
}

function draftEffectOf(effect: TechniqueEffect): DraftEffect | null {
  if (!isMadeVerb(effect.verb)) return null;
  // Read field by field as the verb declares them; each value is checked before it is kept.
  const raw: Readonly<Record<string, unknown>> = { ...effect };
  const options = VERB_FIELDS[effect.verb].flatMap((field) => {
    const value = raw[field.key];
    const ok = ['string', 'number', 'boolean'].includes(typeof value) || Array.isArray(value);
    return ok ? [[field.key, value as EffectOption] as const] : [];
  });
  return { verb: effect.verb, power: effect.power, options: Object.fromEntries(options) };
}

/** A made technique back in its form, to change it. */
export function draftOf(def: TechniqueDef): TechniqueDraft {
  return {
    name: def.name,
    description: def.description === DEFAULT_DESCRIPTION ? '' : def.description,
    discipline: def.discipline,
    element: def.element ?? null,
    rank: def.rank,
    accuracy: def.accuracy ?? 'steady',
    reach: def.reach ?? null,
    effects: def.effects.flatMap((e) => draftEffectOf(e) ?? []),
    lethal: def.lethal === true,
    oncePerFight: def.oncePerFight === true,
    needsNature: def.needs?.nature !== undefined,
    moulded: def.moulded === true,
  };
}

function fieldProblem(field: VerbField, value: EffectOption | undefined): string | null {
  switch (field.kind) {
    case 'choice':
      return field.unset === null && kept(field, value) === undefined
        ? `choose what it ${field.label.toLowerCase()}`
        : null;
    case 'flag':
      return null;
    case 'count': {
      if (value === undefined)
        return field.unset === null ? `set ${field.label.toLowerCase()}` : null;
      const ok = typeof value === 'number' && value >= field.min && value <= field.max;
      return ok ? null : `keep ${field.label.toLowerCase()} from ${field.min} to ${field.max}`;
    }
    case 'stats':
      return kept(field, value) === undefined ? 'choose at least one stat it raises' : null;
  }
}

function effectProblems(effect: DraftEffect, n: number): string[] {
  const where = `Effect ${n}`;
  const power =
    Number.isInteger(effect.power) && effect.power >= 1 && effect.power <= MAX_POWER
      ? []
      : [`${where}: power runs from 1 to ${MAX_POWER}.`];
  const fields = VERB_FIELDS[effect.verb].flatMap((field) => {
    const problem = fieldProblem(field, effect.options[field.key]);
    return problem ? [`${where}: ${problem}.`] : [];
  });
  return [...power, ...fields];
}

/** Whether an effect is whole: its power in range and every field its verb needs set. */
export function effectReady(effect: DraftEffect): boolean {
  return effectProblems(effect, 1).length === 0;
}

/** Why a draft can't be kept yet, in words; none when it is ready. */
export function draftProblems(draft: TechniqueDraft): string[] {
  const { effects } = draft;
  return [
    ...(draft.name.trim() ? [] : ['Give it a name.']),
    ...(effects.length === 0 ? ['Give it something to do.'] : []),
    ...(effects.length > MAX_EFFECTS ? [`Keep it to ${MAX_EFFECTS} effects.`] : []),
    ...effects.flatMap((e, i) => effectProblems(e, i + 1)),
    ...(draft.reach?.length === 0 ? ['Let it reach at least one distance.'] : []),
    ...(draft.lethal && !effects.some((e) => WOUNDING.includes(e.verb))
      ? ['Only a technique that wounds can kill in one strike.']
      : []),
    ...(draft.needsNature && !draft.element ? ['Give it an element to need a nature.'] : []),
  ];
}
