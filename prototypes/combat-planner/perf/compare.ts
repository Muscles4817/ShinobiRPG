import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

import type { Approach } from './approaches';
import { argmax, loadReferences, type Reference } from './reference';
import { decisionStates, type DecisionState } from './states';

/**
 * Runs approaches over the decision states and scores them against the reference: time, real
 * exchanges (or model evaluations), agreement with the reference's first card, regret by the
 * reference's own values, and whether the two prototype combos are still found.
 */

export interface Row {
  readonly name: string;
  readonly category: string;
  readonly states: number;
  readonly msMedian: number;
  readonly msP95: number;
  readonly msMean: number;
  readonly exchangesMean: number;
  readonly evalsMean: number;
  /** Chose the reference's best first card, or one the reference values exactly as high. */
  readonly agreement: number;
  /** Chose a first card within `NEAR` of the reference's best. */
  readonly nearBest: number;
  readonly regretMean: number;
  readonly regretWorst: number;
  readonly worstAt: string;
  readonly daze: string;
  readonly hide: string;
  readonly stats?: string;
  readonly notes?: Readonly<Record<string, number>>;
  /** Each state's choice and regret. */
  readonly choices: readonly {
    readonly id: string;
    readonly first: string;
    readonly regret: number;
  }[];
}

/** Regret this small counts as near the best (a few points of health over two exchanges). */
export const NEAR = 2;
/** Values this close are the same value (cards with identical outcomes on every seed). */
const TIE = 1e-9;

const quantile = (xs: number[], q: number) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))]!;
};

/** What a decision on a combo state played: its sequence (or its first card and "+ default"). */
function comboText(seq: readonly string[] | undefined, first: string): string {
  const shown = (seq && seq.length ? seq : [first]).map((c) => c.replace('jutsu:', ''));
  return shown.length === 1 ? `${shown[0]} + default` : shown.join(' > ');
}

export function runApproach(
  a: Approach,
  states: readonly DecisionState[],
  refs: readonly Reference[],
): Row {
  const { planner, stats } = a.make();
  const ms: number[] = [];
  let exchanges = 0;
  let evals = 0;
  let agree = 0;
  const regrets: { id: string; r: number; first: string }[] = [];
  const notes: Record<string, number> = {};
  let daze = '';
  let hide = '';
  for (const d of states) {
    const ref = refs.find((r) => r.id === d.id)!;
    const dec = planner(d.state, d.selfId);
    ms.push(dec.ms);
    exchanges += dec.exchanges;
    evals += dec.evals;
    if (dec.note) notes[dec.note] = (notes[dec.note] ?? 0) + 1;
    const q = ref.q[dec.first];
    if (q === undefined)
      throw new Error(`${a.name} chose ${dec.first}, not a first card at ${d.id}`);
    const r = ref.q[ref.best]! - q;
    if (r <= TIE) agree++;
    regrets.push({ id: d.id, r, first: dec.first });
    if (d.id === 'daze@0') daze = comboText(dec.sequence, dec.first);
    if (d.id === 'hide@0') hide = comboText(dec.sequence, dec.first);
  }
  const choices = regrets.map((x) => ({ id: x.id, first: x.first, regret: x.r }));
  const worst = [...regrets].sort((x, y) => y.r - x.r)[0]!;
  return {
    name: a.name,
    category: a.category,
    states: states.length,
    msMedian: quantile(ms, 0.5),
    msP95: quantile(ms, 0.95),
    msMean: ms.reduce((t, x) => t + x, 0) / ms.length,
    exchangesMean: exchanges / states.length,
    evalsMean: evals / states.length,
    agreement: agree / states.length,
    nearBest: regrets.filter((x) => x.r <= NEAR).length / states.length,
    regretMean: regrets.reduce((t, x) => t + x.r, 0) / regrets.length,
    regretWorst: worst.r,
    worstAt: worst.id,
    daze,
    hide,
    ...(stats ? { stats: stats() } : {}),
    ...(Object.keys(notes).length ? { notes } : {}),
    choices,
  };
}

/** The reference's own noise: one half of its seeds against the other. */
export function referenceNoise(refs: readonly Reference[]): {
  agreement: number;
  nearBest: number;
  regretMean: number;
  regretWorst: number;
} {
  const regrets = refs.map((r) => r.qB[argmax(r.qB)]! - r.qB[argmax(r.qA)]!);
  return {
    agreement: regrets.filter((x) => x <= TIE).length / refs.length,
    nearBest: regrets.filter((x) => x <= NEAR).length / refs.length,
    regretMean: regrets.reduce((t, x) => t + x, 0) / regrets.length,
    regretWorst: Math.max(...regrets),
  };
}

const OUT = new URL('./out/', import.meta.url);

export function runAndSave(part: string, approaches: readonly Approach[]): Row[] {
  const states = decisionStates();
  const refs = loadReferences();
  // Warm the JIT so the first approach isn't charged for it.
  approaches[0]!.make().planner(states[0]!.state, states[0]!.selfId);
  const rows = approaches.map((a) => {
    const row = runApproach(a, states, refs);
    console.log(JSON.stringify(row));
    return row;
  });
  if (!existsSync(OUT)) mkdirSync(OUT);
  writeFileSync(
    new URL(`./out/results-${part}.json`, import.meta.url),
    JSON.stringify(rows, null, 1),
  );
  return rows;
}

export function loadRows(): Row[] {
  const rows: Row[] = [];
  for (const part of ['a', 'b', 'e', 'd']) {
    const file = new URL(`./out/results-${part}.json`, import.meta.url);
    if (existsSync(file)) rows.push(...(JSON.parse(readFileSync(file, 'utf8')) as Row[]));
  }
  return rows;
}
