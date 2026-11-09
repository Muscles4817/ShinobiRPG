import { listed } from '@/core';
import type { CombatTrait } from '@/systems/combat';
import type { EnemyDef } from '@/content';
import { stageFoes, type MissionDef } from '@/systems/missions';
import {
  fightingPower,
  partyPower,
  STAT_IDS,
  STAT_INFO,
  type StatId,
  type Stats,
} from '@/systems/stats';
import type { Discipline } from '@/systems/techniques';

import { enemyStatLine } from './combatants';
import type { GameContext } from './context';
import { combatStats } from './gear';
import { hungerEffect } from './hunger';
import { injuryFightEffect } from './injuries';
import { companionTraits, PERSON_PREFIX } from './people/companions';
import { personStats } from './people/progress';
import { findPerson } from './people/cast';
import { poolsSeen, retinueSeen, summonsSeen, type RetinueKnowledge } from './retinueSight';
import { carriedNotes } from './scoutingCarried';
import { changedNotes, changeSeen } from './scoutingChanged';
import { poolNotes, type PoolNote } from './scoutingPools';
import type { GameState } from './state';

/**
 * Sizing up an opponent: how they compare with you, how they like to fight, and (with sharp
 * eyes) where exactly they outclass you. Reads come from the same stats the fight uses.
 */

/** Perception at which you can read an opponent's strengths, not just their manner. */
export const SHARP_EYES = 9;
/** How many of their standout stats a sharp-eyed read lists. */
const DETAILS_SHOWN = 3;

export type Threat = 'much-weaker' | 'weaker' | 'even' | 'stronger' | 'much-stronger';

const THREAT_LABEL: Readonly<Record<Threat, string>> = {
  'much-weaker': 'Well beneath you',
  weaker: 'Weaker than you',
  even: 'Evenly matched',
  stronger: 'Stronger than you',
  'much-stronger': 'Far stronger than you',
};

export interface StatCompare {
  readonly label: string;
  readonly theirs: number;
  readonly yours: number;
}

/** One of their traits, named, with how to deal with it. */
export interface TraitNote {
  readonly trait: CombatTrait;
  readonly label: string;
  readonly counter: string;
}

const TRAIT_NOTES: Readonly<Record<CombatTrait, Omit<TraitNote, 'trait'>>> = {
  archer: { label: 'Archer', counter: 'Only attacks from afar. Get close.' },
  brawler: { label: 'Brawler', counter: 'Only fights up close. Keep your distance.' },
  illusionist: {
    label: 'Illusionist',
    counter: 'Hides and confuses. Search (perception) or Dispel (chakra, willpower).',
  },
  armoured: { label: 'Armoured', counter: 'Blunts blows and blades. Use jutsu or seals.' },
  swift: { label: 'Swift', counter: 'Slips many attacks. Daze or out-last them.' },
  pack: { label: 'Pack', counter: 'Stronger together. Thin the pack first.' },
  coward: { label: 'Coward', counter: 'Runs when hurt. Finish fast or let them go.' },
  spirit: { label: 'Spirit', counter: 'Plain blows barely touch it. Use chakra or seals.' },
};

export function traitNotes(traits: readonly CombatTrait[]): TraitNote[] {
  return traits.map((trait) => ({ trait, ...TRAIT_NOTES[trait] }));
}

/** A body you can tell fights beside them (`EnemyDef.retinue`), and how to deal with the pair. */
export interface CompanionNote {
  readonly name: string;
  readonly counter: string;
}

const COMPANION_COUNTER =
  'Fights beside them: two bodies to beat, not one. Bring the weaker down first, or outlast both.';
const SUMMON_COUNTER =
  'They can call it into the fight. It goes home when they fall or run dry of chakra.';

export interface ScoutingRead {
  /** How they compare with you, counting every body you can tell fights beside them. */
  readonly threat: Threat;
  readonly threatLabel: string;
  /** How they fight beyond numbers, and how to beat it. */
  readonly traits: readonly TraitNote[];
  /** What you can tell fights beside them. */
  readonly companions: readonly CompanionNote[];
  /** A hive or dust you can tell they carry, and what undoes it. */
  readonly pools: readonly PoolNote[];
  /** "Brawler, wants you close". */
  readonly style: string;
  /** Their standout stats beside yours; empty unless your eyes are sharp enough. */
  readonly details: readonly StatCompare[];
  /** Why the read is worse than your stats alone make it (hunger, injuries), or null. */
  readonly handicap: string | null;
  /** Whether they usually act before you in an exchange (speed decides who goes first). */
  readonly pace: Pace;
}

