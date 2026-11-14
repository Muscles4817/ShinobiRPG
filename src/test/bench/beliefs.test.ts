import { vi } from 'vitest';

import { createRng } from '@/core';
import { createPlanEngine, type CombatEngine, type CombatState } from '@/systems/combat';
import { cardsFor, findCard, isOffence } from '@/systems/combat/engines/plan/cards';
import type * as Minds from '@/systems/combat/engines/plan/mind/beliefs';
import { held, type Sureness } from '@/systems/combat/engines/plan/mind';
import { defenceKind } from '@/systems/combat/engines/plan/reads';
import { decode, type PlanFighter } from '@/systems/combat/engines/plan/state';
import { hasVerb, isHindering } from '@/systems/combat/rules/verbs';

import { toSetup } from './fighters';
import { castMember, CAST_IDS, type CastId } from './matrixCast';
import { tracedSkirmish } from './runner';

/**
 * Beliefs (`engines/plan/mind/`) are shown only: a fight comes out the same, decision by decision,
 * whether or not anyone takes in what they saw. And what a mind says it is sure of is true of the
 * fighter as they stand: the defence they keep at a distance, what their kit can do, a pool run
 * low. Set `VITE_BENCH_REPORT=true` to print how often each sureness is right over the cast.
 */

const minds = vi.hoisted(() => ({ off: false }));

vi.mock('@/systems/combat/engines/plan/mind/beliefs', async (original) => {
  const real = await original<typeof Minds>();
  return {
    ...real,
    beliefsAfter: (round: Parameters<typeof real.beliefsAfter>[0]) => {
      if (!minds.off) return real.beliefsAfter(round);
      const { witnessed: _gone, ...rest } = round;
      return rest;
    },
  };
});

const PAIRS: readonly (readonly [CastId, CastId])[] = [
  ['rusher', 'counterer'],
  ['stalker', 'mistBlade'],
  ['medic', 'areaCaster'],
  ['sealer', 'foresight'],
];

describe('beliefs are shown only', () => {
  it.each(PAIRS)('%s against %s decides the same with no one taking anything in', (a, b) => {
    for (let seed = 1; seed <= 6; seed++) {
      const skirmish = {
        player: castMember(a, 'chunin'),
        allies: [],
        foes: [castMember(b, 'chunin')],
        watch: true,
      };
      minds.off = true;
      const blind = tracedSkirmish(skirmish, seed);
      minds.off = false;
      const seeing = tracedSkirmish(skirmish, seed);
      expect(seeing).toEqual(blind);
    }
  });
});

/** Whether a belief, by its key, is true of the fighter as they stand now. */
function isTrue(key: string, f: PlanFighter): boolean | null {
  const [family, a, b] = key.split(':');
  if (family === 'defence') {
    const id = f.reactions?.[a as 'close' | 'mid' | 'far'];
    const card = id ? findCard(f, id) : null;
    return (card ? defenceKind(card) : null) === b;
  }
  if (key === 'can:far') return cardsFor(f, 'far').some(isOffence);
  if (key === 'can:area') return f.techniques.some((t) => hasVerb(t, 'area'));
  if (key === 'can:hold') return f.techniques.some(isHindering);
  if (key === 'can:heal') return f.techniques.some((t) => hasVerb(t, 'heal'));
  if (key === 'low:chakra') return f.chakra < f.maxChakra * 0.35;
  return null;
}

/** One belief said, and whether it was true. */
interface Said {
  readonly family: string;
  readonly sureness: Sureness;
  readonly right: boolean;
}

/** Every belief worth saying that any mind holds now, checked against the fighter. */
function said(state: CombatState): Said[] {
  const plan = decode(state);
  return plan.fighters.flatMap((mind) =>
    Object.entries(mind.minds ?? {}).flatMap(([id, about]) => {
      const subject = plan.fighters.find((f) => f.id === id);
      if (!subject) return [];
      return held(mind, about, plan.round)
        .filter((h) => h.confidence >= 0.5)
        .flatMap((h) => {
          const truth = isTrue(h.key, subject);
          const family = h.key.split(':')[0] ?? h.key;
          return truth === null ? [] : [{ family, sureness: h.sureness, right: truth }];
        });
    }),
  );
}

/** Every exchange of a watched fight, as the engine leaves it. */
function exchanges(engine: CombatEngine, [a, b]: readonly [CastId, CastId], seed: number) {
  const rng = createRng(seed);
  let state = engine.start(
    {
      player: toSetup(castMember(a, 'chunin'), 'player'),
      allies: [],
      enemies: [toSetup(castMember(b, 'chunin'), 'foe')],
      canFlee: false,
      watch: true,
    },
    rng,
  );
  const states: CombatState[] = [];
  for (let n = 0; n < 60 && !engine.outcome(state); n++) {
    const next = engine.act(state, { optionId: 'next' }, rng);
    if (!next.ok) break;
    state = next.value;
    states.push(state);
  }
  return states;
}

function calibrate(cast: readonly CastId[], seeds: number): Said[] {
  const engine: CombatEngine = createPlanEngine();
  const pairs = cast.flatMap((a) => cast.map((b) => [a, b] as const));
  const runs = pairs.flatMap((p) => Array.from({ length: seeds }, (_, i) => [p, i + 1] as const));
  return runs.flatMap(([p, seed]) => exchanges(engine, p, seed).flatMap(said));
}

interface Rate {
  readonly right: number;
  readonly said: number;
}

function rateOf(lines: readonly Said[]): Rate {
  return { right: lines.filter((l) => l.right).length, said: lines.length };
}

const share = ({ right, said }: Rate) => (said === 0 ? 1 : right / said);

describe('what a mind is sure of is true', () => {
  it('is right when sure, and mostly right when fairly sure', () => {
    const lines = calibrate(['rusher', 'counterer', 'stalker', 'medic', 'areaCaster', 'gates'], 2);
    const sure = rateOf(lines.filter((l) => l.sureness === 'sure'));
    expect(sure.said).toBeGreaterThan(0);
    expect(share(sure)).toBeGreaterThanOrEqual(0.95);
    expect(share(rateOf(lines.filter((l) => l.sureness === 'fairly sure')))).toBeGreaterThanOrEqual(
      0.9,
    );
  }, 120_000);

  it.runIf(import.meta.env.VITE_BENCH_REPORT === 'true')(
    'prints calibration over the whole cast',
    () => {
      const lines = calibrate(CAST_IDS, 2);
      const groups = [...new Set(lines.map((l) => `${l.family} ${l.sureness}`))].sort();
      for (const group of groups) {
        const r = rateOf(lines.filter((l) => `${l.family} ${l.sureness}` === group));
        console.warn(`${group}: ${r.right}/${r.said} right (${(100 * share(r)).toFixed(1)}%)`);
      }
    },
    900_000,
  );
});
