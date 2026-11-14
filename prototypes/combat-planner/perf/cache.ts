import type { CardId, PlanFighter, PlanState } from '@/systems/combat/engines/plan/state';

import { value } from '../beam';
import { beamSearch, type Decision, type Planner } from './planners';
import { Sim } from './sim';

/**
 * Cached and precomputed outcome estimates, two ways:
 *  - **Within a decision** (`MemoSim`): a leaf exchange (the last card of a sequence, or the
 *    default plan's exchange after it) is memoised by the *abstract* state it starts from, the
 *    card and the seed. Two prefixes that leave the fight abstractly the same share the leaf's
 *    outcome (its health changes and result), even if they differ in detail.
 *  - **Across decisions** (`tablePlanner`): a decision is memoised by the abstract state it is
 *    taken in. The table can be filled offline (from planner runs on bench fights) and online (as
 *    a fight goes); a miss falls back to the real-engine planner and fills the table.
 */

export type Grain = 'fine' | 'coarse';

const bucket = (x: number, size: number) => Math.round(x / size);

function fighterKey(f: PlanFighter, grain: Grain): string {
  const health = grain === 'fine' ? Math.round(f.health) : bucket(f.health, 10);
  const chakra =
    grain === 'fine'
      ? Math.round(f.chakra)
      : bucket((f.chakra / Math.max(1, f.maxChakra)) * 100, 20);
  const breath =
    f.breath === undefined ? '-' : grain === 'fine' ? Math.round(f.breath) : bucket(f.breath, 10);
  return [
    f.id,
    f.name,
    health,
    chakra,
    breath,
    f.stunned > 0 ? 's' : '',
    f.openUntil !== undefined ? 'o' : '',
    f.sealed > 0 ? 'x' : '',
    f.hidden ? 'h' : '',
    f.gathering ? 'g' : '',
    f.committed ? `c${JSON.stringify(f.committed)}` : '',
    f.health > 0 ? '' : 'down',
    (f.pinned ?? 0) > 0 ? 'p' : '',
    f.confused > 0 ? 'f' : '',
    grain === 'fine'
      ? JSON.stringify([f.afflictions ?? '', f.concealment ?? '', f.exposure ?? ''])
      : '',
  ].join(',');
}

/** The abstract state: distance, each fighter's buckets and conditions, the foes' telegraphs. */
export function abstractKey(s: PlanState, grain: Grain): string {
  return [
    s.range,
    JSON.stringify(s.distances ?? ''),
    s.fighters.map((f) => fighterKey(f, grain)).join(';'),
    JSON.stringify(s.intents),
  ].join('|');
}

export interface MemoStats {
  hits: number;
  lookups: number;
}

interface Delta {
  readonly health: Readonly<Record<string, number>>;
  readonly result: PlanState['result'];
}

/** A `Sim` whose leaf exchanges are memoised by abstract state (approximate unless `fine`). */
export class MemoSim extends Sim {
  private readonly memo = new Map<string, Delta>();

  constructor(
    start: PlanState,
    selfId: string,
    private readonly grain: Grain,
    readonly stats: MemoStats,
  ) {
    super(start, selfId, { share: true, seedBase: 1, ownHurt: 1 });
  }

  override leafValue(sequence: readonly CardId[], horizon: number, seedIndex: number): number {
    if (horizon !== 2) return super.leafValue(sequence, horizon, seedIndex);
    const parent = this.prefix(sequence.slice(0, 1), seedIndex);
    if (parent.result) return value(this.start, parent, 1);
    const card = sequence[1] ?? null;
    const key = `${abstractKey(parent, this.grain)}#${card ?? 'default'}#${seedIndex}`;
    this.stats.lookups++;
    let delta = this.memo.get(key);
    if (delta) this.stats.hits++;
    else {
      const end = this.play(parent, card, seedIndex, 1);
      delta = {
        health: Object.fromEntries(
          end.fighters.map((f) => [
            f.id,
            f.health - (parent.fighters.find((p) => p.id === f.id)?.health ?? f.health),
          ]),
        ),
        result: end.result,
      };
      this.memo.set(key, delta);
    }
    const applied: PlanState = {
      ...parent,
      result: delta.result,
      fighters: parent.fighters.map((f) => ({
        ...f,
        health: f.health + (delta.health[f.id] ?? 0),
      })),
    };
    return value(this.start, applied, 1);
  }
}

/** The beam (depth 2) on a memoised `Sim`. */
export const memoPlanner =
  (
    o: { readonly width: number; readonly rollouts: number; readonly grain: Grain },
    stats: MemoStats,
  ): Planner =>
  (start, selfId) => {
    const began = performance.now();
    const s = new MemoSim(start, selfId, o.grain, stats);
    const best = beamSearch(s, { depth: 2, width: o.width, rollouts: o.rollouts })[0]!;
    return {
      first: best.sequence[0]!,
      value: best.value,
      exchanges: s.exchanges,
      evals: 0,
      ms: performance.now() - began,
      sequence: best.sequence,
    };
  };

/** A decision table by abstract state, falling back to (and filled by) a planner. */
export class DecisionTable {
  readonly table = new Map<string, Decision>();
  hits = 0;
  lookups = 0;

  constructor(
    private readonly grain: Grain,
    private readonly fallback: Planner,
  ) {}

  key(s: PlanState, selfId: string): string {
    return `${selfId}|${abstractKey(s, this.grain)}`;
  }

  /** Fills the table from a decision (offline training). */
  learn(s: PlanState, selfId: string): void {
    const k = this.key(s, selfId);
    if (!this.table.has(k)) this.table.set(k, this.fallback(s, selfId));
  }

  readonly planner: Planner = (start, selfId) => {
    const began = performance.now();
    const k = this.key(start, selfId);
    this.lookups++;
    const kept = this.table.get(k);
    if (kept) {
      this.hits++;
      return { ...kept, exchanges: 0, ms: performance.now() - began, note: 'hit' };
    }
    const d = this.fallback(start, selfId);
    this.table.set(k, d);
    return { ...d, note: 'miss' };
  };
}
