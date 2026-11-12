import type { PlanState } from '@/systems/combat/engines/plan/state';

import { forcedFor, playExchange } from '../../forward';
import { beamPlanner } from '../planners';
import { decisionStates } from '../states';
import { Sim, simFlags } from '../sim';

/**
 * Is the silent exchange (narration mocked to a constant, `setup.ts`) the same exchange? Every
 * decision state, every first card, eight seeds, three exchanges each (the card, then the default
 * plan), played loud and silent (and loud with the log emptied first): the outcomes are compared
 * field by field. Then the planner's cost both ways.
 */

const setSilent = (on: boolean | readonly string[]) =>
  ((globalThis as { __SILENT__?: boolean | readonly string[] }).__SILENT__ = on);

/** Everything a fight's outcome is made of, without the story. */
function fingerprint(s: PlanState): string {
  return JSON.stringify({
    result: s.result,
    range: s.range,
    distances: s.distances ?? null,
    intents: s.intents,
    fighters: s.fighters.map((f) => {
      const { name: _n, called: _c, grammar: _g, ...rest } = f;
      return rest;
    }),
    seen: s.seen,
    reads: s.reads ?? null,
    field: s.field ?? null,
    quietRounds: s.quietRounds ?? null,
    roundHealth: s.roundHealth ?? null,
    tired: s.tired ?? null,
  });
}

function playOut(
  d: { state: PlanState; selfId: string },
  card: string,
  seed: number,
  lean: boolean,
) {
  let s = forcedFor(d.state, d.selfId, card);
  const out: string[] = [];
  for (let k = 0; k < 3 && !s.result; k++) {
    s = playExchange(lean ? { ...s, log: [] } : s, seed * 7919 + k);
    out.push(fingerprint(s));
    s = forcedFor(s, d.selfId, null, d.state);
  }
  return out.join('\n');
}

it('the silent exchange has the same outcomes as the loud one', () => {
  const states = decisionStates();
  let compared = 0;
  let silentDiffers = 0;
  let leanDiffers = 0;
  const firstDiff: string[] = [];
  for (const d of states) {
    const first = new Sim(d.state, d.selfId, { share: true, seedBase: 1, ownHurt: 1 }).first;
    for (const card of first) {
      for (let seed = 1; seed <= 8; seed++) {
        setSilent(false);
        const loud = playOut(d, card, seed, false);
        const lean = playOut(d, card, seed, true);
        setSilent(true);
        const quiet = playOut(d, card, seed, true);
        setSilent(false);
        compared++;
        if (quiet !== loud) {
          silentDiffers++;
          if (firstDiff.length < 3) firstDiff.push(`${d.id} ${card} seed ${seed}`);
        }
        if (lean !== loud) leanDiffers++;
      }
    }
  }
  console.log(
    `compared ${compared} three-exchange rollouts: silent+empty log differs in ${silentDiffers}, empty log alone differs in ${leanDiffers}`,
    firstDiff,
  );
  expect(silentDiffers).toBe(0);
});

it('what silence saves', () => {
  const states = decisionStates().filter((_, i) => i % 3 === 0);
  const plan = beamPlanner({ depth: 2, width: 4, rollouts: 16, share: true });
  const time = (on: boolean) => {
    setSilent(on);
    simFlags.lean = on;
    let ms = 0;
    let ex = 0;
    for (const d of states) {
      const r = plan(d.state, d.selfId);
      ms += r.ms;
      ex += r.exchanges;
    }
    setSilent(false);
    simFlags.lean = false;
    return { ms: ms / states.length, perExchange: ms / ex };
  };
  time(false); // warm up
  const loud = time(false);
  const quiet = time(true);
  console.log(
    `${states.length} states, prefix sharing: loud ${loud.ms.toFixed(0)} ms/decision (${(loud.perExchange * 1000).toFixed(0)} µs/exchange), silent ${quiet.ms.toFixed(0)} ms/decision (${(quiet.perExchange * 1000).toFixed(0)} µs/exchange)`,
  );
});

/** Which mock changes outcomes, and which part of the outcome it changes. */
it('which narration output the rules read', () => {
  const states = decisionStates();
  const mocks = ['tell', 'told', 'choose', 'freshWord', 'freshPick'];
  const differs: Record<string, number> = {};
  const fields: Record<string, number> = {};
  for (const d of states) {
    const first = new Sim(d.state, d.selfId, { share: true, seedBase: 1, ownHurt: 1 }).first;
    for (const card of first) {
      for (let seed = 1; seed <= 8; seed++) {
        setSilent(false);
        const loud = playOut(d, card, seed, false);
        for (const m of mocks) {
          setSilent([m]);
          const quiet = playOut(d, card, seed, false);
          setSilent(false);
          if (quiet === loud) continue;
          differs[m] = (differs[m] ?? 0) + 1;
          const a = loud.split('\n').map((l) => JSON.parse(l) as Record<string, unknown>);
          const b = quiet.split('\n').map((l) => JSON.parse(l) as Record<string, unknown>);
          a.forEach((x, i) => {
            const y = b[i] ?? {};
            for (const k of Object.keys(x)) {
              if (JSON.stringify(x[k]) === JSON.stringify(y[k])) continue;
              if (k !== 'fighters') fields[`${m}:${k}`] = (fields[`${m}:${k}`] ?? 0) + 1;
              else {
                const fx = x[k] as Record<string, unknown>[];
                const fy = (y[k] ?? []) as Record<string, unknown>[];
                fx.forEach((f, j) => {
                  for (const fk of Object.keys(f)) {
                    if (JSON.stringify(f[fk]) !== JSON.stringify(fy[j]?.[fk]))
                      fields[`${m}:fighter.${fk}`] = (fields[`${m}:fighter.${fk}`] ?? 0) + 1;
                  }
                });
              }
            }
          });
        }
      }
    }
  }
  console.log('rollouts that differ with only this mock on:', differs);
  console.log('fields that differ (mock:field → exchanges):', fields);
});

it('what a told line the rules read: tell mocked several ways', () => {
  const states = decisionStates();
  const g = globalThis as { __TELL_MODE__?: string };
  for (const mode of ['identity', 'x', 'template', 'empty']) {
    g.__TELL_MODE__ = mode;
    let n = 0;
    let diff = 0;
    for (const d of states) {
      const first = new Sim(d.state, d.selfId, { share: true, seedBase: 1, ownHurt: 1 }).first;
      for (const card of first) {
        for (let seed = 1; seed <= 4; seed++) {
          setSilent(false);
          const loud = playOut(d, card, seed, false);
          setSilent(['tell']);
          const quiet = playOut(d, card, seed, false);
          setSilent(false);
          n++;
          if (quiet !== loud) diff++;
        }
      }
    }
    console.log(`tell mocked as ${mode}: ${diff}/${n} rollouts differ`);
  }
  delete g.__TELL_MODE__;
});
