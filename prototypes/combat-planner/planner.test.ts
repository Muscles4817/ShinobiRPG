import { readFileSync } from 'node:fs';

import { plan, type Search } from './beam';
import { fightWith, type FightResult } from './fight';
import { rollout } from './forward';
import { blade, burst, duel, fighter, flash, spark, veil } from './scenarios';
import type { CombatTechnique } from '@/systems/combat/contract';

/**
 * The proof of concept the owner asked for: does a planner with no combos written into it find
 * useful two- and three-card combinations by itself, in the real engine? Each check prints what
 * it saw (run with --silent=false); the README records a run.
 */

const GREEDY: Search = { depth: 1, width: 4, rollouts: 80, ownHurt: 1 };
const DEEP: Search = { depth: 2, width: 4, rollouts: 80, ownHurt: 1 };
const LIVE: Search = { depth: 2, width: 4, rollouts: 16, ownHurt: 1 };
const FIGHTS = 30;
const CAP = 8;

const top = (s: { ranked: readonly { sequence: readonly string[]; value: number }[] }) =>
  s.ranked
    .slice(0, 4)
    .map((r) => `${r.sequence.join(' > ')} (${r.value.toFixed(1)})`)
    .join(' | ');

const setUp = () =>
  duel(fighter('me', [spark, flash, burst], { stats: { taijutsu: 8 } }), fighter('foe', []));
const hidden = () =>
  duel(
    fighter('me', [spark, veil, blade], { stats: { taijutsu: 8, genjutsu: 28 } }),
    fighter('foe', [spark], { stats: { stamina: 28 } }),
  );

function summary(label: string, results: readonly FightResult[]): { won: number; taken: number } {
  const won = results.filter((r) => r.won).length;
  const mean = (k: 'dealt' | 'taken') => results.reduce((t, r) => t + r[k], 0) / results.length;
  const decisions = results.reduce((t, r) => t + r.chose.length, 0);
  const ms = results.reduce((t, r) => t + r.planMs, 0) / Math.max(1, decisions);
  const openings = new Map<string, number>();
  for (const r of results) {
    const key = r.chose.slice(0, 2).join(' > ');
    if (key) openings.set(key, (openings.get(key) ?? 0) + 1);
  }
  const usual = [...openings].sort((a, b) => b[1] - a[1]).slice(0, 2);
  console.log(
    `${label}: won ${won}/${results.length}, dealt ${mean('dealt').toFixed(0)}, taken ${mean('taken').toFixed(0)}` +
      (decisions
        ? `, ${ms.toFixed(0)} ms a decision, usual opening ${usual.map(([k, v]) => `${k} ×${v}`).join(', ')}`
        : ''),
  );
  return { won, taken: mean('taken') };
}

describe('the planner finds combinations nobody wrote', () => {
  it('has no combo, technique or verb named in it', () => {
    for (const file of ['beam.ts', 'forward.ts', 'fight.ts']) {
      const code = readFileSync(new URL(file, import.meta.url), 'utf8').replace(
        /\/\*[\s\S]*?\*\/|\/\/.*$/gm,
        '',
      );
      expect(code).not.toMatch(
        /daze|conceal|lethal|needsTarget|hidden|flash|burst|veil|blade|gather/i,
      );
    }
  });

  it('daze, then the finisher: found by looking two ahead, missed by greedy', () => {
    const s = setUp();
    const greedy = plan(s, 'me', GREEDY);
    const deep = plan(s, 'me', DEEP);
    console.log(
      'default plan up close:',
      s.fighters[0]!.loadout.close.map((x) => x.card).join(', '),
    );
    console.log('greedy:', top(greedy));
    console.log('depth 2:', top(deep));
    expect(greedy.best.sequence[0]).not.toBe('jutsu:flash');
    expect(deep.best.sequence).toEqual(['jutsu:flash', 'jutsu:burst']);
  });

  it('hide, then the killing blow: found by looking two ahead, missed by greedy', () => {
    const s = hidden();
    const greedy = plan(s, 'me', GREEDY);
    const deep = plan(s, 'me', DEEP);
    console.log('greedy:', top(greedy));
    console.log('depth 2:', top(deep));
    expect(greedy.best.sequence[0]).not.toBe('jutsu:veil');
    expect(deep.best.sequence).toEqual(['jutsu:veil', 'jutsu:blade']);
  });

  it('a belief changes how much a plan is worth: sharp eyes make hiding a worse bet', () => {
    const s = hidden();
    const trusting = plan(s, 'me', DEEP);
    const wary = plan(s, 'me', { ...DEEP, belief: { foe: { perception: 60, intellect: 60 } } });
    console.log('believes them ordinary:', top(trusting));
    console.log('believes them sharp-eyed:', top(wary));
    expect(wary.best.value).toBeLessThan(trusting.best.value);
  });

  it('plays better whole fights in the real engine, closed loop', () => {
    for (const [name, make] of [
      ['daze-finish', setUp],
      ['hide-lethal', hidden],
    ] as const) {
      const run = (search?: Search) =>
        Array.from({ length: FIGHTS }, (_, i) =>
          fightWith(make(), 'me', { seed: i + 1, cap: CAP, ...(search ? { search } : {}) }),
        );
      const today = summary(`${name}, default plan`, run());
      summary(`${name}, greedy`, run({ ...LIVE, depth: 1 }));
      const planned = summary(`${name}, depth 2`, run(LIVE));
      expect(planned.won).toBeGreaterThan(today.won);
      expect(planned.taken).toBeLessThan(today.taken);
    }
  });
});

describe('reactions it induces', () => {
  // A foe whose chakra is spent and who reads the fight won't gather up close, where it would be
  // punished, but will a step away (`resting.ts`); gathering leaves it open (`GATHER_OPEN`).
  const bolt: CombatTechnique = {
    id: 'bolt',
    name: 'Bolt',
    discipline: 'ninjutsu',
    reach: ['close', 'mid', 'far'],
    effects: [{ verb: 'damage', power: 18 }],
    chakraCost: 14,
  };
  const comet: CombatTechnique = {
    id: 'comet',
    name: 'Comet',
    discipline: 'ninjutsu',
    reach: ['close', 'mid', 'far'],
    accuracy: 'wild',
    effects: [{ verb: 'damage', power: 40 }],
    chakraCost: 14,
  };
  const dry = (intellect: number) =>
    duel(
      fighter('me', [spark, comet], { stats: { taijutsu: 10, speed: 28, stamina: 30 } }),
      fighter('foe', [bolt], {
        chakra: 6,
        stats: { intellect, taijutsu: 4, strength: 4, speed: 14, perception: 58, willpower: 40 },
      }),
    );
  const gathers = (s: ReturnType<typeof dry>, sequence: string[]) =>
    Array.from({ length: 100 }, (_, i) =>
      rollout(s, 'me', { sequence, thenDefault: 0 }, i + 1),
    ).reduce((t, end) => t + end.log.filter((l) => /gather/i.test(l)).length, 0);

  it('are in the forward model: stepping back draws a gather from a sharp foe', () => {
    const sharp = dry(24);
    const close = gathers(sharp, ['jutsu:comet', 'jutsu:comet']);
    const away = gathers(sharp, ['step-back', 'jutsu:comet']);
    console.log(
      `sharp foe, gather lines over 100 rollouts: staying close ${close}, after a step back ${away}`,
    );
    expect(away).toBeGreaterThan(close + 20);
    const p = plan(sharp, 'me', { depth: 3, width: 6, rollouts: 60, ownHurt: 1 });
    console.log('depth 3 against it:', top(p));
  });
});
