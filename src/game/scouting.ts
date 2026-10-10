import type { CombatTrait } from '@/systems/combat';
import { fightingPower, STAT_INFO, type StatId, type Stats } from '@/systems/stats';
import type { Discipline } from '@/systems/techniques';
import { createStats } from '@/systems/stats';

import type { GameContext } from './context';
import { combatStats } from './gear';
import { companionStats, companionTraits, PERSON_PREFIX } from './people/companions';
import { findPerson } from './people/cast';
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

export interface ScoutingRead {
  readonly threat: Threat;
  readonly threatLabel: string;
  /** How they fight beyond numbers, and how to beat it. */
  readonly traits: readonly TraitNote[];
  /** "Brawler · wants you close". */
  readonly style: string;
  /** Their standout stats beside yours; empty unless your eyes are sharp enough. */
  readonly details: readonly StatCompare[];
}

const ARTS: readonly Discipline[] = ['taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu'];

const ART_STYLE: Readonly<Record<Discipline, string>> = {
  taijutsu: 'Brawler · wants you close',
  kenjutsu: 'Blade fighter · close to mid range',
  ninjutsu: 'Jutsu user · keeps their distance',
  genjutsu: 'Illusionist · dangerous at any range',
  fuuinjutsu: 'Seal user · close to mid range',
};

const BODY_STYLE: Readonly<Partial<Record<StatId, string>>> = {
  strength: 'Hits hard · wants you close',
  speed: 'Quick and slippery · wants you close',
  stamina: 'Tough to put down · wants you close',
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

export function scout(
  theirs: Stats,
  yours: Stats,
  sharp: boolean,
  traits: readonly CombatTrait[] = [],
): ScoutingRead {
  const threat = threatOf(fightingPower(theirs) / Math.max(1, fightingPower(yours)));
  return {
    threat,
    threatLabel: THREAT_LABEL[threat],
    traits: traitNotes(traits),
    style: styleOf(theirs),
    details: sharp ? standouts(theirs, yours) : [],
  };
}

/** Sharp eyes: enough perception, or a bloodline that sees chakra. */
export function hasSharpEyes(state: GameState, ctx: GameContext): boolean {
  const bloodline = ctx.content.clans.get(state.character.clanId)?.kekkeiGenkai;
  return state.character.stats.perception >= SHARP_EYES || (!!bloodline && !bloodline.dormant);
}

/** Stats of an enemy from the pack, by id. */
export function enemyStats(ctx: GameContext, enemyId: string): Stats | null {
  const def = ctx.content.enemies.get(enemyId);
  return def ? createStats(def.baseStat, def.statBonuses) : null;
}

interface Opponent {
  readonly stats: Stats;
  readonly traits: readonly CombatTrait[];
}

/**
 * Whoever stands behind a combatant id: a pack enemy ("bandit-thug#1") or a person you spar
 * with ("person:kaen").
 */
function opponentOf(state: GameState, ctx: GameContext, combatantId: string): Opponent | null {
  if (combatantId.startsWith(PERSON_PREFIX)) {
    const person = findPerson(state, ctx, combatantId.slice(PERSON_PREFIX.length));
    return person
      ? { stats: companionStats(person, state), traits: companionTraits(person) }
      : null;
  }
  const [base = combatantId] = combatantId.split('#');
  const stats = enemyStats(ctx, base);
  return stats ? { stats, traits: ctx.content.enemies.get(base)?.traits ?? [] } : null;
}

/** A read on each opponent in the fight, keyed by combatant id. */
export function scoutOpponents(
  state: GameState,
  ctx: GameContext,
  ids: readonly string[],
): Readonly<Record<string, ScoutingRead>> {
  const yours = combatStats(state, ctx);
  const sharp = hasSharpEyes(state, ctx);
  return Object.fromEntries(
    ids.flatMap((id) => {
      const them = opponentOf(state, ctx, id);
      return them ? [[id, scout(them.stats, yours, sharp, them.traits)]] : [];
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
