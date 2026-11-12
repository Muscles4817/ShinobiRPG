import { createRng } from '@/core';
import { rollIntents } from '@/systems/combat/engines/plan/intent';
import { resolveExchange } from '@/systems/combat/engines/plan/round';
import { endOfRound } from '@/systems/combat/engines/plan/roundEnd';
import type { PlanState } from '@/systems/combat/engines/plan/state';

import { decisionStates } from '../states';

/** The narration divergence, bisected: which told template, emptied alone, changes the fight? */

type G = {
  __SILENT__?: boolean | readonly string[];
  __TELL_MODE__?: string;
  __SEEN__?: Set<string>;
  __EMPTY_ONLY__?: ReadonlySet<string>;
};
const g = globalThis as G;

function run(s0: PlanState, seed: number): string {
  let s = s0;
  for (let i = 0; i < 3 && !s.result; i++) {
    const rng = createRng(seed * 31 + i);
    s = endOfRound(resolveExchange(s, rng));
    if (!s.result) s = { ...s, intents: rollIntents(s, rng) };
  }
  return JSON.stringify(
    s.fighters.map(({ health, breath, hidden, uses }) => ({ health, breath, hidden, uses })),
  );
}

it('bisects the templates', () => {
  const states = decisionStates()
    .filter((d) => d.id.startsWith('stalker-v-mistBlade'))
    .map((d) => d.state);
  const seeds = Array.from({ length: 20 }, (_, i) => i + 1);
  g.__SILENT__ = undefined;
  const truth = states.flatMap((s) => seeds.map((seed) => run(s, seed)));
  g.__SEEN__ = new Set();
  g.__SILENT__ = ['tell'];
  g.__TELL_MODE__ = 'record';
  states.forEach((s) => seeds.forEach((seed) => run(s, seed)));
  const templates = [...g.__SEEN__];
  console.log(`TEMPLATES ${templates.length}`);
  g.__TELL_MODE__ = 'empty-only';
  for (const t of templates) {
    g.__EMPTY_ONLY__ = new Set([t]);
    const now = states.flatMap((s) => seeds.map((seed) => run(s, seed)));
    const differ = now.filter((x, i) => x !== truth[i]).length;
    if (differ) console.log(`CULPRIT ${differ} differ when emptied alone: ${JSON.stringify(t)}`);
  }
  g.__SILENT__ = undefined;
  g.__TELL_MODE__ = undefined;
});
