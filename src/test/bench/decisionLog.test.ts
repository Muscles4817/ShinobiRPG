import { createRng } from '@/core';
import { createPlanEngine, decisionsOf } from '@/systems/combat';

import { toSetup } from './fighters';
import { castMember, CAST_IDS, type CastId } from './matrixCast';
import { castTally, EMPTY_TALLY, EVERY_WHY, tallied, tallyTable } from './decisions';
import { skirmishOnce, tracedSkirmish, type Skirmish } from './runner';

/**
 * The decision log (`decisionLog.ts`) records today's AI without changing it: a traced fight
 * ends exactly as the same fight untraced, every turn and every announcement carries a known
 * reason, and a weighted pick says what it passed over. Set `VITE_BENCH_REPORT=true` to print the
 * baseline table over the whole cast (`docs/design/research/decision-baseline.md`).
 */

const PAIRS: readonly (readonly [CastId, CastId])[] = [
  ['rusher', 'illusionist'],
  ['stalker', 'mistBlade'],
  ['summoner', 'gates'],
  ['medic', 'assassin'],
  ['cloner', 'counterer'],
];
const SEEDS = 6;

function skirmish(a: CastId, b: CastId, watch: boolean): Skirmish {
  return { player: castMember(a, 'chunin'), allies: [], foes: [castMember(b, 'chunin')], watch };
}

describe('the decision log', () => {
  it.each(PAIRS)('%s against %s ends the same traced or not', (a, b) => {
    for (const watch of [false, true]) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const plain = skirmishOnce(skirmish(a, b, watch), seed);
        const traced = tracedSkirmish(skirmish(a, b, watch), seed);
        expect({ ...traced.record, seed, watch }).toEqual({ ...plain, seed, watch });
      }
    }
  });

  it('gives every turn and announcement a known reason', () => {
    const known = new Set<string>(EVERY_WHY);
    for (const [a, b] of PAIRS) {
      const { record, decisions } = tracedSkirmish(skirmish(a, b, true), 1);
      const turns = decisions.filter((d) => d.phase === 'turn');
      expect(turns.length).toBeGreaterThanOrEqual(record.exchanges);
      expect(decisions.filter((d) => d.phase === 'announce').length).toBeGreaterThan(0);
      for (const d of decisions) expect(known.has(d.why)).toBe(true);
      expect(turns.every((d) => d.fighterId !== '')).toBe(true);
    }
  });

  it('says what a weighted pick passed over, with odds that add up', () => {
    const weighed = PAIRS.flatMap(([a, b]) =>
      tracedSkirmish(skirmish(a, b, true), 2).decisions.filter((d) => d.why === 'weighted'),
    );
    expect(weighed.length).toBeGreaterThan(0);
    for (const d of weighed) {
      const total = (d.odds ?? []).reduce((sum, o) => sum + o.share, 0);
      expect(total).toBeCloseTo(1, 5);
      expect(d.odds?.some((o) => o.card === d.card)).toBe(true);
    }
  });

  it('a played announcement follows the announcement made for that exchange', () => {
    const { decisions } = tracedSkirmish(skirmish('rusher', 'illusionist', true), 3);
    const kept = decisions.filter((d) => d.phase === 'turn' && d.why === 'announced');
    expect(kept.length).toBeGreaterThan(0);
    for (const turn of kept) {
      const told = decisions.findLast(
        (d) => d.phase === 'announce' && d.fighterId === turn.fighterId && d.round < turn.round + 1,
      );
      expect(told?.card).toBe(turn.card);
    }
  });

  it('keeps nothing for a fight that is not traced', () => {
    const setup = {
      player: toSetup(castMember('rusher', 'chunin'), 'player'),
      allies: [],
      enemies: [toSetup(castMember('stalker', 'chunin'), 'foe')],
      canFlee: false,
    };
    const engine = createPlanEngine();
    expect(decisionsOf(engine.start(setup, createRng(1)))).toEqual([]);
    const traced = engine.start({ ...setup, trace: true }, createRng(1));
    expect(tallied(EMPTY_TALLY, decisionsOf(traced)).announcements).toBe(1);
  });

  it.runIf(import.meta.env.VITE_BENCH_REPORT === 'true')(
    'prints the baseline over the whole cast',
    () => {
      const tally = castTally(CAST_IDS, 3);
      const kept = `${((100 * tally.kept) / Math.max(1, tally.announcements)).toFixed(1)}%`;
      console.warn(`${tally.fights} fights; announcements played as told: ${kept}`);
      console.warn(tallyTable(tally));
    },
    600_000,
  );
});
