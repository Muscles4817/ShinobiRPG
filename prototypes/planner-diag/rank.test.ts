import { createRng } from '@/core';
import { createPlanEngine, type CombatState } from '@/systems/combat';
import { cardId } from '@/systems/combat/engines/plan/cards';
import { asRound } from '@/systems/combat/engines/plan/intent';
import { planFor } from '@/systems/combat/engines/plan/mind/planner/search';
import { plannedPlay } from '@/systems/combat/engines/plan/priority';
import { resolveExchange } from '@/systems/combat/engines/plan/round';
import { endOfRound } from '@/systems/combat/engines/plan/roundEnd';
import { rollIntents } from '@/systems/combat/engines/plan/intent';
import { decode, type PlanState } from '@/systems/combat/engines/plan/state';

import { toSetup } from '../../src/test/bench/fighters';
import { CAST_IDS, castMember, type CastId } from '../../src/test/bench/matrixCast';

/**
 * Does the planner's two-exchange estimate rank first cards the way whole fights do? At each
 * round start of a watched fight where a thinking foe's pick differs from today's, both first
 * cards are played to the end of the fight (today's AI after them, many seeds), and compared
 * with what the planner thought of each.
 */

const FOE = (process.env.DIAG_FOE ?? 'foresight') as CastId;
const LONG_SEEDS = 12;

function play(state: PlanState, seed: number): PlanState {
  const rng = createRng(seed);
  const next = endOfRound(resolveExchange({ ...state, log: [] }, rng));
  return next.result ? next : { ...next, intents: rollIntents(next, rng) };
}

function toEnd(state: PlanState, card: string, seed: number): number {
  let s: PlanState = { ...state, intents: { ...state.intents, foe: card } };
  for (let i = 0; i < 100 && !s.result; i++) s = play(s, seed * 7919 + i);
  return s.result === 'defeat' ? 1 : s.result === 'victory' ? 0 : 0.5;
}

it('ranks', () => {
  const rows: { planner: string; today: string; pv: number; tv: number; pw: number; tw: number }[] =
    [];
  for (const a of CAST_IDS) {
    for (const seed of [1, 2]) {
      const engine = createPlanEngine();
      const rng = createRng(seed);
      let cs: CombatState = engine.start(
        {
          player: toSetup(castMember(a, 'chunin'), 'player'),
          allies: [],
          enemies: [toSetup(castMember(FOE, 'chunin'), 'foe')],
          canFlee: false,
          watch: true,
        },
        rng,
      );
      for (let n = 0; n < 40 && !engine.outcome(cs); n++) {
        const s = decode(cs);
        const foe = s.fighters.find((f) => f.id === 'foe');
        if (s.exchange === 0 && foe && foe.health > 0 && foe.stunned === 0) {
          const today = cardId(plannedPlay(foe, asRound(s)).card);
          const p = planFor({ state: s, selfId: 'foe', budget: 900, seedBase: 77 });
          const pick = p?.sequence[0];
          if (pick && pick !== today && p) {
            const single = planFor({ state: s, selfId: 'foe', budget: 900, seedBase: 77 });
            let pw = 0;
            let tw = 0;
            for (let k = 1; k <= LONG_SEEDS; k++) {
              pw += toEnd(s, pick, k);
              tw += toEnd(s, today, k);
            }
            rows.push({
              planner: pick,
              today,
              pv: single?.value ?? 0,
              tv: 0,
              pw: pw / LONG_SEEDS,
              tw: tw / LONG_SEEDS,
            });
          }
        }
        const next = engine.act(cs, { optionId: 'next' }, rng);
        if (!next.ok) break;
        cs = next.value;
      }
    }
  }
  const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / Math.max(1, xs.length);
  const pairs: Record<string, number[]> = {};
  for (const r of rows) (pairs[`${r.planner} over ${r.today}`] ??= []).push(r.pw - r.tw);
  console.warn(
    `${FOE}: ${rows.length} moments the pick differs. Whole-fight wins with the planner's card ${mean(rows.map((r) => r.pw)).toFixed(3)}, with today's ${mean(rows.map((r) => r.tw)).toFixed(3)}`,
  );
  for (const [k, v] of Object.entries(pairs).sort((x, y) => y[1].length - x[1].length)) {
    console.warn(`  ${k}: ${v.length} times, planner's better by ${mean(v).toFixed(3)}`);
  }
});
