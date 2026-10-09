import { createRng } from '@/core';

import type { CombatantSetup, CombatEngine, CombatState, CombatTechnique } from '../../contract';
import { buildDeck, techniquePoints } from './cards';
import { createDeckEngine } from './engine';
import { describeIntent } from './enemy';
import { decode, initialFighters } from './state';

const attributes = {
  strength: 5,
  speed: 5,
  stamina: 5,
  chakraControl: 5,
  intellect: 5,
  perception: 5,
  willpower: 5,
  taijutsu: 5,
  ninjutsu: 5,
  genjutsu: 5,
  kenjutsu: 5,
  fuuinjutsu: 5,
};

function fighter(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 50,
    maxHealth: 50,
    chakra: 30,
    maxChakra: 30,
    techniques: [],
    ...overrides,
  };
}

const fireball: CombatTechnique = {
  id: 'fireball',
  name: 'Fireball',
  discipline: 'ninjutsu',
  element: 'fire',
  effect: 'damage',
  chakraCost: 8,
  power: 14,
};

/** Plays every playable card each turn (attacks first), then ends the turn. */
function autoplay(engine: CombatEngine, state: CombatState, turns = 40): CombatState {
  let current = state;
  for (let i = 0; i < turns * 6 && !engine.outcome(current); i++) {
    const playable = engine
      .view(current)
      .options.filter((o) => !o.disabledReason && (o.kind === 'basic' || o.kind === 'technique'));
    const pick = playable.find((o) => o.targeted) ?? playable[0];
    const next = engine.act(current, { optionId: pick?.id ?? 'end' }, createRng(i + 3));
    if (!next.ok) throw new Error(next.error);
    current = next.value;
  }
  return current;
}

describe('deck engine', () => {
  const engine = createDeckEngine();
  const start = (player = fighter('hero'), enemies = [fighter('bandit')]) =>
    engine.start({ player, allies: [], enemies, canFlee: true }, createRng(1));

  it('builds a deck of basics plus one card per technique', () => {
    const deck = buildDeck([fireball]);
    expect(deck).toHaveLength(9);
    expect(deck.filter((c) => c.kind === 'jutsu')).toHaveLength(1);
    expect(new Set(deck.map((c) => c.uid)).size).toBe(9);
    expect(techniquePoints(fireball)).toBe(2);
  });

  it('opens with a hand of five, three actions and an intent per enemy', () => {
    const view = engine.view(start());
    expect(view.options.filter((o) => o.id.startsWith('card:'))).toHaveLength(5);
    expect(view.meters?.find((m) => m.id === 'actions')?.value).toBe(3);
    expect(view.combatants.find((c) => c.id === 'bandit')?.intent).toBeTruthy();
    expect(view.range).toBe('mid');
  });

  it('playing a card spends actions and moves it to the discard pile', () => {
    const state = start();
    const card = engine
      .view(state)
      .options.find((o) => o.id.startsWith('card:') && !o.disabledReason)!;
    const next = engine.act(state, { optionId: card.id }, createRng(2));
    if (!next.ok) throw new Error(next.error);
    const deck = decode(next.value);
    expect(deck.points).toBe(3 - (card.cost ?? 1));
    expect(deck.hand).toHaveLength(4);
    expect(deck.discard).toHaveLength(1);
  });

  it('ending the turn lets enemies act and deals a fresh hand', () => {
    const next = engine.act(start(), { optionId: 'end' }, createRng(2));
    if (!next.ok) throw new Error(next.error);
    const deck = decode(next.value);
    expect(deck.round).toBe(2);
    expect(deck.hand).toHaveLength(5);
    expect(deck.points).toBe(3);
  });

  it('a much stronger fighter wins', () => {
    const strong = fighter('hero', { attributes: { ...attributes, strength: 40, taijutsu: 40 } });
    const end = autoplay(engine, start(strong));
    expect(engine.outcome(end)?.result).toBe('victory');
  });

  it('insight reveals which jutsu an enemy is preparing', () => {
    const [plain, enemy] = initialFighters({
      player: fighter('hero'),
      allies: [],
      enemies: [fighter('bandit')],
      canFlee: true,
    });
    const intent = { kind: 'jutsu' as const, technique: fireball, estimate: 12 };
    expect(describeIntent(intent, plain!)).toBe('Forming hand seals…');
    expect(describeIntent(intent, { ...enemy!, perks: ['insight'] })).toBe('Fireball, about 12');
  });

  it('footwork is always available and costs one action', () => {
    const state = start();
    const stepped = engine.act(state, { optionId: 'step-in' }, createRng(2));
    if (!stepped.ok) throw new Error(stepped.error);
    expect(decode(stepped.value)).toMatchObject({ range: 'close', points: 2 });
    const option = engine.view(stepped.value).options.find((o) => o.id === 'step-in');
    expect(option?.disabledReason).toBe('Already close');
  });

  it('cards out of reach say so', () => {
    const state = start();
    const deck = decode(state);
    const strike = deck.hand.find((c) => c.kind === 'strike');
    if (!strike) return;
    const option = engine.view(state).options.find((o) => o.id === `card:${strike.uid}`);
    expect(option?.disabledReason).toBe('Out of reach at mid range');
  });

  it('rejects state from another engine', () => {
    expect(() => engine.view({ engineId: 'other', data: {} })).toThrow();
  });
});
