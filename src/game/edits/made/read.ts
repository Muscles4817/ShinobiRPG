import { STAT_GRADES, type StatGrade } from '@/systems/stats';
import {
  ACCURACIES,
  DISCIPLINES,
  ELEMENTS,
  type Accuracy,
  type Discipline,
  type Element,
  type MoveDistance,
  type TechniqueDef,
} from '@/systems/techniques';

import {
  draftOf,
  draftProblems,
  madeTechnique,
  type DraftEffect,
  type TechniqueDraft,
} from './draft';
import { MADE_PREFIX } from './ids';
import { isMadeVerb } from './verbFields';

/**
 * Made techniques read back from untrusted data (the device's edit book, a save's copy): each
 * is read as a draft, held to the same checker as the form, and made again, so whatever was
 * kept becomes exactly what the editor would make of it, and whatever doesn't fit is dropped.
 */

type Raw = Readonly<Record<string, unknown>>;

const isRecord = (value: unknown): value is Raw =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function oneOf<T extends string>(values: readonly T[], value: unknown): T | undefined {
  return values.find((v) => v === value);
}

const BANDS: readonly MoveDistance[] = ['close', 'mid', 'far'];

function reachFrom(raw: unknown): readonly MoveDistance[] | null | undefined {
  if (raw === undefined) return null;
  if (!Array.isArray(raw)) return undefined;
  const bands = raw.flatMap((b) => oneOf(BANDS, b) ?? []);
  return bands.length === raw.length ? bands : undefined;
}

function effectFrom(raw: unknown): DraftEffect | null {
  if (!isRecord(raw) || !isMadeVerb(raw.verb) || typeof raw.power !== 'number') return null;
  // The whole effect goes back through `draftOf`, which keeps only the verb's declared fields.
  return { verb: raw.verb, power: raw.power, options: {} };
}

interface Shape {
  readonly discipline: Discipline;
  readonly rank: StatGrade;
  readonly element: Element | undefined;
  readonly accuracy: Accuracy | undefined;
}

function shapeFrom(raw: Raw): Shape | null {
  const discipline = oneOf(DISCIPLINES, raw.discipline);
  const rank = oneOf(STAT_GRADES, raw.rank);
  const element = oneOf(ELEMENTS, raw.element);
  const accuracy = oneOf(ACCURACIES, raw.accuracy);
  if (!discipline || !rank) return null;
  if (raw.element !== undefined && !element) return null;
  if (raw.accuracy !== undefined && !accuracy) return null;
  return { discipline, rank, element, accuracy };
}

function draftFrom(raw: Raw): TechniqueDraft | null {
  const shape = shapeFrom(raw);
  const reach = reachFrom(raw.reach);
  const effects = Array.isArray(raw.effects) ? raw.effects : [];
  const read = effects.map(effectFrom);
  const usable = read.every((e) => e !== null) && read.length > 0;
  if (!shape || reach === undefined || !usable || typeof raw.name !== 'string') return null;
  // Read the effects whole through `draftOf`: the shape of each verb's fields lives there.
  const def = { ...raw, effects } as unknown as TechniqueDef;
  const needs = isRecord(raw.needs) ? raw.needs : {};
  return {
    ...draftOf(def),
    name: raw.name,
    description: typeof raw.description === 'string' ? raw.description : '',
    discipline: shape.discipline,
    element: shape.element ?? null,
    rank: shape.rank,
    accuracy: shape.accuracy ?? 'steady',
    reach,
    lethal: raw.lethal === true,
    oncePerFight: raw.oncePerFight === true,
    needsNature: needs.nature !== undefined,
    moulded: raw.moulded === true,
  };
}

/** A made technique read from untrusted data, or null when it isn't one the editor would make. */
export function madeFrom(id: string, raw: unknown): TechniqueDef | null {
  if (!id.startsWith(MADE_PREFIX) || !isRecord(raw)) return null;
  const draft = draftFrom(raw);
  return draft && draftProblems(draft).length === 0 ? madeTechnique(draft, id) : null;
}
