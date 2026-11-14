import { findCard, type Card } from '@/systems/combat/engines/plan/cards';
import type { PlanFighter } from '@/systems/combat/engines/plan/state';
import type { CombatTechnique } from '@/systems/combat/contract';

import { infer, type Reading } from './infer';
import { observe } from './observe';
import { cueProfile } from './profile';

/**
 * The model's key properties, on hand-built fighters (no fight needed): insight sees all, a hider
 * gives nothing, a sharp expert who out-reads a foe is sure and right, a dull observer gets a
 * class but no name, and a sharp expert sees through a feint that fools a dull eye.
 */

const ember: CombatTechnique = {
  id: 'ember',
  name: 'Ember',
  discipline: 'ninjutsu',
  element: 'fire',
  rank: 'C',
  reach: ['mid', 'far'],
  effects: [{ verb: 'damage', power: 30 }],
  chakraCost: 20,
};
const gust: CombatTechnique = {
  id: 'gust',
  name: 'Gust',
  discipline: 'ninjutsu',
  element: 'wind',
  rank: 'C',
  reach: ['mid', 'far'],
  effects: [{ verb: 'damage', power: 28 }],
  chakraCost: 18,
};

type Attrs = PlanFighter['attributes'];
const EVEN: Attrs = {
  strength: 11,
  speed: 11,
  stamina: 11,
  chakraControl: 10,
  intellect: 8,
  perception: 8,
  willpower: 8,
  taijutsu: 10,
  ninjutsu: 10,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
  reserves: 10,
};

function fighter(
  id: string,
  attrs: Partial<Attrs>,
  techniques: CombatTechnique[] = [],
): PlanFighter {
  // A bare fighter: only what the cue model reads (a trust boundary for the prototype's tests).
  return {
    id,
    attributes: { ...EVEN, ...attrs },
    techniques,
    items: [],
    perks: [],
    hidden: false,
    confused: 0,
  } as unknown as PlanFighter;
}

const actor = fighter('foe', {}, [ember, gust]);
const sharp = fighter('sharp', { perception: 20, intellect: 16, ninjutsu: 24, chakraControl: 18 });
const dull = fighter('dull', { perception: 4, intellect: 4, ninjutsu: 3 });

function reading(observer: PlanFighter, over: Partial<Reading> = {}, fight = 1): Reading {
  return {
    observer,
    actor,
    mind: {
      seenCards: ['jutsu:ember', 'jutsu:gust'],
      habits: { 'jutsu:ember': 1, 'jutsu:gust': 1 },
      insight: false,
    },
    moment: { fight, exchange: 3 },
    situation: {
      band: 'mid',
      exchange: 3,
      observerHidden: false,
      actorConfused: false,
      fieldUp: false,
    },
    ...over,
  };
}

const emberCard = findCard(actor, 'jutsu:ember')!;
const stepIn = findCard(actor, 'step-in')!;

function many(observer: PlanFighter, truth: Card, shown?: Card, over: Partial<Reading> = {}) {
  return Array.from({ length: 200 }, (_, i) => infer(reading(observer, over, i), truth, shown));
}

test('insight sees the card itself, named and sure', () => {
  const p = infer(
    reading(dull, { mind: { seenCards: [], habits: {}, insight: true } }),
    emberCard,
  )!;
  expect(p).toMatchObject({ predicted: 'technique', confidence: 'sure', named: 'jutsu:ember' });
});

test('a hidden actor gives nothing away', () => {
  const hidden = { ...actor, hidden: true } as PlanFighter;
  expect(infer({ ...reading(sharp), actor: hidden }, emberCard)).toBeNull();
});

test('a sharp expert who out-reads the foe is sure and right near-always', () => {
  const reads = many(sharp, emberCard);
  const right = reads.filter((p) => p?.named === 'jutsu:ember' && p.confidence === 'sure');
  expect(right.length / reads.length).toBeGreaterThan(0.95);
  expect(reads.filter((p) => p?.named && p.named !== 'jutsu:ember')).toHaveLength(0);
});

/** A watchful foe, well beyond the dull observer's eyes, met for the first time. */
const keen = fighter('keen', { perception: 14, speed: 14 }, [ember, gust]);
const firstMeeting: Partial<Reading> = {
  actor: keen,
  mind: { seenCards: [], habits: {}, insight: false },
};

test('a dull observer still gets a class, but rarely a name', () => {
  const reads = many(dull, findCard(keen, 'jutsu:ember')!, undefined, firstMeeting);
  expect(reads.every((p) => p !== null)).toBe(true);
  const classRight = reads.filter((p) => p!.predicted === 'technique').length / reads.length;
  const named = reads.filter((p) => p!.named).length / reads.length;
  expect(classRight).toBeGreaterThan(0.6);
  expect(named).toBeLessThan(0.3);
  expect(reads.some((p) => p!.confidence !== 'sure')).toBe(true);
});

test('a dull observer sees blurred cues: glimpses or nothing, never the element', () => {
  const sight = observe(reading(dull, firstMeeting), cueProfile(emberCard, keen));
  expect(sight.chakra?.value ?? 'missed').not.toBe('flare:fire');
});

test('a feint fools a dull eye and a sharp expert suspects it', () => {
  const dullReads = many(dull, stepIn, emberCard);
  const sharpReads = many(sharp, stepIn, emberCard);
  const fooled = (ps: typeof dullReads) =>
    ps.filter((p) => p?.predicted === 'technique' && !p.feint).length / ps.length;
  expect(fooled(dullReads)).toBeGreaterThan(0.6);
  expect(sharpReads.filter((p) => p?.feint).length / sharpReads.length).toBeGreaterThan(0.6);
});

test('no technique is named in the model by id', async () => {
  const { readFileSync } = await import('node:fs');
  for (const file of ['profile.ts', 'observe.ts', 'infer.ts']) {
    const text = readFileSync(new URL(`./${file}`, import.meta.url), 'utf8');
    expect(text).not.toMatch(/'jutsu:[a-z]/);
  }
});
