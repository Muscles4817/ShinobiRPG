import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { findCard, fitsBand, isOffence, type Card } from '@/systems/combat/engines/plan/cards';
import { isBodyMove } from '@/systems/combat/rules/breath';
import { CAST_IDS } from '@/test/bench/matrixCast';
import { SCALES } from '@/test/bench/fighters';
import { statTier } from '@/systems/stats';

import { collect, type DecisionPoint } from './collect';
import {
  calibration,
  CONDITION_HEADER,
  conditionRow,
  gapBin,
  groupBy,
  marginBin,
  row,
  ROW_HEADER,
  score,
  type Scored,
} from './evaluate';
import { BODY_HIDES, DEFAULT_TUNING, expertIn } from './observe';
import { classOf, cueProfile, rankIndex } from './profile';
import { readLine } from './words';

/**
 * The gate's evidence: decision points from watched fights of the whole matrix cast, at every
 * scale, scored against today's telegraph. Writes `bench-output.md` beside it.
 */

const SEEDS = [1, 2];

function fights() {
  return SCALES.flatMap((scale) =>
    CAST_IDS.flatMap((a) => CAST_IDS.flatMap((b) => SEEDS.map((seed) => ({ a, b, scale, seed })))),
  );
}

function table(title: string, header: string, lines: readonly string[]): string {
  const cols = header.split('|').length;
  return [
    `### ${title}`,
    '',
    `| ${header} |`,
    `|${' --- |'.repeat(cols)}`,
    ...lines.map((l) => `| ${l} |`),
    '',
  ].join('\n');
}

function bait(p: DecisionPoint): Card | undefined {
  if (p.truth.kind === 'jutsu') return undefined;
  return p.actor.techniques
    .map((technique): Card => ({ kind: 'jutsu', technique }))
    .find(
      (c) => c.kind === 'jutsu' && isOffence(c) && !isBodyMove(c.technique) && fitsBand(c, p.band),
    );
}

function feintGroup(p: DecisionPoint, shown: Card): string {
  const profile = cueProfile(shown, p.actor);
  const sharp = rankIndex(statTier(p.observer.attributes.intellect, 'mind').grade) >= 2;
  const expert = expertIn(p.observer, profile.art, profile.rank);
  if (p.insight) return 'a. insight';
  if (sharp && expert) return 'b. sharp and expert in its art';
  if (expert) return 'c. expert, not sharp';
  if (sharp) return 'd. sharp, not expert';
  return 'e. neither';
}

function feintTable(points: readonly DecisionPoint[]): string {
  const trials = points.flatMap((p) => {
    const shown = bait(p);
    return shown ? [{ p, shown, s: score(p, shown) }] : [];
  });
  const lines = groupBy(trials, (t) => feintGroup(t.p, t.shown)).map(([label, ts]) => {
    const seen = ts.filter((t) => t.s.cue);
    const fooled = seen.filter((t) => t.s.cue!.predicted === classOf(t.shown) && !t.s.cue!.feint);
    const fooledSure = fooled.filter((t) => t.s.cue!.confidence !== 'maybe');
    const caught = seen.filter((t) => t.s.cue!.feint);
    const truthRead = seen.filter((t) => t.s.cue!.predicted === t.s.truthClass);
    const p = (n: number) => `${Math.round((100 * n) / Math.max(1, seen.length))}%`;
    return [
      label,
      seen.length,
      p(fooled.length),
      p(fooledSure.length),
      p(caught.length),
      p(truthRead.length),
    ].join(' | ');
  });
  return table(
    "Feints: the actor wears an attacking technique's cues while doing something else",
    "observer | n | fooled (reads the bait's class) | fooled, fairly sure or sure | feint suspected | reads the true class",
    lines,
  );
}

function cardName(s: Scored, id: string): string {
  const card = findCard(s.point.actor, id);
  if (card?.kind === 'jutsu') return card.technique.name;
  if (card?.kind === 'item') return `a ${card.item.name.toLowerCase()}`;
  return id;
}

/** A few player-facing lines per perception gap, beside the truth. */
function sampleLines(rows: readonly Scored[]): string {
  const lines = groupBy(
    rows.filter((s) => !s.point.insight && s.cue),
    (s) => gapBin(s.gap),
  ).flatMap(([bin, rs]) =>
    (['sure', 'fairly sure', 'maybe'] as const).flatMap((word) =>
      rs
        .filter((s) => s.cue!.confidence === word)
        .filter((_, i) => i % 97 === 3)
        .slice(0, 2)
        .map((s) => `${bin} | ${s.truthId} | ${readLine(s.cue, (id) => cardName(s, id))}`),
    ),
  );
  return table('Player-facing lines (samples)', 'gap | truth | what the panel says', lines);
}

function seenBefore(s: Scored): boolean {
  return s.point.seenCards.includes(s.truthId);
}

