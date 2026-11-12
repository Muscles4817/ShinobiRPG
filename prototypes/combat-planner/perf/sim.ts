import { asRound } from '@/systems/combat/engines/plan/intent';
import { fromSlot } from '@/systems/combat/engines/plan/slots';
import type { CardId, Loadout, PlanState } from '@/systems/combat/engines/plan/state';

import { value } from '../beam';
import { actionsOf, forcedFor, playExchange } from '../forward';

/**
 * The real-engine forward model with the bookkeeping the perf approaches share: it plays a
 * sequence of forced cards (then the fighter's own default plan) exactly as `forward.rollout`
 * does, seed for seed, so every score here equals the prototype's score for the same sequence
 * and seed. It counts every real exchange it plays.
 *
 * With `share` on, the state after each prefix is kept per seed, so the first exchange of every
 * child of a sequence is played once, not once per child (exact: same state, same seed, same
 * result). With it off, every score replays its sequence from the start, as `beam.ts` does.
 */

export interface SimOptions {
  /** Keep prefix states per seed (exact). */
  readonly share: boolean;
  /** First seed of the stream (the planner's 1, the reference's own). */
  readonly seedBase: number;
  /** How much the planner minds its own hurt. */
  readonly ownHurt: number;
}

/**
 * Play every exchange on a state whose story log is emptied first (`lean`): the log is only
 * read by narration (`fresh.ts` remembers recent lines), so this is exact only if the silent
 * check (`silent/silent.test.ts`) says outcomes are identical.
 */
export const simFlags = { lean: false };

/** The seed of a rollout's `step`th exchange, as `forward.rollout` draws it. */
const exchangeSeed = (seed: number, step: number) => seed * 7919 + step;

export class Sim {
  exchanges = 0;
  readonly own: Loadout;
  readonly actions: readonly CardId[];
  readonly first: readonly CardId[];
  private readonly prefixes = new Map<string, PlanState[]>();

  constructor(
    readonly start: PlanState,
    readonly selfId: string,
    readonly opts: SimOptions,
  ) {
    const self = start.fighters.find((f) => f.id === selfId)!;
    this.own = self.loadout;
    this.actions = actionsOf(self);
    const now = asRound(start);
    this.first = this.actions.filter((id) => fromSlot(self, now, { card: id }) !== null);
  }

  seed(i: number): number {
    return this.opts.seedBase + i;
  }

  play(state: PlanState, card: CardId | null, seedIndex: number, step: number): PlanState {
    if (state.result) return state;
    this.exchanges++;
    const set =
      card === null
        ? forcedFor(state, this.selfId, null, this.start)
        : forcedFor(state, this.selfId, card);
    return playExchange(
      simFlags.lean ? { ...set, log: [] } : set,
      exchangeSeed(this.seed(seedIndex), step),
    );
  }

  /** The state after a sequence of forced cards, on one seed. */
  prefix(sequence: readonly CardId[], seedIndex: number): PlanState {
    if (sequence.length === 0) return this.start;
    if (!this.opts.share) {
      let s = this.start;
      sequence.forEach((c, k) => (s = this.play(s, c, seedIndex, k)));
      return s;
    }
    const key = sequence.join('|');
    let states = this.prefixes.get(key);
    if (!states) this.prefixes.set(key, (states = []));
    const kept = states[seedIndex];
    if (kept) return kept;
    const parent = this.prefix(sequence.slice(0, -1), seedIndex);
    const s = this.play(parent, sequence[sequence.length - 1]!, seedIndex, sequence.length - 1);
    states[seedIndex] = s;
    return s;
  }

  /** The end state of a sequence then the default plan to `horizon` exchanges, on one seed. */
  leaf(sequence: readonly CardId[], horizon: number, seedIndex: number): PlanState {
    // A sequence as long as the horizon is never a prefix of anything scored: don't keep it.
    const last = sequence.length === horizon && sequence.length > 0;
    let s = last
      ? this.play(
          this.prefix(sequence.slice(0, -1), seedIndex),
          sequence[sequence.length - 1]!,
          seedIndex,
          sequence.length - 1,
        )
      : this.prefix(sequence, seedIndex);
    for (let k = sequence.length; k < horizon && !s.result; k++)
      s = this.play(s, null, seedIndex, k);
    return s;
  }

  leafValue(sequence: readonly CardId[], horizon: number, seedIndex: number): number {
    return value(this.start, this.leaf(sequence, horizon, seedIndex), this.opts.ownHurt);
  }

  /** Mean value over seeds `from` (inclusive) to `to` (exclusive). */
  score(sequence: readonly CardId[], horizon: number, rollouts: number, from = 0): number {
    let total = 0;
    for (let i = from; i < rollouts; i++) total += this.leafValue(sequence, horizon, i);
    return total / Math.max(1, rollouts - from);
  }
}
