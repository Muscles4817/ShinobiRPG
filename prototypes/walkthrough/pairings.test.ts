import { writeFileSync } from 'node:fs';

import { createRng } from '@/core';
import { createPlanEngine, decisionsOf, type CombatState } from '@/systems/combat';

import { castMember, type CastId } from '../../src/test/bench/matrixCast';
import { toSetup } from '../../src/test/bench/fighters';

/**
 * Phase B, step 1: the pairings the close-quarters rules moved most, read move by move. Each is
 * fought with the rules off and on (chūnin, watched); what happened is counted from the story
 * and the decision log, and a few lost fights with the rules on are kept whole to be read.
 */

const OUT = process.env.WALK_OUT ?? '.';
const SEEDS = Number(process.env.SEEDS ?? 60);
const PAIRS: [CastId, CastId][] = [
  ['medic', 'rusher'],
  ['medic', 'gates'],
  ['sensor', 'rusher'],
  ['illusionist', 'powerhouse'],
  ['shrouded', 'powerhouse'],
  ['puppeteer', 'powerhouse'],
  ['summoner', 'gates'],
  ['trapper', 'shrouded'],
];
const ON = { rushing: true, handSigns: true, standFirm: true } as const;

function readable(line: string): string {
  const notes: string[] = [];
  const text = line.replace(/⟦([^⟧]*)⟧/g, (_, tag: string) => {
    if (/^[-+]\d/.test(tag)) notes.push(tag);
    else if (tag.startsWith('c:')) notes.push(`why: ${tag.slice(2)}`);
    return '';
  });
  const clean = text.replace(/\s+/g, ' ').trim();
  return notes.length ? `${clean} [${notes.join('; ')}]` : clean;
}

interface Fight {
  readonly won: boolean;
  readonly exchanges: number;
  readonly log: readonly string[];
  readonly plays: readonly string[];
  readonly whys: readonly string[];
}

function fight(a: CastId, b: CastId, seed: number, rulesOn: boolean): Fight {
  const engine = createPlanEngine();
  const rng = createRng(seed);
  let state: CombatState = engine.start(
    {
      player: toSetup(castMember(a, 'chunin'), 'player'),
      allies: [],
      enemies: [toSetup(castMember(b, 'chunin'), 'foe')],
      canFlee: false,
      watch: true,
      trace: true,
      ...(rulesOn ? { experiments: ON } : {}),
    },
    rng,
  );
  const log: string[] = [];
  let seen = 0;
  let exchanges = 0;
  for (let n = 0; n < 200 && !engine.outcome(state); n++) {
    const begin = engine.view(state).options.some((o) => o.id === 'begin');
    const next = engine.act(state, { optionId: begin ? 'begin' : 'next' }, rng);
    if (!next.ok) break;
    state = next.value;
    if (begin) continue;
    exchanges += 1;
    const view = engine.view(state);
    const off = view.logOffset ?? 0;
    for (const l of view.log.slice(Math.max(0, seen - off))) log.push(readable(l));
    seen = off + view.log.length;
  }
  const mine = decisionsOf(state).filter((d) => d.phase === 'turn' && d.fighterId === 'player');
  return {
    won: engine.outcome(state)?.result === 'victory',
    exchanges,
    log,
    plays: mine.map((d) => d.card),
    whys: mine.map((d) => d.why),
  };
}

const count = (xs: readonly string[], p: (x: string) => boolean) => xs.filter(p).length;

it('pairings', () => {
  const report: string[] = [];
  for (const [a, b] of PAIRS) {
    report.push(`## ${a} against ${b}`, '');
    for (const on of [false, true]) {
      const fights = Array.from({ length: SEEDS }, (_, i) => fight(a, b, i + 1, on));
      const all = fights.flatMap((f) => f.log);
      const plays = new Map<string, number>();
      for (const p of fights.flatMap((f) => f.plays)) plays.set(p, (plays.get(p) ?? 0) + 1);
      const top = [...plays].sort((x, y) => y[1] - x[1]).slice(0, 6);
      const per = (n: number) => (n / SEEDS).toFixed(1);
      report.push(
        `**Rules ${on ? 'on' : 'off'}:** won ${fights.filter((f) => f.won).length}/${SEEDS}, ` +
          `${per(fights.reduce((s, f) => s + f.exchanges, 0))} exchanges a fight. ` +
          `A fight: seals broken ${per(count(all, (l) => l.includes('before the seals are done')))}, ` +
          `rushed-in strikes ${per(count(all, (l) => / land(s)?\.? /.test(`${l} `) && l.includes('as ')))}, ` +
          `kept their feet ${per(count(all, (l) => l.includes('feet.')))}, ` +
          `crowded turns ${per(fights.reduce((s, f) => s + count(f.whys, (w) => w === 'crowded'), 0))}.`,
        '',
        `Plays: ${top.map(([c, k]) => `${c} ${k}`).join(', ')}`,
        '',
      );
      if (on) {
        for (const f of fights.filter((x) => !x.won).slice(0, 2)) {
          report.push('```', ...f.log.slice(0, 80), '```', '');
        }
      }
    }
  }
  writeFileSync(`${OUT}/pairings.md`, report.join('\n'));
});
