import type { EnemyDef, PersonDef } from '@/content';
import type { Look } from '@/systems/profile';
import { fightingPower, statTier, type StatGrade, type Stats } from '@/systems/stats';

import { enemyStatLine } from '../combatants';
import type { GameContext } from '../context';
import { personLook } from '../people/looks';

/**
 * Who can fight in versus mode: the pack's shinobi as written (genin to kage, with their
 * arsenals), its versus-only duelists among them by rank, and its foes, each read by fighting
 * power so the strongest are easy to find.
 */

/** Groups on the picker, strongest first. */
export const VERSUS_GROUPS = ['Kage', 'Jōnin', 'Chūnin', 'Genin', 'Foes'] as const;
export type VersusGroup = (typeof VERSUS_GROUPS)[number];

const PERSON_KEY = 'person:';
const ENEMY_KEY = 'enemy:';
/** The clan id every pack keeps for the clanless (validated). */
const NO_CLAN = 'none';

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
  /** A shinobi's village (where they live); null for a foe. */
  readonly village: string | null;
  /** A shinobi's clan; null for the clanless and for foes. */
  readonly clan: string | null;
  /** A foe's kind ("Bandit", "Beast"); null for a shinobi. */
  readonly kind: string | null;
  /** A shinobi's face, for the picker; null for a foe. */
  readonly look: Look | null;
}

/** Someone who can fight in versus, by roster id. */
export type Contender =
  | { readonly kind: 'person'; readonly def: PersonDef }
  | { readonly kind: 'enemy'; readonly def: EnemyDef };

function entry(base: Omit<VersusFighter, 'grade' | 'power'>, stats: Stats): VersusFighter {
  const power = fightingPower(stats);
  return { ...base, power, grade: statTier(power).grade };
}

/** Where someone lives: their home town, else the pack's start village. */
function villageOf(person: PersonDef, ctx: GameContext): string {
  const where = person.homeLocationId ?? ctx.content.startLocationId;
  return ctx.content.locations.get(where)?.name ?? where;
}

function clanOf(person: PersonDef, ctx: GameContext): string | null {
  const clan = person.clanId ? ctx.content.clans.get(person.clanId) : undefined;
  return clan && clan.id !== NO_CLAN ? clan.name : null;
}

function personEntry(person: PersonDef, ctx: GameContext): VersusFighter | null {
  if (person.rank === 'civilian') return null;
  const base = {
    id: `${PERSON_KEY}${person.id}`,
    name: fullName(person),
    title: person.title,
    group: GROUP_OF_RANK[person.rank],
    village: villageOf(person, ctx),
    clan: clanOf(person, ctx),
    kind: null,
    look: personLook(person),
  };
  return entry(base, person.stats);
}

function enemyEntry(def: EnemyDef): VersusFighter {
  const base = {
    id: `${ENEMY_KEY}${def.id}`,
    name: def.name,
    title: def.kind,
    group: 'Foes' as const,
    village: null,
    clan: null,
    kind: def.kind,
    look: null,
  };
  return entry(base, enemyStatLine(def));
}

/** A contender's stat line as written. */
export function statsOf(contender: Contender): Stats {
  return contender.kind === 'person' ? contender.def.stats : enemyStatLine(contender.def);
}

/** "Kakashi Hatake"; a person without a family name goes by their own. */
export function fullName(person: PersonDef): string {
  return [person.name, person.familyName].filter(Boolean).join(' ');
}

/** Everyone who can fight, by group, strongest first within each. */
export function versusRoster(ctx: GameContext): VersusFighter[] {
  // Generated senseis are a pool a save draws from, not the world's cast: they stay out.
  const cast = [
    ...ctx.content.people.all.filter((p) => !p.sensei?.pooled),
    ...ctx.content.duelists.all,
  ];
  const people = cast.flatMap((p) => personEntry(p, ctx) ?? []);
  const foes = ctx.content.enemies.all.map(enemyEntry);
  return [...people, ...foes].sort(
    (a, b) => VERSUS_GROUPS.indexOf(a.group) - VERSUS_GROUPS.indexOf(b.group) || b.power - a.power,
  );
}

/** The person or foe behind a roster id, or null for one the pack doesn't have. */
export function contenderOf(ctx: GameContext, id: string): Contender | null {
  if (id.startsWith(PERSON_KEY)) {
    const personId = id.slice(PERSON_KEY.length);
    const def = ctx.content.people.get(personId) ?? ctx.content.duelists.get(personId);
    return def && def.rank !== 'civilian' ? { kind: 'person', def } : null;
  }
  if (id.startsWith(ENEMY_KEY)) {
    const def = ctx.content.enemies.get(id.slice(ENEMY_KEY.length));
    return def ? { kind: 'enemy', def } : null;
  }
  return null;
}