/** Faster: likely to act before you; slower: likely after; even: it could go either way. */
export type Pace = 'faster' | 'even' | 'slower';

/**
 * How far speeds must differ before one side usually acts first. Initiative is speed plus a
 * small roll each exchange (`engines/plan/round.ts`), so a closer gap is a coin toss.
 */
const PACE_MARGIN = 2;

function paceOf(theirs: Stats, yours: Stats): Pace {
  const gap = theirs.speed - yours.speed;
  if (gap >= PACE_MARGIN) return 'faster';
  return gap <= -PACE_MARGIN ? 'slower' : 'even';
}

const ARTS: readonly Discipline[] = ['taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu'];

const ART_STYLE: Readonly<Record<Discipline, string>> = {
  taijutsu: 'Brawler, wants you close',
  kenjutsu: 'Blade fighter, close to mid range',
  ninjutsu: 'Jutsu user, keeps their distance',
  genjutsu: 'Illusionist, dangerous at any range',
  fuuinjutsu: 'Seal user, close to mid range',
};

const BODY_STYLE: Readonly<Partial<Record<StatId, string>>> = {
  strength: 'Hits hard, wants you close',
  speed: 'Quick and slippery, wants you close',
  stamina: 'Tough to put down, wants you close',
};

/** Power ratios (theirs ÷ yours) where each read starts; within ±15% is a fair fight. */
const MUCH_WEAKER = 0.7;
const WEAKER = 0.87;
const EVEN = 1.15;
const STRONGER = 1.4;

function threatOf(ratio: number): Threat {
  if (ratio < MUCH_WEAKER) return 'much-weaker';
  if (ratio < WEAKER) return 'weaker';
  if (ratio <= EVEN) return 'even';
  if (ratio <= STRONGER) return 'stronger';
  return 'much-stronger';
}

/** What their stats say about how they fight: their best art, or raw body if that's all. */
function styleOf(stats: Stats): string {
  const art = [...ARTS].sort((a, b) => stats[b] - stats[a])[0] ?? 'taijutsu';
  const body = (['strength', 'speed', 'stamina'] as const).reduce((best, id) =>
    stats[id] > stats[best] ? id : best,
  );
  if (stats[body] > stats[art] + 1) return BODY_STYLE[body] ?? ART_STYLE.taijutsu;
  return ART_STYLE[art];
}

function standouts(theirs: Stats, yours: Stats): StatCompare[] {
  return (Object.keys(theirs) as StatId[])
    .sort((a, b) => theirs[b] - yours[b] - (theirs[a] - yours[a]))
    .slice(0, DETAILS_SHOWN)
    .map((id) => ({
      label: STAT_INFO[id].label,
      theirs: Math.round(theirs[id]),
      yours: Math.round(yours[id]),
    }));
}

/** A body fighting beside an opponent, as far as a read goes: its stats and how hard it is to fell. */
export interface Companion {
  readonly name: string;
  readonly stats: Stats;
  /** Its health as a multiple of a human's (`EnemyDef.healthScale`). */
  readonly healthScale: number;
  /** Called into the fight by them, rather than at their side from the start. */
  readonly called?: boolean;
}

/** Someone to size up: their stats, and what you can tell of their kit and companions. */
export interface Opponent {
  readonly stats: Stats;
  readonly traits?: readonly CombatTrait[];
  readonly companions?: readonly Companion[];
  readonly pools?: readonly PoolNote[];
}

/** One rating for an opponent and the companions you can tell are with them. */
export function opponentPower({ stats, companions = [] }: Opponent): number {
  // A body half as hard to fell counts for half as much.
  const beside = companions.map((c) => fightingPower(c.stats) * c.healthScale);
  return partyPower([fightingPower(stats), ...beside]);
}

export function scout(them: Opponent, yours: Stats, sharp: boolean): ScoutingRead {
  const theirs = them.stats;
  const threat = threatOf(opponentPower(them) / Math.max(1, fightingPower(yours)));
  return {
    threat,
    threatLabel: THREAT_LABEL[threat],
    traits: traitNotes(them.traits ?? []),
    companions: (them.companions ?? []).map((c) => ({
      name: c.name,
      counter: c.called ? SUMMON_COUNTER : COMPANION_COUNTER,
    })),
    pools: them.pools ?? [],
    style: styleOf(theirs),
    details: sharp ? standouts(theirs, yours) : [],
    handicap: null,
    pace: paceOf(theirs, yours),
  };
}

/**
 * What is weighing on you in a fight right now, said with the read: the read is made against
 * you as you are, so a job that looked even can look worse once hunger or a wound sets in.
 */
