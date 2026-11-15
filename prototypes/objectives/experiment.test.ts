import { CAST_IDS } from '../../src/test/bench/matrixCast';
import { KINDS, partings, playOut, type Kind, type Moment } from './experiment';

/**
 * Plays out every moment the objective layer and today's AI disagree, over the whole bench cast
 * at chūnin (each ordered pair, `SEEDS` fights), and prints, per kind of moment, how the layer's
 * move fared against today's from there on, with the same seeds on both sides.
 */

const SEEDS = 1;
const CONTINUATIONS = 6;
/** Moments of each kind kept, spread across the cast, so a run stays within minutes. */
const PER_KIND = 250;

it('who was right', () => {
  const moments: Record<Kind, Moment[]> = { recover: [], find: [], stay: [], 'set-up': [] };
  for (const a of CAST_IDS) {
    for (const b of CAST_IDS) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        for (const m of partings(a, b, seed)) moments[m.kind].push(m);
      }
    }
  }
  const lines = [
    '| Moment | Found | Played | Wins, today | Wins, layer | Margin, today | Margin, layer | Layer better / worse / same |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ];
  for (const kind of KINDS) {
    const all = moments[kind];
    const step = Math.max(1, Math.floor(all.length / PER_KIND));
    const sample = all.filter((_, i) => i % step === 0).slice(0, PER_KIND);
    let n = 0;
    let winsA = 0;
    let winsB = 0;
    let marginA = 0;
    let marginB = 0;
    let better = 0;
    let worse = 0;
    let same = 0;
    for (const m of sample) {
      const today = [];
      const layer = [];
      let complied = true;
      for (let c = 1; c <= CONTINUATIONS; c++) {
        today.push(playOut(m, false, c));
        const forced = playOut(m, true, c);
        complied &&= forced.complied;
        layer.push(forced);
      }
      if (!complied) continue;
      n += 1;
      const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
      const wa = mean(today.map((e) => e.won));
      const wb = mean(layer.map((e) => e.won));
      const ma = mean(today.map((e) => e.margin));
      const mb = mean(layer.map((e) => e.margin));
      winsA += wa;
      winsB += wb;
      marginA += ma;
      marginB += mb;
      const d = wb - wa + (mb - ma) / 4;
      if (d > 0.02) better += 1;
      else if (d < -0.02) worse += 1;
      else same += 1;
    }
    const pct = (x: number) => (n === 0 ? '' : `${((100 * x) / n).toFixed(1)}%`);
    const avg = (x: number) => (n === 0 ? '' : (x / n).toFixed(3));
    lines.push(
      `| ${kind} | ${all.length} | ${n} | ${pct(winsA)} | ${pct(winsB)} | ${avg(marginA)} | ${avg(marginB)} | ${better} / ${worse} / ${same} |`,
    );
  }
  console.warn(lines.join('\n'));
});
