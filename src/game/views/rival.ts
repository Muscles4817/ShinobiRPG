import type { PersonDef } from '@/content';

import type { GameAction } from '../actions/types';
import type { GameContext } from '../context';
import { findPerson } from '../people/cast';
import { MEETING } from '../rival/lines';
import { provocationById } from '../rival/provocations';
import { repliesFor, whoHears } from '../rival/replies';
import type { Contest, Rival, RivalBeat, Score } from '../rival/state';
import type { GameState } from '../state';
import { choice, type Choice } from './common';
import { personCard, personFace, toneLabel, type PersonCard, type PersonFace } from './people';

/**
 * What the screen shows of your rival's moments: the ones that wait for your answer (with who
 * else would like each answer), and a challenge standing above the village.
 */

export interface RivalReply {
  readonly label: string;
  readonly tone: string;
  /** Who on your team would like it, and who wouldn't, in a phrase; null if nobody minds. */
  readonly heard: string | null;
  readonly action: GameAction;
}

export interface RivalSceneView {
  readonly person: PersonCard;
  readonly kicker: string;
  readonly title: string;
  readonly lines: readonly string[];
  readonly choices: readonly RivalReply[];
}

export interface RivalChallengeView {
  readonly face: PersonFace;
  readonly line: string;
  /** "A spar", "A race". */
  readonly contest: string;
  readonly score: Score;
  readonly accept: Choice;
  readonly decline: Choice;
}

export function rivalOf(
  state: GameState,
  ctx: GameContext,
): { readonly rival: Rival; readonly person: PersonDef } | null {
  const rival = state.rival;
  const person = rival && findPerson(state, ctx, rival.personId);
  return rival && person ? { rival, person } : null;
}

export const fill = (text: string, name: string): string => text.replaceAll('{name}', name);

/** "Asuka", "Asuka and Goro", "Asuka, Goro and Gōran". */
function namesTogether(names: readonly string[]): string {
  const last = names.at(-1) ?? '';
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${last}` : last;
}

function heardPhrase(likes: readonly string[], dislikes: readonly string[]): string | null {
  const parts = [
    ...(likes.length ? [`${namesTogether(likes)} would like it`] : []),
    ...(dislikes.length ? [`${namesTogether(dislikes)} wouldn’t`] : []),
  ];
  return parts.length ? `${parts.join('; ')}.` : null;
}

interface Framing {
  readonly kicker: string;
  readonly title: string;
  readonly lines: readonly string[];
}

const CONTEST_PLACE: Readonly<Record<Contest, string>> = {
  spar: 'The training ground, after the spar',
  race: 'The bell tower, after the race',
};

function framing(rival: Rival, beat: RivalBeat, name: string): Framing {
  switch (beat.kind) {
    case 'meeting':
      return {
        kicker: 'Word gets round which team you landed on',
        title: `${name} finds you`,
        lines: [
          `${name} has been watching you since the academy. Today they want you to know it.`,
          fill(MEETING[rival.shape][rival.temperament], name),
        ],
      };
    case 'provocation':
      return {
        kicker: 'Word reaches you',
        title: `${name} again`,
        lines: [fill(provocationById(beat.id)?.line ?? '{name} is at it again.', name)],
      };
    case 'after-spar':
    case 'after-race':
      return {
        kicker: CONTEST_PLACE[beat.kind === 'after-spar' ? 'spar' : 'race'],
        title: beat.won ? `You beat ${name}` : `${name} beat you`,
        lines: [
          beat.won
            ? `${name} gets their breath back slowly, and looks at you as if seeing you for the first time today.`
            : `${name} stands over you a moment longer than they need to.`,
        ],
      };
  }
}

export function rivalScene(state: GameState, ctx: GameContext): RivalSceneView | null {
  const found = rivalOf(state, ctx);
  const beat = found?.rival.beat;
  if (!found || !beat) return null;
  const { rival, person } = found;
  const meeting = beat.kind === 'meeting';
  const choices = repliesFor(state, rival, beat).map((r, choiceIndex) => {
    const hears = whoHears(state, ctx, r.tone);
    return {
      label: r.say,
      tone: toneLabel(r.tone),
      heard: meeting ? null : heardPhrase(hears.likes, hears.dislikes),
      action: { type: 'answerRival', choiceIndex } as const,
    };
  });
  return { person: personCard(state, ctx, person), ...framing(rival, beat, person.name), choices };
}

const CONTEST_NAME: Readonly<Record<Contest, string>> = { spar: 'A spar', race: 'A race' };

export function rivalChallengeView(state: GameState, ctx: GameContext): RivalChallengeView | null {
  const found = rivalOf(state, ctx);
  const challenge = found?.rival.challenge;
  if (!found || !challenge) return null;
  const { rival } = found;
  return {
    face: personFace(state, found.person),
    line: challenge.line,
    contest: CONTEST_NAME[challenge.contest],
    score: challenge.contest === 'race' ? rival.races : rival.spars,
    accept: choice(state, ctx, { type: 'acceptChallenge' }),
    decline: choice(state, ctx, { type: 'declineChallenge' }),
  };
}
