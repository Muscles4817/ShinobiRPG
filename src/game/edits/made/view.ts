import { gradeValue } from '@/content';
import { createStats, type StatGrade } from '@/systems/stats';
import { maxChakra } from '@/systems/vitals';
import type { Discipline, Element } from '@/systems/techniques';

import type { GameContext } from '../../context';
import { techniqueKinds, type TechniqueKind } from '../../finder';
import { fileReader } from '../../views/creationTechniques';
import { sheetFor, type TechniqueSheet } from '../../views/techniqueSheet';
import { madeTechniques } from '../state';
import { versusRoster } from '../../versus/roster';
import { draftProblems, effectReady, madeTechnique, type TechniqueDraft } from './draft';
import { MADE_PREFIX } from './ids';

/**
 * The editor's view of techniques made in it: the shelf of those kept, and the forge, where a
 * draft is read as the game reads a technique (its card, its full sheet and what it costs) in
 * the hands of a fighter of its own rank, with what stands in the way of keeping it and what
 * is worth knowing before a fight does.
 */

export interface MadeShelfItem {
  readonly id: string;
  readonly name: string;
  readonly discipline: Discipline;
  readonly rank: StatGrade;
  readonly element: Element | null;
  readonly kinds: readonly TechniqueKind[];
  /** The fighters given it, by name. */
  readonly givenTo: readonly string[];
}

export interface ForgeView {
  readonly name: string;
  readonly discipline: Discipline;
  readonly rank: StatGrade;
  readonly kinds: readonly TechniqueKind[];
  readonly sheet: TechniqueSheet;
  /** Whose hands the sheet reads it in. */
  readonly hands: string;
  /** Why it can't be kept yet; empty when it can. */
  readonly problems: readonly string[];
  /** What a fight will make of it that the maker may not expect; never a refusal. */
  readonly notes: readonly string[];
}

/** The fighters a made technique has been given, by name. */
function givenTo(ctx: GameContext, id: string): string[] {
  const keys = Object.entries(ctx.edits.fighters).flatMap(([key, edit]) =>
    edit.techniqueIds?.includes(id) ? [key] : [],
  );
  if (keys.length === 0) return [];
  const roster = versusRoster(ctx);
  return keys.flatMap((key) => roster.find((f) => f.id === key)?.name ?? []);
}

/** Every technique made in the editor for this world, as the shelf lists them. */
export function madeShelf(ctx: GameContext): readonly MadeShelfItem[] {
  return madeTechniques(ctx.edits).map((def) => ({
    id: def.id,
    name: def.name,
    discipline: def.discipline,
    rank: def.rank,
    element: def.element ?? null,
    kinds: techniqueKinds(def),
    givenTo: givenTo(ctx, def.id),
  }));
}

/** A share of a fighter's chakra past which a technique is a big part of the fight's budget. */
const DEAR_SHARE = 0.5;

function notesOn(draft: TechniqueDraft, sheet: TechniqueSheet, tank: number): string[] {
  const { amount, pool } = sheet.cost;
  const chakra = pool === 'chakra';
  return [
    ...(chakra && amount > tank
      ? ['It costs more chakra than a fighter of its rank holds: only deeper wells can cast it.']
      : []),
    ...(chakra && amount <= tank && amount > tank * DEAR_SHARE
      ? ['A fighter of its rank can cast it once before running dry.']
      : []),
    ...(draft.effects.some((e) => e.verb === 'area' && e.options.size === 'vast')
      ? ['A vast blast can’t be outrun and changes the field. Keep these rare.']
      : []),
    ...(draft.lethal ? ['A killing blow is set up by hiding or holding the target first.'] : []),
  ];
}

/** A draft read as a fight will read it, for the forge's preview. */
export function forgeView(ctx: GameContext, draft: TechniqueDraft): ForgeView {
  // Effects still missing a field are left out of the reading until they are whole.
  const whole = { ...draft, effects: draft.effects.filter(effectReady) };
  const def = madeTechnique(whole, `${MADE_PREFIX}draft`);
  const stats = createStats(gradeValue(draft.rank));
  const sheet = sheetFor({ ctx, def, you: fileReader(stats), unstable: false });
  return {
    name: def.name || 'Unnamed technique',
    discipline: def.discipline,
    rank: def.rank,
    kinds: techniqueKinds(def),
    sheet,
    hands: `In the hands of a ${draft.rank}-grade fighter`,
    problems: draftProblems(draft),
    notes: notesOn(draft, sheet, maxChakra(stats)),
  };
}
