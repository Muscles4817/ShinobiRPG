import { createRng } from '@/core';
import { rollIntents } from '@/systems/combat/engines/plan/intent';
import { resolveExchange } from '@/systems/combat/engines/plan/round';
import { endOfRound } from '@/systems/combat/engines/plan/roundEnd';
import type { PlanState } from '@/systems/combat/engines/plan/state';

import { decisionStates } from '../states';

/** The narration divergence, by state: after each exchange, every field but the story text compared. */

function setMode(empty: boolean) {
  const g = globalThis as { __SILENT__?: boolean | readonly string[]; __TELL_MODE__?: string };
  g.__SILENT__ = empty ? ['tell'] : undefined;
  g.__TELL_MODE__ = empty ? 'empty' : undefined;
}

function step(s: PlanState, seed: number, empty: boolean, phase: 'resolve' | 'intents'): PlanState {
  setMode(empty);
  const rng = createRng(seed);
  const out =
    phase === 'resolve'
      ? endOfRound(resolveExchange(s, rng))
      : { ...s, intents: rollIntents(s, createRng(seed + 7)) };
  setMode(false);
  return out;
}

function flat(v: unknown, path = '', out: Record<string, string> = {}): Record<string, string> {
  if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) {
      if (k === 'log' || k === 'lines') continue;
      flat(x, `${path}.${k}`, out);
    }
  } else out[path] = JSON.stringify(v);
  return out;
}

function diff(a: PlanState, b: PlanState): string[] {
  const fa = flat(a),
    fb = flat(b);
  const keys = new Set([...Object.keys(fa), ...Object.keys(fb)]);
  return [...keys].filter((k) => fa[k] !== fb[k]).map((k) => `${k}: loud ${fa[k]} quiet ${fb[k]}`);
}

it('finds the first differing field', () => {
  const firsts = new Map<string, number>();
  for (const d of decisionStates()) {
    for (let seed = 1; seed <= 20; seed++) {
      let loud = d.state;
      let quiet = d.state;
      for (let i = 0; i < 3 && !loud.result; i++) {
        loud = step(loud, seed * 31 + i, false, 'resolve');
        quiet = step(quiet, seed * 31 + i, true, 'resolve');
        let ds = diff(loud, quiet);
        let where = 'after resolving';
        if (!ds.length && !loud.result) {
          loud = step(loud, seed * 31 + i, false, 'intents');
          quiet = step(quiet, seed * 31 + i, true, 'intents');
          ds = diff(loud, quiet);
          where = 'after intents';
        }
        if (ds.length) {
          const key = `${where}: ${ds
            .slice(0, 3)
            .map((x) => x.replace(/fighters\.\d+/, 'fighter').replace(/: loud.*/, ''))
            .join(' | ')}`;
          firsts.set(key, (firsts.get(key) ?? 0) + 1);
          if ((firsts.get(key) ?? 0) === 1)
            console.log(
              `FIRST ${d.id} seed ${seed} exch ${i}: ${where}\n  ${ds.slice(0, 4).join('\n  ')}`,
            );
          break;
        }
      }
    }
  }
  for (const [k, n] of firsts) console.log(`KIND ×${n} ${k}`);
});
