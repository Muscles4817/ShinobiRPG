import { round1 } from '@/core';
import { studyMultiplier } from '@/systems/modifiers';
import { STAT_INFO } from '@/systems/stats';
import {
  gradeToAttempt,
  learnabilityFor,
  learnBlocker,
  sessionStudyPoints,
  steadied,
  steady,
  study,
  type LearnBlocker,
  type Learner,
  type StudySource,
  type TechniqueBook,
  type TechniqueDef,
} from '@/systems/techniques';

import type { GameContext } from './context';
import { chip, log } from './ops';
import { characterModifiers } from './profile';
import type { Character, GameState } from './state';

/**
 * Learning techniques, whatever the source (an academy scroll, a sensei): one gate (rank
 * against your grade, clan, hard needs), one study formula, and techniques that arrive
 * unstable when they were a rank above you and steady once your grade catches up.
 */

export function learnerOf(character: Character): Learner {
  return { stats: character.stats, clanId: character.clanId, nature: character.nature };
}

/** Why this character can't learn the technique from any source, or null. */
export function learnBlockerFor(state: GameState, def: TechniqueDef): LearnBlocker | null {
  return learnBlocker(state.techniques, def, learnerOf(state.character));
}

/** What the player is told, and what fixes it ("Needs C ninjutsu; you're E."). */
export function learnBlockerText(blocker: LearnBlocker, def: TechniqueDef): string {
  switch (blocker.kind) {
    case 'already-known':
      return 'You already know this technique.';
    case 'clan':
      return 'Only taught within its clan.';
    case 'rank': {
      const art = STAT_INFO[def.discipline].label.toLowerCase();
      return `Needs ${gradeToAttempt(blocker.rank)} ${art}; you're ${blocker.grade}.`;
    }
    case 'nature':
      return `Needs a ${blocker.nature} chakra nature.`;
    case 'reserves':
      return `Needs chakra reserves of ${blocker.min}; yours are ${blocker.have.toFixed(1)}.`;
    case 'control':
      return `Needs ${blocker.grade} chakra control; you're ${blocker.have}.`;
  }
}

/** Whether a technique would arrive unstable for this character (a rank above them). */
export function wouldBeUnstable(character: Character, def: TechniqueDef): boolean {
  return learnabilityFor(def, character.stats) === 'unstable';
}

/**
 * Study points one session earns: the base × aptitude in the art × chakra control × the
 * source, halved a rank above you, times identity (nature, traits, grades, meals).
 * `aptitude` is passed in so previews can use what the character has sensed of it.
 */
export function studyPointsFor(
  character: Character,
  def: TechniqueDef,
  ctx: GameContext,
  { aptitude, source }: { readonly aptitude: number; readonly source: StudySource },
): number {
  const mods = characterModifiers(character, ctx);
  const base = sessionStudyPoints(character.stats, def, { aptitude, source });
  return round1(base * studyMultiplier(mods, def.discipline, def.element));
}

export interface Studied {
  readonly book: TechniqueBook;
  readonly mastered: boolean;
  /** Mastered, but a rank above the learner: it arrives unstable. */
  readonly unstable: boolean;
  readonly percent: number;
}

/** One session of study from a source; no talent in the art means nothing sticks. */
export function studySession(
  state: GameState,
  def: TechniqueDef,
  ctx: GameContext,
  source: StudySource,
): Studied {
  const { character } = state;
  const aptitude = character.aptitude[def.discipline];
  const points = aptitude > 0 ? studyPointsFor(character, def, ctx, { aptitude, source }) : 0;
  const unstable = wouldBeUnstable(character, def);
  const result = study(state.techniques, def, points, unstable);
  return {
    book: result.book,
    mastered: result.mastered,
    unstable: result.mastered && unstable,
    percent: Math.round((result.progress / def.difficulty) * 100),
  };
}

/**
 * Steadies every unstable technique the character's grade has caught up with, with a journal
 * line each. Every action passes through it (see `dispatch`), so it follows growth from any
 * source.
 */
export function stabiliseTechniques(state: GameState, ctx: GameContext): GameState {
  if (state.techniques.unstable.length === 0) return state;
  const ids = steadied(state.techniques, state.character.stats, (id) =>
    ctx.content.techniques.get(id),
  );
  if (ids.length === 0) return state;
  const steadiedState = { ...state, techniques: steady(state.techniques, ids) };
  return ids.reduce((next, id) => {
    const name = ctx.content.techniques.get(id)?.name ?? id;
    return log(next, {
      heading: `${name} steadies`,
      text: `Your grade has caught up with ${name}. It no longer fights your chakra.`,
      tone: 'success',
      chips: [chip(`${name} stable`, 'gain')],
    });
  }, steadiedState);
}
