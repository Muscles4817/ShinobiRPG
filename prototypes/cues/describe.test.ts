import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { reachOf } from '@/systems/combat/rules/range';
import { CAST_IDS } from '@/test/bench/matrixCast';
import { SCALES } from '@/test/bench/fighters';

import { collect } from './collect';
import { describe as describeSeen, describedLine, saysAnything } from './describe';
import { readingOf, score } from './evaluate';
import { observe } from './observe';
import { cueProfile } from './profile';

/**
 * The owner accepted describing a first-sight technique instead of naming it. How often does the
 * description say something, and how often is everything it says true?
 */

const SEEDS = [1, 2];

test('describing techniques seen for the first time', () => {
  const fights = SCALES.flatMap((scale) =>
    CAST_IDS.flatMap((a) => CAST_IDS.flatMap((b) => SEEDS.map((seed) => ({ a, b, scale, seed })))),
  );
  const points = collect(fights).filter((p) => !p.insight && p.truth.kind === 'jutsu');
  const rows = points.map((p) => {
    const s = score(p);
    return { p, s, out: s.gap >= 0, first: !p.seenCards.includes(s.truthId) };
  });
  const lines: string[] = [];
  const samples: string[] = [];
  for (const [label, keep] of [
    ['out-read, first sight', (r: (typeof rows)[number]) => r.out && r.first],
    ['out-read by the foe, first sight', (r: (typeof rows)[number]) => !r.out && r.first],
  ] as const) {
    const group = rows.filter(keep).filter((r) => r.s.cue && r.p.truth.kind === 'jutsu');
    let named = 0;
    let described = 0;
    let allTrue = 0;
    let parts = 0;
    let partsTrue = 0;
    let classOrBetter = 0;
    for (const r of group) {
      if (r.s.cue!.named === r.s.truthId) {
        named++;
        classOrBetter++;
        continue;
      }
      if (r.s.cue!.predicted === r.s.truthClass) classOrBetter++;
      const t = r.p.truth.kind === 'jutsu' ? r.p.truth.technique : null;
      if (!t) continue;
      const seen = observe(readingOf(r.p), cueProfile(r.p.truth, r.p.actor));
      const d = describeSeen(seen);
      if (!saysAnything(d)) continue;
      described++;
      const reach = reachOf(t);
      const checks: boolean[] = [];
      if (d.element !== undefined) checks.push((d.element ?? null) === (t.element ?? null));
      if (d.reach !== undefined)
        checks.push(
          d.reach === 'close' ? reach.includes('close') : reach.some((b) => b !== 'close'),
        );
      if (d.seals !== undefined) checks.push(!['taijutsu', 'kenjutsu'].includes(t.discipline));
      parts += checks.length;
      partsTrue += checks.filter(Boolean).length;
      if (checks.every(Boolean)) allTrue++;
      if (samples.length < 12 && described % 211 === 1)
        samples.push(
          `${t.name} (${t.element ?? 'no element'}, ${reach.join('/')}) | ${describedLine(d, r.s.cue!.confidence === 'maybe' ? 'perhaps ' : 'likely ')}`,
        );
    }
    const pct = (n: number, d: number) => (d ? `${Math.round((100 * n) / d)}%` : '–');
    lines.push(
      `| ${label} | ${group.length} | ${pct(named, group.length)} | ${pct(named + described, group.length)} | ${pct(allTrue, described)} | ${pct(partsTrue, parts)} | ${pct(classOrBetter, group.length)} |`,
    );
  }
  const out = [
    '# Describing a technique seen for the first time',
    '',
    '| points | n | named | named or described | description wholly true | statements true | kind of move right or named |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...lines,
    '',
    '| truth | what the panel says |',
    '| --- | --- |',
    ...samples.map((s) => `| ${s} |`),
    '',
  ].join('\n');
  writeFileSync(fileURLToPath(new URL('describe-output.md', import.meta.url)), out);
  console.log(out);
}, 600_000);
