import { reactionTo } from '@/systems/bonds';
import {
  applyOutcome,
  type DecisionOption,
  type Effect,
  type MissionDef,
  type MissionNote,
  type MissionRun,
} from '@/systems/missions';

import type { GameContext } from '../context';
import { log } from '../ops';
import { tastesOf } from '../people/cast';
import type { GameState } from '../state';
import { bondWithOne, crewPeople, feel } from './personal';
import { voiceOf } from './voices';

/**
 * Making a decision on a job: what you chose and what came of it go in the story, the people
 * along take it by their tastes for its tone (bond, and a word from whoever felt it most), the
 * charge's trust moves the same way, and the outcome does what it does.
 */

/** A decision moves bond by this share of what the tone would in conversation. */
export const DECISION_BOND_SHARE = 0.5;

interface Reaction {
  readonly state: GameState;
  readonly voice: MissionNote | null;
}

/** The crew's bonds moved by the tone, and a word from whoever felt it most. */
function crewTakesIt(state: GameState, ctx: GameContext, tone: string): Reaction {
  const felt = crewPeople(state, ctx).map((person) => ({
    person,
    delta: reactionTo(tastesOf(person, ctx), tone),
  }));
  const moved = felt.reduce(
    (s, f) => bondWithOne(s, f.person.id, Math.round(f.delta * DECISION_BOND_SHARE)),
    state,
  );
  const strongest = [...felt]
    .filter((f) => f.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0];
  const voice = strongest
    ? voiceOf(state, ctx, strongest.person, strongest.delta > 0 ? 'approve' : 'disapprove')
    : null;
  return { state: moved, voice };
}

/** The charge warms to a tone they like and cools at one they don't. */
function chargeEffects(def: MissionDef, tone: string | undefined): Effect[] {
  if (!def.charge || !tone) return [];
  const delta = reactionTo([def.charge], tone);
  if (delta === 0) return [];
  return [{ kind: 'thread', thread: def.charge.thread, by: delta > 0 ? 1 : -1 }];
}

/** The option taken: the run updated (not yet moved on) and everything it did applied. */
export function decide(
  state: GameState,
  ctx: GameContext,
  def: MissionDef,
  option: DecisionOption,
): GameState {
  const run = state.mission;
  if (!run) return state;
  const reacted = option.tone ? crewTakesIt(state, ctx, option.tone) : { state, voice: null };
  const effects = [...(option.effects ?? []), ...chargeEffects(def, option.tone)];
  const applied = applyOutcome(run, def, { ...option, effects });
  const notes: MissionNote[] = [
    { kind: 'choice', text: option.label },
    { kind: 'story', text: option.reply },
    ...(reacted.voice ? [reacted.voice] : []),
  ];
  const told: MissionRun = { ...applied.run, notes: [...applied.run.notes, ...notes] };
  const felt = feel({ ...reacted.state, mission: told }, applied.personal);
  return felt.chips.length > 0
    ? log(felt.state, { text: option.reply, tone: 'info', chips: felt.chips })
    : felt.state;
}
