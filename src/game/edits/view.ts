import {
  fightingPower,
  STAT_GRADES,
  STAT_IDS,
  STAT_INFO,
  statTier,
  type StatGrade,
  type StatGroup,
  type StatId,
  type Stats,
} from '@/systems/stats';
import { canPerform, type Element, type TechniqueDef } from '@/systems/techniques';

import type { GameContext } from '../context';
import type { Discipline } from '../views/common';
import { versusRoster, type VersusFighter } from '../versus/roster';
import { originalFighter, type FighterOriginal } from './originals';
import { techniqueKinds, type TechniqueKind } from './techniqueKinds';

/**
 * The editor's view of a fighter: each stat beside the pack's value, what they fight with
 * (and whether their grades carry it yet) and what else they could take. Read from the edited
 * world, so what it shows is what versus and a new game will use.
 */

export interface EditorStat {
  readonly id: StatId;
  readonly label: string;
  readonly group: StatGroup;
  readonly value: number;
  readonly original: number;
  readonly grade: StatGrade;
  readonly edited: boolean;
}

export interface EditorTechnique {
  readonly id: string;
  readonly name: string;
  readonly discipline: Discipline;
  readonly rank: StatGrade;
  readonly element: Element | null;
  /** What kind of technique it is, read from what it does (`techniqueKinds`). */
  readonly kinds: readonly TechniqueKind[];
  /** False when their grades don't carry it yet: they won't use it until they do. */
  readonly ready: boolean;
}

export interface FighterEditor {
  readonly fighter: VersusFighter;
  /** Their fighting power as the pack wrote them. */
  readonly originalGrade: StatGrade;
  readonly stats: readonly EditorStat[];
  readonly techniques: readonly EditorTechnique[];
  readonly techniquesEdited: boolean;
  /** Techniques they could be given, by art then rank. */
  readonly choices: readonly EditorTechnique[];
  readonly edited: boolean;
}

/** Whether a technique may be offered: their clan's or no clan's, and nothing that summons. */
function offerable(def: TechniqueDef, original: FighterOriginal): boolean {
  if (def.clan !== undefined && def.clan !== original.clanId) return false;
  return !def.effects.some((e) => e.verb === 'summon');
}

function techniqueOf(def: TechniqueDef, original: FighterOriginal, stats: Stats): EditorTechnique {
  const performer = {
    stats,
    clanId: original.clanId ?? '',
    ...(original.nature ? { nature: original.nature } : {}),
  };
  // A foe fights with what it is written with; only people grow into their techniques.
  const ready = original.ref.kind === 'enemy' || canPerform(def, performer);
  const { id, name, discipline, rank } = def;
  const element = def.element ?? null;
  return { id, name, discipline, rank, element, kinds: techniqueKinds(def), ready };
}

function byArtAndRank(a: EditorTechnique, b: EditorTechnique): number {
  return (
    a.discipline.localeCompare(b.discipline) ||
    STAT_GRADES.indexOf(a.rank) - STAT_GRADES.indexOf(b.rank) ||
    a.name.localeCompare(b.name)
  );
}

function statsOf(original: FighterOriginal, ctx: GameContext, key: string): EditorStat[] {
  const edited = ctx.edits.fighters[key]?.stats ?? {};
  return STAT_IDS.map((id) => {
    const value = edited[id] ?? original.stats[id];
    const { label, group } = STAT_INFO[id];
    const grade = statTier(value).grade;
    return { id, label, group, value, original: original.stats[id], grade, edited: id in edited };
  });
}

/** The editor for a fighter in the (edited) world, or null for an id it doesn't have. */
export function fighterEditor(ctx: GameContext, key: string): FighterEditor | null {
  const original = originalFighter(ctx, key);
  const fighter = versusRoster(ctx).find((f) => f.id === key);
  if (!original || !fighter) return null;
  const stats = statsOf(original, ctx, key);
  const line: Stats = { ...original.stats, ...ctx.edits.fighters[key]?.stats };
  const ids = ctx.edits.fighters[key]?.techniqueIds ?? original.techniqueIds;
  const all = ctx.content.techniques;
  const techniques = ids.flatMap((id) => {
    const def = all.get(id);
    return def ? [techniqueOf(def, original, line)] : [];
  });
  const choices = all.all
    .filter((def) => !ids.includes(def.id) && offerable(def, original))
    .map((def) => techniqueOf(def, original, line))
    .sort(byArtAndRank);
  return {
    fighter,
    originalGrade: statTier(fightingPower(original.stats)).grade,
    stats,
    techniques,
    techniquesEdited: ctx.edits.fighters[key]?.techniqueIds !== undefined,
    choices,
    edited: key in ctx.edits.fighters,
  };
}

/** Everyone the editor can change, as versus lists them, with whether they've been changed. */
export function editorRoster(ctx: GameContext): readonly (VersusFighter & { edited: boolean })[] {
  return versusRoster(ctx).map((f) => ({ ...f, edited: f.id in ctx.edits.fighters }));
}
