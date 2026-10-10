import { createRng } from '@/core';

import { DISPEL_CHAKRA } from '../../rules/conditions';

import type { CombatantSetup, CombatEngine, CombatState, CombatTechnique } from '../../contract';
import { buildDeck, playOn, techniquePoints } from './cards';
import { createDeckEngine } from './engine';
import { chooseIntent, describeIntent } from './enemy';
import {
  decode,
  encode,
  initialFighters,
  playerOf,
  type Card,
  type DeckFighter,
  type DeckState,
} from './state';

const rng = createRng;

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

  describe('combat kits', () => {
    const hero = fighter('hero');
    const fightersOf = (enemy: CombatantSetup, player = hero) =>
      initialFighters({ player, allies: [], enemies: [enemy], canFlee: true });
    const startWith = (enemy: CombatantSetup, player = hero) => start(player, [enemy]);
    const mutate = (state: CombatState, change: (d: DeckState) => DeckState) =>
      encode(change(decode(state)));
    const act = (state: CombatState, optionId: string, seed = 2, targetId?: string) => {
      const next = engine.act(
        state,
        { optionId, ...(targetId ? { targetId } : {}) },
        createRng(seed),
      );
      if (!next.ok) throw new Error(next.error);
      return next.value;
    };
    const cardOf = (state: CombatState, kind: string) =>
      decode(state).hand.find((c) => c.kind === kind);

    it('an archer never attacks up close: it backs off', () => {
      const [player, archer] = fightersOf(fighter('archer', { traits: ['archer'] }));
      for (let seed = 1; seed < 20; seed++) {
        expect(chooseIntent(archer!, player!, 'close', createRng(seed)).kind).toBe('step-back');
      }
      const close = act(startWith(fighter('archer', { traits: ['archer'] })), 'step-in');
      const intent = engine.view(close).combatants.find((c) => c.id === 'archer')?.intent;
      expect(intent).toBe('Backing off');
      const after = decode(act(close, 'end'));
      expect(playerOf(after).health).toBe(50);
      expect(after.range).toBe('mid');
    });

    it('a brawler closes in instead of attacking from a distance', () => {
      const state = startWith(fighter('brawler', { traits: ['brawler'] }));
      const view = engine.view(state);
      expect(view.combatants.find((c) => c.id === 'brawler')?.intent).toBe('Closing in');
      const after = decode(act(state, 'end'));
      expect(after.range).toBe('close');
      expect(playerOf(after).health).toBe(50);
    });

    it('armour turns physical blows but not jutsu', () => {
      const hit = (traits: NonNullable<CombatantSetup['traits']>, card: Card) => {
        const [player, enemy] = fightersOf(fighter('foe', { traits }));
        const played = playOn([player!, enemy!], { user: player!, target: enemy!, card }, rng(9));
        return 50 - played.fighters[1]!.health;
      };
      const strike: Card = { uid: 's', kind: 'strike' };
      const jutsu: Card = { uid: 'j', kind: 'jutsu', technique: fireball };
      expect(hit(['armoured'], strike)).toBeLessThan(hit([], strike));
      expect(hit(['armoured'], jutsu)).toBe(hit([], jutsu));
    });

    it('a hidden foe cannot be targeted until Search finds it', () => {
      const seer = fighter('hero', { perks: ['insight'] });
      const blind = startWith(fighter('ghost', { traits: ['illusionist'] }));
      const view = engine.view(blind);
      const ghost = view.combatants.find((c) => c.id === 'ghost');
      expect(ghost).toMatchObject({ targetable: false, intent: '???' });
      expect(ghost?.statuses).toContain('Hidden');
      for (const option of view.options.filter((o) => o.targeted)) {
        expect(option.disabledReason).toBe("You can't see them. Search or Dispel.");
      }
      expect(view.options.find((o) => o.id === 'search')).toMatchObject({ kind: 'move', cost: 1 });

      const state = startWith(fighter('ghost', { traits: ['illusionist'] }), seer);
      const kunai = cardOf(state, 'kunai') ?? cardOf(state, 'strike');
      expect(kunai).toBeTruthy();
      const refused = engine.act(
        state,
        { optionId: `card:${kunai!.uid}`, targetId: 'ghost' },
        rng(1),
      );
      expect(refused.ok).toBe(false);

      const found = act(state, 'search');
      expect(decode(found).fighters.find((f) => f.id === 'ghost')?.hidden).toBe(false);
      expect(decode(found).points).toBe(2);
      expect(engine.view(found).options.find((o) => o.id === 'search')).toBeUndefined();
    });

    it('Dispel spends chakra and an action, and needs enough of it', () => {
      const state = startWith(fighter('ghost', { traits: ['illusionist'] }));
      const after = decode(act(state, 'dispel'));
      expect(playerOf(after).chakra).toBe(30 - DISPEL_CHAKRA);
      expect(after.points).toBe(2);
      const drained = mutate(state, (d) => ({
        ...d,
        fighters: d.fighters.map((f) => (f.isPlayer ? { ...f, chakra: 2 } : f)),
      }));
      const option = engine.view(drained).options.find((o) => o.id === 'dispel');
      expect(option?.disabledReason).toBeTruthy();
    });

    it('a coward flees once badly hurt', () => {
      const [player, coward] = fightersOf(fighter('coward', { traits: ['coward'], health: 20 }));
      const card: Card = { uid: 's', kind: 'strike' };
      const played = playOn([player!, coward!], { user: player!, target: coward!, card }, rng(4));
      expect(played.fighters[1]!.health).toBe(0);
      expect(played.lines.at(-1)).toBe('coward flees!');
    });

    it('a confused player sometimes misfires, but never on a Guard', () => {
      const lines = (kind: string) =>
        Array.from({ length: 12 }, (_, seed) => {
          const state = mutate(start(), (d) => ({
            ...d,
            range: 'close',
            hand: [{ uid: 'x', kind: kind as Card['kind'] }],
            fighters: d.fighters.map((f) => (f.isPlayer ? { ...f, confused: 2 } : f)),
          }));
          return decode(act(state, 'card:x', seed)).log.at(-1);
        });
      expect(lines('strike')).toContain('Your senses lie to you. The attack goes wide.');
      expect(lines('guard')).not.toContain('Your senses lie to you. The attack goes wide.');
    });

    it('a fight saved before kits existed still views and plays', () => {
      const legacy = mutate(start(), (d) => ({
        ...d,
        fighters: d.fighters.map((f) => {
          const { traits: _t, hidden: _h, confused: _c, items: _i, ...old } = f;
          // Old saves lack the kit fields; the engine must fill them in.
          return old as DeckFighter;
        }),
      }));
      expect(engine.view(legacy).combatants).toHaveLength(2);
      expect(engine.view(legacy).options.some((o) => o.kind === 'item')).toBe(false);
      expect(decode(act(legacy, 'end')).round).toBe(2);
      expect(engine.outcome(mutate(legacy, (d) => ({ ...d, result: 'escaped' })))?.items).toEqual(
        {},
      );
    });
  });
});
