import type { PersonDef, Tone } from '@/content';
import { addPoints, stageOf } from '@/systems/bonds';

import type { GameContext } from '../context';
import { bondOf, findPerson, tastesOf } from '../people/cast';
import type { GameState } from '../state';
import { afterReplies, MEETING_REPLIES, type ReplyOption } from './lines';
import { provocationReplies } from './provocations';
import type { Rival, RivalBeat } from './state';

/**
 * What you may say to your rival in a moment, and who else hears it. Your team and your sensei
 * hear how you answer: a reply in a tone they like brings them a little closer, one they dislike
 * pushes them off, so being harsh has its fans as well as its costs.
 */

/** Bond with an onlooker who likes (or dislikes) how you answered. */
const ONLOOKER_SWING = 2;
/** You know where it hurts once you know them: an acquaintance or closer. */
const KNOWS_THEM_STAGE = 1;

export function repliesFor(
  state: GameState,
  rival: Rival,
  beat: RivalBeat,
): readonly ReplyOption[] {
  switch (beat.kind) {
    case 'meeting':
      return MEETING_REPLIES;
    case 'after-spar':
      return afterReplies('spar', beat.won);
    case 'after-race':
      return afterReplies('race', beat.won);
    case 'provocation':
      return provocationReplies(
        rival,
        stageOf(bondOf(state, rival.personId).points) >= KNOWS_THEM_STAGE,
      );
  }
}

function onlookers(state: GameState, ctx: GameContext): PersonDef[] {
  const team = state.people.team;
  if (!team) return [];
  const ids = [...team.teammateIds, ...(team.senseiId ? [team.senseiId] : [])];
  return ids.flatMap((id) => findPerson(state, ctx, id) ?? []);
}

function leaning(person: PersonDef, ctx: GameContext, tone: Tone): 1 | -1 | 0 {
  const tastes = tastesOf(person, ctx);
  if (tastes.some((t) => t.dislikes.includes(tone))) return -1;
  return tastes.some((t) => t.likes.includes(tone)) ? 1 : 0;
}

export interface Hearers {
  readonly likes: readonly string[];
  readonly dislikes: readonly string[];
}

/** Who would like this answer, and who wouldn't. */
export function whoHears(state: GameState, ctx: GameContext, tone: Tone): Hearers {
  const people = onlookers(state, ctx);
  return {
    likes: people.filter((p) => leaning(p, ctx, tone) > 0).map((p) => p.name),
    dislikes: people.filter((p) => leaning(p, ctx, tone) < 0).map((p) => p.name),
  };
}

/** Word of how you answered reaches your team and sensei, and the bonds move by their tastes. */
export function heard(state: GameState, ctx: GameContext, tone: Tone): GameState {
  const bonds = { ...state.people.bonds };
  for (const person of onlookers(state, ctx)) {
    const lean = leaning(person, ctx, tone);
    if (lean !== 0) bonds[person.id] = addPoints(bondOf(state, person.id), lean * ONLOOKER_SWING);
  }
  return { ...state, people: { ...state.people, bonds } };
}
