import { writeFileSync } from 'node:fs';

import { createRng } from '@/core';
import { contextForPack, createVersus, versusRoster } from '@/game';
import { createPlanEngine, decisionsOf, type CombatState } from '@/systems/combat';
import { decode, type PlanFighter, type PlanState } from '@/systems/combat/engines/plan/state';

/**
 * Two structural questions from the owner's Kimimaro fight, measured over many versus bouts:
 *  1. Lockout: a fighter who must close in, against a foe with wide areas (which throw everyone
 *     they catch back to mid): how often do they get to act up close, and how often never?
 *  2. Dazes: how many turns are lost to them, and how many come from areas that daze?
 * Bouts are watched (both sides by their own judgement), between people of one group (genin,
 * chūnin, jōnin, Kage) from the Naruto roster, and once more with the first side made to fight
 * up close (`keepAt: close`), as a player who sets "fight at close range" would.
 */

const naruto = contextForPack('naruto')!;
const OUT = process.env.WALK_OUT ?? '.';
const BOUTS = Number(process.env.BOUTS ?? 400);

const isWideArea = (f: PlanFighter) =>
  f.techniques.some((t) =>
    t.effects.some((e) => e.verb === 'area' && (e.size === 'wide' || e.size === 'vast')),
  );
const dazesInArea = (f: PlanFighter) =>
  f.techniques.some(
    (t) => t.effects.some((e) => e.verb === 'area') && t.effects.some((e) => e.verb === 'daze'),
  );

const ARTS = ['taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu'] as const;
/** A taijutsu fighter, as `closeQuarters.ts` reads one: taijutsu at C, or their best art. */
const isRusher = (f: PlanFighter) =>
  f.attributes.taijutsu >= 13 ||
  f.attributes.taijutsu >= Math.max(...ARTS.map((a) => f.attributes[a]));

interface BoutStats {
  readonly rusher: boolean;
  readonly closer: { closeActs: number; steps: number; turns: number; won: boolean };
  readonly foeWide: boolean;
  readonly foeAreaDaze: boolean;
  /** Turns either side lost to a daze, and turns either side had. */
  readonly lost: number;
  readonly turns: number;
  readonly dazes: number;
  readonly areaDazes: number;
}

function bout(
  side: string,
  foe: string,
  { seed, forceClose }: { seed: number; forceClose: boolean },
): BoutStats | null {
  const rules = (process.env.RULES ?? '').split(',').filter(Boolean);
  const made = createVersus(naruto, {
    side: [side],
    foes: [foe],
    seed,
    watch: true,
    rushing: rules.includes('rushing'),
    handSigns: rules.includes('handSigns'),
  });
  if (!made.ok || !made.value.combat) return null;
  const start = decode(made.value.combat);
  const data: PlanState = {
    ...start,
    decisions: [],
    fighters: start.fighters.map((f) =>
      f.id === 'player' && forceClose ? { ...f, keepAt: 'close' as const } : f,
    ),
  };
  const engine = createPlanEngine();
  const rng = createRng(seed);
  let state: CombatState = { ...made.value.combat, data };
  const closer = { closeActs: 0, steps: 0, turns: 0, won: false };
  let lost = 0;
  let turns = 0;
  let dazes = 0;
  let areaDazes = 0;
  const foeF = start.fighters.find((f) => f.side === 'enemy')!;
  for (let n = 0; n < 100 && !engine.outcome(state); n++) {
    const before = decode(state);
    const next = engine.act(state, { optionId: 'next' }, rng);
    if (!next.ok) break;
    state = next.value;
    const after = decode(state);
    const round = before.round;
    const acts = decisionsOf(state).filter((d) => d.phase === 'turn' && d.round === round);
    for (const f of before.fighters.filter(
      (x) => x.health > 0 && x.summoner === undefined && x.shadowOf === undefined,
    )) {
      turns += 1;
      if (f.stunned > 0) lost += 1;
    }
    for (const f of after.fighters) {
      const was = before.fighters.find((x) => x.id === f.id);
      if (was && was.stunned === 0 && f.stunned > 0) {
        dazes += 1;
        const by = acts.find((d) => d.fighterId !== f.id && d.targetId === f.id);
        const user = before.fighters.find((x) => x.id === by?.fighterId);
        const t = user?.techniques.find((x) => `jutsu:${x.id}` === by?.card);
        if (t?.effects.some((e) => e.verb === 'area')) areaDazes += 1;
      }
    }
    const p = before.fighters.find((x) => x.id === 'player');
    const mine = acts.find((d) => d.fighterId === 'player');
    if (p && p.health > 0 && p.stunned === 0) {
      closer.turns += 1;
      const pair = Object.values(before.distances ?? {})[0] ?? before.range;
      if (mine?.card.startsWith('step')) closer.steps += 1;
      else if (mine && pair === 'close') closer.closeActs += 1;
    }
  }
  closer.won = engine.outcome(state)?.result === 'victory';
  const me = start.fighters.find((f) => f.id === 'player')!;
  return {
    rusher: isRusher(me),
    closer,
    foeWide: isWideArea(foeF),
    foeAreaDaze: dazesInArea(foeF),
    lost,
    turns,
    dazes,
    areaDazes,
  };
}

