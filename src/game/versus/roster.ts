import type { EnemyDef, PersonDef } from '@/content';
import { fightingPower, statTier, type StatGrade, type Stats } from '@/systems/stats';

import { enemyStatLine } from '../combatants';
import type { GameContext } from '../context';

/**
 * Who can fight in versus mode: the pack's shinobi as written (genin to kage, with their
 * arsenals) and its foes, each read by fighting power so the strongest are easy to find.
 */

/** Groups on the picker, strongest first. */
export const VERSUS_GROUPS = ['Kage', 'Jōnin', 'Chūnin', 'Genin', 'Foes'] as const;
export type VersusGroup = (typeof VERSUS_GROUPS)[number];

const PERSON_KEY = 'person:';
const ENEMY_KEY = 'enemy:';

const GROUP_OF_RANK: Readonly<Record<Exclude<PersonDef['rank'], 'civilian'>, VersusGroup>> = {
  kage: 'Kage',
  jonin: 'Jōnin',
  chunin: 'Chūnin',
  genin: 'Genin',
};

export interface VersusFighter {
  /** `person:<id>` or `enemy:<id>`. */
  readonly id: string;
  readonly name: string;
  /** Their title or kind, e.g. "Jōnin" or "Rogue ninja". */
  readonly title: string;
  readonly group: VersusGroup;
  /** Their fighting power as a grade, E–S. */
  readonly grade: StatGrade;
  readonly power: number;
}

/** Someone who can fight in versus, by roster id. */
export type Contender =
  | { readonly kind: 'person'; readonly def: PersonDef }
  | { readonly kind: 'enemy'; readonly def: EnemyDef };

function entry(base: Omit<VersusFighter, 'grade' | 'power'>, stats: Stats): VersusFighter {
  const power = fightingPower(stats);
  return { ...base, power, grade: statTier(power).grade };
}

function personEntry(person: PersonDef): VersusFighter | null {
  if (person.rank === 'civilian') return null;
  const name = [person.name, person.familyName].filter(Boolean).join(' ');
  const base = { id: `${PERSON_KEY}${person.id}`, name, title: person.title };
  return entry({ ...base, group: GROUP_OF_RANK[person.rank] }, person.stats);
}

function enemyEntry(def: EnemyDef): VersusFighter {
  const base = {
    id: `${ENEMY_KEY}${def.id}`,
    name: def.name,
    title: def.kind,
    group: 'Foes' as const,
  };
  return entry(base, enemyStatLine(def));
}

/** Everyone who can fight, by group, strongest first within each. */
export function versusRoster(ctx: GameContext): VersusFighter[] {
  // Generated senseis are a pool a save draws from, not the world's cast: they stay out.
  const cast = ctx.content.people.all.filter((p) => !p.sensei?.pooled);
  const people = cast.flatMap((p) => personEntry(p) ?? []);
  const foes = ctx.content.enemies.all.map(enemyEntry);
  return [...people, ...foes].sort(
    (a, b) => VERSUS_GROUPS.indexOf(a.group) - VERSUS_GROUPS.indexOf(b.group) || b.power - a.power,
  );
}

/** The person or foe behind a roster id, or null for one the pack doesn't have. */
export function contenderOf(ctx: GameContext, id: string): Contender | null {
  if (id.startsWith(PERSON_KEY)) {
    const def = ctx.content.people.get(id.slice(PERSON_KEY.length));
    return def && def.rank !== 'civilian' ? { kind: 'person', def } : null;
  }
  if (id.startsWith(ENEMY_KEY)) {
    const def = ctx.content.enemies.get(id.slice(ENEMY_KEY.length));
    return def ? { kind: 'enemy', def } : null;
  }
  return null;
}