export function handicapOf(state: GameState, ctx: GameContext): string | null {
  const hunger = hungerEffect(state.character.vitals);
  const hurt = injuryFightEffect(state.character, ctx);
  const injured = STAT_IDS.some((id) => hurt.scale[id] < 1 || hurt.strain[id] > 0);
  const reasons = [
    ...(hunger.fightStrength < 1 ? [hunger.label.toLowerCase()] : []),
    ...(injured ? ['injured'] : []),
  ];
  return reasons.length > 0 ? `Read against you as you are now: ${listed(reasons)}.` : null;
}

/** Sharp eyes: enough perception, or a bloodline that sees chakra. */
export function hasSharpEyes(state: GameState, ctx: GameContext): boolean {
  const bloodline = ctx.content.clans.get(state.character.clanId)?.kekkeiGenkai;
  return state.character.stats.perception >= SHARP_EYES || (!!bloodline && !bloodline.dormant);
}

/**
 * Whoever stands behind a combatant id: a pack enemy ("bandit-thug#1") or a person you spar
 * with ("person:kaen").
 */
function opponentOf(
  state: GameState,
  ctx: GameContext,
  combatantId: string,
  knowledge: RetinueKnowledge,
): Opponent | null {
  if (combatantId.startsWith(PERSON_PREFIX)) {
    const person = findPerson(state, ctx, combatantId.slice(PERSON_PREFIX.length));
    return person ? { stats: personStats(person, state), traits: companionTraits(person) } : null;
  }
  const [base = combatantId] = combatantId.split('#');
  const def = ctx.content.enemies.get(base);
  return def ? enemyOpponent(state, ctx, def, knowledge) : null;
}

/** A pack enemy as a read sees them, with the companions you can tell are beside them. */
function enemyOpponent(
  state: GameState,
  ctx: GameContext,
  def: EnemyDef,
  knowledge: RetinueKnowledge,
): Opponent {
  const companions = retinueSeen(state, def, knowledge).map(({ enemyId }) => {
    const unit = ctx.content.enemies.require(enemyId);
    return { name: unit.name, stats: enemyStatLine(unit), healthScale: unit.healthScale ?? 1 };
  });
  const summons = summonsSeen(state, def, knowledge).map(({ summonId }) => {
    const summon = ctx.content.summons.require(summonId);
    const { name, stats, healthScale } = summon;
    return { name, stats, healthScale, called: true };
  });
  return {
    stats: enemyStatLine(def),
    traits: def.traits ?? [],
    companions: [...companions, ...summons],
    pools: [
      ...poolNotes(def, poolsSeen(state, def, knowledge), ctx),
      ...carriedNotes(state, ctx, def, knowledge),
      ...changedNotes(def, changeSeen(state, def, knowledge)),
    ],
  };
}

/**
 * A read on each opponent, keyed by combatant id. In a fight everything on the field is seen
 * (`full`); before one, a glance may miss what fights beside them (`retinueSight.ts`).
 */
export function scoutOpponents(
  state: GameState,
  ctx: GameContext,
  ids: readonly string[],
  knowledge: RetinueKnowledge = 'full',
): Readonly<Record<string, ScoutingRead>> {
  const yours = combatStats(state, ctx);
  const sharp = hasSharpEyes(state, ctx);
  const handicap = handicapOf(state, ctx);
  return Object.fromEntries(
    ids.flatMap((id) => {
      const them = opponentOf(state, ctx, id, knowledge);
      const read = them ? { ...scout(them, yours, sharp), handicap } : null;
      return read ? [[id, read]] : [];
    }),
  );
}

/** A read on someone you might spar with. */
export function scoutPerson(
  state: GameState,
  ctx: GameContext,
  personId: string,
): ScoutingRead | null {
  const id = `${PERSON_PREFIX}${personId}`;
  return scoutOpponents(state, ctx, [id])[id] ?? null;
}

/**
 * The toughest foe a job can throw at you, with what you can tell fights beside them, read
 * against you (no sharp eyes: a notice's read). The client's report shows every companion.
 */
export function missionThreat(
  state: GameState,
  ctx: GameContext,
  mission: MissionDef,
): ScoutingRead | null {
  const knowledge = state.board.intel.includes(mission.id) ? 'full' : 'glance';
  const foes = mission.stages
    .flatMap(stageFoes)
    .flatMap((id) => ctx.content.enemies.get(id) ?? [])
    .map((def) => enemyOpponent(state, ctx, def, knowledge));
  const toughest = foes.sort((a, b) => opponentPower(b) - opponentPower(a))[0];
  if (!toughest) return null;
  return { ...scout(toughest, combatStats(state, ctx), false), handicap: handicapOf(state, ctx) };
}