function pick<T>(xs: readonly T[], rng: ReturnType<typeof createRng>): T {
  return xs[Math.floor(rng.next() * xs.length)]!;
}

it('measure', () => {
  const roster = versusRoster(naruto).filter(
    (f) => f.id.startsWith('person:') && f.group !== 'Foes',
  );
  const groups = [...new Set(roster.map((f) => f.group))];
  const rng = createRng(2026);
  const rows: { forced: boolean; s: BoutStats }[] = [];
  for (let i = 0; i < BOUTS; i++) {
    const g = pick(groups, rng);
    const pool = roster.filter((f) => f.group === g);
    if (pool.length < 2) continue;
    const a = pick(pool, rng).id;
    const b = pick(pool, rng).id;
    if (a === b) continue;
    for (const forced of [false, true]) {
      const s = bout(a, b, { seed: i + 1, forceClose: forced });
      if (s) rows.push({ forced, s });
    }
  }
  const lines: string[] = [];
  const share = (n: number, d: number) => (d === 0 ? '—' : `${((100 * n) / d).toFixed(1)}%`);
  for (const [forced, onlyRushers] of [
    [false, false],
    [true, false],
    [true, true],
  ] as const) {
    for (const wide of [true, false]) {
      const set = rows
        .filter((r) => r.forced === forced && r.s.foeWide === wide && (!onlyRushers || r.s.rusher))
        .map((r) => r.s);
      const t = set.reduce(
        (a, s) => ({
          close: a.close + s.closer.closeActs,
          steps: a.steps + s.closer.steps,
          turns: a.turns + s.closer.turns,
          never: a.never + (s.closer.closeActs === 0 ? 1 : 0),
          won: a.won + (s.closer.won ? 1 : 0),
        }),
        { close: 0, steps: 0, turns: 0, never: 0, won: 0 },
      );
      lines.push(
        `| ${forced ? (onlyRushers ? 'taijutsu fighters at close' : 'fights at close (forced)') : 'own plan'} | ${wide ? 'yes' : 'no'} | ${set.length} | ${share(t.close, t.turns)} | ${share(t.steps, t.turns)} | ${share(t.never, set.length)} | ${share(t.won, set.length)} |`,
      );
    }
  }
  const all = rows.filter((r) => !r.forced).map((r) => r.s);
  const sum = (f: (s: BoutStats) => number) => all.reduce((a, s) => a + f(s), 0);
  const withAD = all.filter((s) => s.foeAreaDaze);
  const sumOf = (xs: readonly BoutStats[], f: (s: BoutStats) => number) =>
    xs.reduce((a, s) => a + f(s), 0);
  const report = [
    `${rows.length} bouts.`,
    '',
    '| First side | Foe has wide areas | Bouts | Turns acting up close | Turns stepping | Never acted up close | First side won |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...lines,
    '',
    `Dazes, own plans: ${sum((s) => s.dazes)} dazes in ${all.length} bouts (${(sum((s) => s.dazes) / all.length).toFixed(2)} a bout); ${share(
      sum((s) => s.areaDazes),
      sum((s) => s.dazes),
    )} of them from areas.`,
    `Turns lost to a daze: ${share(
      sum((s) => s.lost),
      sum((s) => s.turns),
    )} of all turns; in bouts where a side has an area that dazes: ${share(
      sumOf(withAD, (s) => s.lost),
      sumOf(withAD, (s) => s.turns),
    )} (${withAD.length} bouts).`,
  ];
  writeFileSync(`${OUT}/measure-${process.env.RULES ?? 'none'}.md`, report.join('\n'));
  console.warn(report.join('\n'));
});
