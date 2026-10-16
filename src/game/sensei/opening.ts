import type {
  PersonDef,
  SenseiPhilosophy,
  SenseiTestDef,
  SenseiTestOption,
  TestApproach,
} from '@/content';

import type { GameContext } from '../context';
import { findPerson } from '../people/cast';
import type { GameState, SharedMemory } from '../state';
import { mentorOf } from './plan';
import { withRegard, type Mentor } from './state';
import { waysOf } from './generate';

/**
 * The first meeting with your sensei, after the chakra paper: their test (bells, a night in
 * the woods, a spar, an interview, or none), round by round, then whether you want them to
 * show you everything (the curriculum) or tell them you paid attention at the academy. The
 * test never fails you: how the ways you chose sit with their philosophy sets how they first
 * rate you, and the day becomes a memory the team shares.
 */

/** The way of going at things each philosophy rates. */
export const PREFERRED_APPROACH: Readonly<Record<SenseiPhilosophy, TestApproach>> = {
  body: 'alone',
  teamwork: 'together',
  fundamentals: 'patient',
  edge: 'alone',
  survival: 'cunning',
  control: 'patient',
  shadow: 'cunning',
};
/** Regard for going at it their way. */
export const PREFERRED_REGARD = 6;
/** Every sensei likes a team player a little. */
export const TOGETHER_REGARD = 2;
/** A teamwork sensei who watches you go it alone. */
export const ALONE_PENALTY = 4;

export const SHOW_ME = 'Show me everything';
export const KNOW_IT = 'I paid attention at the academy';
const SHOWN = '{sensei} nods. “Then we start from the beginning. I’ll show you as we go.”';
const SKIPPED = '{sensei} raises an eyebrow. “We’ll see. Ask if you get lost.”';

export function testOf(ctx: GameContext, sensei: PersonDef): SenseiTestDef | null {
  const test = waysOf(sensei)?.test;
  return test && test !== 'none' ? (ctx.content.senseiTests.get(test) ?? null) : null;
}

/** Fills `{sensei}`, `{mate}` and `{mate2}`. */
export function fillTest(
  state: GameState,
  ctx: GameContext,
  sensei: PersonDef,
  text: string,
): string {
  const mates = (state.people.team?.teammateIds ?? []).map(
    (id) => findPerson(state, ctx, id)?.name ?? 'your teammate',
  );
  return text
    .replaceAll('{sensei}', sensei.name)
    .replaceAll('{mate}', mates[0] ?? 'your teammate')
    .replaceAll('{mate2}', mates[1] ?? mates[0] ?? 'your teammate');
}

export function approachRegard(philosophy: SenseiPhilosophy, approach: TestApproach): number {
  if (approach === PREFERRED_APPROACH[philosophy]) return PREFERRED_REGARD;
  if (approach === 'together') return TOGETHER_REGARD;
  return philosophy === 'teamwork' && approach === 'alone' ? -ALONE_PENALTY : 0;
}

function remembered(state: GameState, ctx: GameContext, sensei: PersonDef): GameState {
  const test = testOf(ctx, sensei);
  const text = test?.memory ?? 'our first day as a team';
  const ids = [sensei.id, ...(state.people.team?.teammateIds ?? [])];
  const memories: SharedMemory[] = ids.map((personId) => ({ personId, text, day: state.time.day }));
  return {
    ...state,
    village: { ...state.village, memories: [...state.village.memories, ...memories] },
  };
}

function testRound(
  state: GameState,
  ctx: GameContext,
  sensei: PersonDef,
  option: SenseiTestOption,
): GameState {
  const opening = state.mentor.opening;
  if (!opening) return state;
  const philosophy = waysOf(sensei)?.philosophy ?? 'fundamentals';
  const mentor: Mentor = withRegard(
    {
      ...state.mentor,
      opening: {
        round: opening.round + 1,
        lastResult: fillTest(state, ctx, sensei, option.result),
      },
    },
    approachRegard(philosophy, option.approach),
  );
  return { ...state, mentor };
}

/** The last word of the first meeting: whether they show you everything. */
function closeMeeting(state: GameState, ctx: GameContext, sensei: PersonDef, showMe: boolean) {
  const mentor: Mentor = {
    ...state.mentor,
    opening: null,
    curriculum: showMe ? 'on' : 'skipped',
  };
  const said = fillTest(state, ctx, sensei, showMe ? SHOWN : SKIPPED);
  return { state: remembered({ ...state, mentor }, ctx, sensei), said };
}

export interface Answered {
  readonly state: GameState;
  /** What came of it, to log. */
  readonly said: string | null;
  readonly closed: boolean;
}

/** Answers the current round of the first meeting with option `index`. */
export function answerOpening(state: GameState, ctx: GameContext, index: number): Answered {
  const sensei = mentorOf(state, ctx);
  const opening = state.mentor.opening;
  if (!sensei || !opening) return { state, said: null, closed: false };
  const rounds = testOf(ctx, sensei)?.rounds ?? [];
  const round = rounds[opening.round];
  const option = round?.options[index];
  if (option) return { state: testRound(state, ctx, sensei, option), said: null, closed: false };
  const closed = closeMeeting(state, ctx, sensei, index === 0);
  return { ...closed, closed: true };
}