function section(title: string, rows: readonly Scored[]): string {
  const plain = rows.filter((s) => !s.point.insight);
  const parts = [
    table(`${title}: by perception gap (observer − actor), no insight`, ROW_HEADER, [
      ...groupBy(plain, (s) => gapBin(s.gap)).map(([k, rs]) => row(k, rs)),
      row(
        'all, out-read (gap ≥ 0)',
        plain.filter((s) => s.gap >= 0),
      ),
      row(
        'out-read, a technique or tool seen before',
        plain.filter((s) => s.gap >= 0 && s.nameable && seenBefore(s)),
      ),
      row(
        'out-read, a technique or tool on first sight',
        plain.filter((s) => s.gap >= 0 && s.nameable && !seenBefore(s)),
      ),
      row(
        'all, out-read by the actor (gap < 0)',
        plain.filter((s) => s.gap < 0),
      ),
      row(
        'insight',
        rows.filter((s) => s.point.insight),
      ),
    ]),
    table(
      `${title}: by read margin (observer perception − actor concealment of the card), no insight`,
      ROW_HEADER,
      [
        ...groupBy(plain, (s) => marginBin(s.readMargin)).map(([k, rs]) => row(k, rs)),
        row(
          'out-read in the cue model (margin ≥ 0)',
          plain.filter((s) => s.readMargin >= 0),
        ),
        row(
          'out-read in both senses',
          plain.filter((s) => s.readMargin >= 0 && s.gap >= 0),
        ),
      ],
    ),
    table(`${title}: by the observer's grade in the true card's art (no insight)`, ROW_HEADER, [
      ...groupBy(plain, (s) => s.expertise).map(([k, rs]) => row(k, rs)),
    ]),
    table(`${title}: by scale (no insight)`, ROW_HEADER, [
      ...groupBy(plain, (s) => s.point.scale).map(([k, rs]) => row(k, rs)),
    ]),
    table(`${title}: by true class (no insight)`, ROW_HEADER, [
      ...groupBy(plain, (s) => s.truthClass).map(([k, rs]) => row(k, rs)),
    ]),
    table(
      `${title}: confidence words (no insight)`,
      'word | share of points | class right',
      calibration(plain),
    ),
    table(
      `${title}: confidence words, out-read (gap ≥ 0)`,
      'word | share of points | class right',
      calibration(plain.filter((s) => s.gap >= 0)),
    ),
    table(
      `${title}: confidence words, out-read by the actor (gap < 0)`,
      'word | share of points | class right',
      calibration(plain.filter((s) => s.gap < 0)),
    ),
    table(
      `${title}: slot conditions (no insight)`,
      CONDITION_HEADER,
      (['foe-readying', 'foe-attacking', 'foe-closing'] as const).flatMap((c) =>
        [0.5, 0.65, 0.9].map((t) => conditionRow(plain, c, t)),
      ),
    ),
    table(
      `${title}: slot conditions at low perception (gap < 0, no insight)`,
      CONDITION_HEADER,
      (['foe-readying', 'foe-attacking', 'foe-closing'] as const).flatMap((c) =>
        [0.5, 0.65, 0.9].map((t) =>
          conditionRow(
            plain.filter((s) => s.gap < 0),
            c,
            t,
          ),
        ),
      ),
    ),
  ];
  return parts.join('\n');
}

function variantTables(title: string, rows: readonly Scored[]): string {
  const plain = rows.filter((s) => !s.point.insight);
  return [
    table(`${title}: by perception gap`, ROW_HEADER, [
      ...groupBy(plain, (s) => gapBin(s.gap)).map(([k, rs]) => row(k, rs)),
      row(
        'all, out-read (gap ≥ 0)',
        plain.filter((s) => s.gap >= 0),
      ),
      row(
        'all, out-read by the actor (gap < 0)',
        plain.filter((s) => s.gap < 0),
      ),
    ]),
    table(`${title}: by read margin`, ROW_HEADER, [
      ...groupBy(plain, (s) => marginBin(s.readMargin)).map(([k, rs]) => row(k, rs)),
      row(
        'out-read in the cue model (margin ≥ 0)',
        plain.filter((s) => s.readMargin >= 0),
      ),
    ]),
    table(`${title}: confidence words`, 'word | share of points | class right', calibration(plain)),
  ].join('\n');
}

test('cue inference bench', () => {
  const t0 = performance.now();
  const points = collect(fights());
  const forward = points.filter((p) => p.direction === 'player-reads-foe');
  const reverse = points.filter((p) => p.direction === 'foe-reads-player');
  const out = [
    `# Cue inference bench output`,
    '',
    `${points.length} decision points from ${fights().length} watched fights (${CAST_IDS.length} cast members, ${SCALES.length} scales, ${SEEDS.length} seeds), ${Math.round((performance.now() - t0) / 1000)} s to collect.`,
    '',
    `Default tuning: ${DEFAULT_TUNING.name}.`,
    '',
    '## The player reading foes (today: the telegraph)',
    '',
    section(
      'Player reads foe',
      forward.map((p) => score(p)),
    ),
    sampleLines(forward.map((p) => score(p))),
    '## Foes reading the player (today: nothing; "today" columns show a symmetric telegraph)',
    '',
    section(
      'Foe reads player',
      reverse.map((p) => score(p)),
    ),
    `## Variant: ${BODY_HIDES.name} (concealment from speed and skill alone)`,
    '',
    variantTables(
      'Player reads foe',
      forward.map((p) => score(p, undefined, BODY_HIDES)),
    ),
    variantTables(
      'Foe reads player',
      reverse.map((p) => score(p, undefined, BODY_HIDES)),
    ),
    '## Feints (both directions)',
    '',
    feintTable(points),
  ].join('\n');
  writeFileSync(fileURLToPath(new URL('./bench-output.md', import.meta.url)), out);
  console.log(out);
});
