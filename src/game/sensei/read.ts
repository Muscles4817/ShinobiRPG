import type { DefenceWarning, SenseiLens } from '@/content';
import { capitalise } from '@/core';
import { STAT_IDS, STAT_INFO, type StatId, type Stats } from '@/systems/stats';

import type { GameContext } from '../context';
import { findPerson } from '../people/cast';
import { personStats } from '../people/progress';
import type { Character, GameState } from '../state';
import { bestArt } from './state';

/**
 * What your sensei sees when they look at you, in words (never numbers): the hole in your
 * defence that will get you killed, what beat you last, what you are good at, and the stat
 * their lens says you should work on next. The layers of defence are the fight's own
 * (`rules/defence.ts`): evasion from speed and perception, guard and counter from taijutsu and
 * strength, will against illusions, and toughness from stamina.
 */

export const DEFENCE_LAYERS = ['evasion', 'guard', 'will', 'toughness'] as const;
export type DefenceLayer = (typeof DEFENCE_LAYERS)[number] & DefenceWarning;

export const LAYER_STATS: Readonly<Record<DefenceLayer, readonly StatId[]>> = {
  evasion: ['speed', 'perception'],
  guard: ['taijutsu', 'strength'],
  will: ['willpower'],
  toughness: ['stamina'],
};

/** Stats a team leans on beyond fighting: who reads the trail, mends, plans and keeps up. */
const TEAM_STATS: readonly StatId[] = [
  'perception',
  'chakraControl',
  'intellect',
  'speed',
  'willpower',
];

/** The body and mind stats a sensei shores up (reserves grow with stamina, not drills). */
const FOUNDATION: readonly StatId[] = STAT_IDS.filter(
  (id) => STAT_INFO[id].group !== 'discipline' && id !== 'reserves',
);

function mean(stats: Stats, ids: readonly StatId[]): number {
  return ids.reduce((sum, id) => sum + stats[id], 0) / Math.max(1, ids.length);
}

/** A stat you know you will never grow: no sensei sets work in it. */
function hopeless(character: Character, stat: StatId): boolean {
  return character.aptitudeKnown[stat] !== 'unknown' && character.aptitude[stat] <= 0;
}

function lowest(character: Character, ids: readonly StatId[]): StatId | null {
  return ids
    .filter((id) => !hopeless(character, id))
    .reduce<StatId | null>(
      (low, id) => (low && character.stats[low] <= character.stats[id] ? low : id),
      null,
    );
}

/** The layer of your defence that is thinnest. */
export function weakestLayer(stats: Stats): DefenceLayer {
  return DEFENCE_LAYERS.reduce((low, layer) =>
    mean(stats, LAYER_STATS[layer]) < mean(stats, LAYER_STATS[low]) ? layer : low,
  );
}

/** The team stat nobody on your team is good at, so the work falls to you. */
function teamGap(state: GameState, ctx: GameContext): StatId | null {
  const mates = (state.people.team?.teammateIds ?? []).flatMap(
    (id) => findPerson(state, ctx, id) ?? [],
  );
  const best = (id: StatId) =>
    Math.max(state.character.stats[id], ...mates.map((p) => personStats(p, state)[id]));
  const open = TEAM_STATS.filter((id) => !hopeless(state.character, id));
  return open.reduce<StatId | null>((gap, id) => (gap && best(gap) <= best(id) ? gap : id), null);
}

/** Your strongest talent you haven't made anything of: high aptitude, read or not, low value. */
export function untappedTalent(character: Character): StatId | null {
  const best = bestArt(character.stats);
  return STAT_IDS.filter((id) => id !== best && id !== 'reserves')
    .filter((id) => character.aptitude[id] > 1)
    .reduce<StatId | null>(
      (top, id) => (top && character.aptitude[top] >= character.aptitude[id] ? top : id),
      null,
    );
}

/** The stat a sensei's lens says you should work on. */
export function lensStat(state: GameState, ctx: GameContext, lens: SenseiLens): StatId {
  const { character } = state;
  const fallback = bestArt(character.stats);
  switch (lens) {
    case 'weakest-stat':
      return lowest(character, FOUNDATION) ?? fallback;
    case 'weakest-defence':
      return lowest(character, LAYER_STATS[weakestLayer(character.stats)]) ?? fallback;
    case 'specialty':
      return fallback;
    case 'team-gap':
      return teamGap(state, ctx) ?? fallback;
    case 'hidden-talent':
      return untappedTalent(character) ?? fallback;
  }
}

export interface SenseiRead {
  /** The thinnest layer of your defence: what will get you killed. */
  readonly layer: DefenceLayer;
  /** The same, as they'd say it on its own. */
  readonly danger: string;
  /** What beat you since the last lesson, and what would have helped. */
  readonly beaten: string | null;
  /** What you are good at: your best art. */
  readonly edge: StatId;
}

export function senseiRead(state: GameState, ctx: GameContext): SenseiRead {
  const { stats } = state.character;
  const layer = weakestLayer(stats);
  return {
    layer,
    danger: `${capitalise(ctx.content.senseiSpeech.coaching.dangers[layer])}.`,
    beaten: state.mentor.lastBeaten,
    edge: bestArt(stats),
  };
}
