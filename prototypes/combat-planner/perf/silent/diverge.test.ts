import { createRng, type Rng } from '@/core';
import { rollIntents } from '@/systems/combat/engines/plan/intent';
import { resolveExchange } from '@/systems/combat/engines/plan/round';
import { endOfRound } from '@/systems/combat/engines/plan/roundEnd';
import type { PlanState } from '@/systems/combat/engines/plan/state';

import { decisionStates } from '../states';

/**
 * The narration divergence (owner's priority): the same state, the same seed, played once with
 * the real story text and once with `tell` returning '' (`setup.ts`). Every Rng draw is recorded
 * with where it was made; the first draw that differs (in where, or in how many) is the first
 * mechanical divergence, and its two call sites are printed.
 */

interface Draw {
  readonly at: string;
}

function traced(seed: number, draws: Draw[]): Rng {
  const rng = createRng(seed);
  const site = () => {
    const stack = (new Error().stack ?? '')
      .split('\n')
      .slice(3)
      .filter((l) => l.includes('/src/'))
      .slice(0, 7);
    return stack
      .map((l) =>
        l
          .trim()
          .replace(/^at /, '')
          .replace(/\(.*\/src\//, '(')
          .replace(/\?[^:]*/, ''),
      )
      .join(' < ');
  };
  const next = () => {
    draws.push({ at: site() });
    return rng.next();
  };
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    chance: (p) => next() < p,
    pick: (items) => items[Math.floor(next() * items.length)]!,
    state: () => rng.state(),
  };
}

function play(state: PlanState, seed: number, empty: boolean) {
  const g = globalThis as { __SILENT__?: boolean | readonly string[]; __TELL_MODE__?: string };
  g.__SILENT__ = empty ? ['tell'] : undefined;
  g.__TELL_MODE__ = empty ? 'empty' : undefined;
  const draws: Draw[] = [];
  let s = state;
  for (let i = 0; i < 3 && !s.result; i++) {
    const rng = traced(seed * 31 + i, draws);
    s = endOfRound(resolveExchange(s, rng));
    if (!s.result) s = { ...s, intents: rollIntents(s, rng) };
  }
  g.__SILENT__ = undefined;
  g.__TELL_MODE__ = undefined;
  return { s, draws };
}

const mechanics = (s: PlanState) =>
  JSON.stringify(
    s.fighters.map(({ health, chakra, breath, stunned, pinned, hidden }) => ({
      health,
      chakra,
      breath,
      stunned,
      pinned,
      hidden,
    })),
  );

it('finds the first divergence', () => {
  const sites = new Map<string, number>();
  let differing = 0;
  let total = 0;
  for (const d of decisionStates()) {
    for (let seed = 1; seed <= 20; seed++) {
      total++;
      const loud = play(d.state, seed, false);
      const quiet = play(d.state, seed, true);
      if (mechanics(loud.s) === mechanics(quiet.s) && loud.draws.length === quiet.draws.length)
        continue;
      differing++;
      const i = loud.draws.findIndex((x, k) => quiet.draws[k]?.at !== x.at);
      const key =
        i < 0
          ? `same draw sites, ${loud.draws.length} vs ${quiet.draws.length} draws`
          : `LOUD ${loud.draws[i]?.at}\n   QUIET ${quiet.draws[i]?.at ?? '(no draw)'}`;
      sites.set(key, (sites.get(key) ?? 0) + 1);
    }
  }
  console.log(`DIVERGE ${differing}/${total} differ`);
  for (const [k, n] of [...sites].sort((a, b) => b[1] - a[1]).slice(0, 6))
    console.log(`DIVERGE ×${n}\n   ${k}`);
});
