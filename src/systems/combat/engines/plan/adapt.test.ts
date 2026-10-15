import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { ADAPT_AFTER, beats, betweenRounds, walksInto } from './adapt';
import type { Card } from './cards';
import { chooseCard } from './choose';
import { useJutsu } from './jutsu';
import { plannedPlay } from './priority';
import { noteAttack, readOf, styleOf } from './reads';
import { initialFighters, plainSlots, type PlanFighter, type Reads, type Round } from './state';

const attributes = {
  strength: 5,
  speed: 5,
  stamina: 20,
  chakraControl: 5,
  intellect: 5,
  perception: 5,
  willpower: 5,
  taijutsu: 20,
  ninjutsu: 20,
  genjutsu: 20,
  kenjutsu: 5,
  fuuinjutsu: 5,
};

const jab: CombatTechnique = {
  id: 'jab',
  name: 'Jab',
  discipline: 'taijutsu',
  effects: [{ verb: 'damage', power: 12 }],
  chakraCost: 2,
};
const barrage: CombatTechnique = {
  id: 'barrage',
  name: 'Barrage',
  discipline: 'taijutsu',
  effects: [{ verb: 'damage', power: 12, hits: 3 }],
  chakraCost: 4,
};
const bolt: CombatTechnique = {
  id: 'bolt',
  name: 'Bolt',
  discipline: 'ninjutsu',
  effects: [{ verb: 'damage', power: 12 }],
  chakraCost: 4,
};
const haze: CombatTechnique = {
  id: 'haze',
  name: 'Haze',
  discipline: 'genjutsu',
  effects: [{ verb: 'damage', power: 12 }],
  chakraCost: 4,
};
const smash: CombatTechnique = {
  id: 'smash',
  name: 'Smash',
  discipline: 'taijutsu',
  effects: [{ verb: 'break', power: 12 }],
  chakraCost: 4,
};

const card = (technique: CombatTechnique): Card => ({ kind: 'jutsu', technique });

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 80,
    maxHealth: 80,
    chakra: 40,
    maxChakra: 40,
    techniques: [],
    ...overrides,
  };
}

/** A hero against a bandit who knows these techniques and slots them up close, in order. */
function face(techniques: readonly CombatTechnique[], reads?: Reads): Round {
  const fighters = initialFighters({
    player: setup('hero'),
    allies: [],
    enemies: [setup('bandit', { techniques })],
    canFlee: true,
  }).map((f) =>
    f.id === 'bandit'
      ? {
          ...f,
          loadout: { close: plainSlots(techniques.map((t) => `jutsu:${t.id}`)), mid: [], far: [] },
        }
      : f,
  );
  return {
    number: 1,
    fighters,
    range: 'close',
    lines: [],
    seen: {},
    intents: {},
    ...(reads ? { reads } : {}),
  };
}

const seenKeeping = (defence: 'guard' | 'dodge' | 'counter' | 'swap'): Reads => ({
  hero: { defences: { close: defence }, attacks: {} },
});

function banditPlays(round: Round): string {
  const bandit = round.fighters.find((f) => f.id === 'bandit')!;
  const { card: played } = plannedPlay(bandit, round);
  return played.kind === 'jutsu' ? played.technique.id : played.kind;
}

describe('reading a fight', () => {
  it('tells attacks apart by how they meet a defence', () => {
    expect(styleOf({ kind: 'strike' })).toBe('blow');
    expect(styleOf(card(jab))).toBe('blow');
    expect(styleOf(card(barrage))).toBe('flurry');
    expect(styleOf(card(smash))).toBe('break');
    expect(styleOf(card(haze))).toBe('illusion');
    expect(styleOf(card(bolt))).toBe('jutsu');
    expect(styleOf({ kind: 'guard' })).toBeNull();
  });

  it('notes every attack thrown and the defence that answered it', () => {
    const round = noteAttack(noteAttack(face([]), 'hero', card(bolt)), 'hero', card(bolt));
    expect(readOf(round.reads, 'hero').attacks).toEqual({ jutsu: 2 });
    const guarding = face([]);
    const ready = {
      ...guarding,
      fighters: guarding.fighters.map((f) =>
        f.id === 'bandit' ? { ...f, reactions: { close: 'guard', mid: 'guard', far: 'guard' } } : f,
      ),
    };
    const [hero, bandit] = ready.fighters;
    const after = useJutsu(ready, { actor: hero!, target: bandit, rng: createRng(1) }, jab);
    expect(readOf(after.reads, 'bandit').defences.close).toBe('guard');
  });

  it('knows what gets past each defence, by the rules', () => {
    expect(beats(card(smash), 'guard')).toBe(true);
    expect(beats(card(barrage), 'guard')).toBe(true);
    expect(beats(card(jab), 'guard')).toBe(false);
    expect(beats(card(haze), 'dodge')).toBe(true);
    expect(beats(card(bolt), 'counter')).toBe(true);
    expect(beats(card(haze), 'swap')).toBe(true);
    expect(beats(card(bolt), 'swap')).toBe(false);
    expect(walksInto(card(jab), 'counter')).toBe(true);
    expect(walksInto({ kind: 'strike' }, 'counter')).toBe(true);
    expect(walksInto(card(bolt), 'counter')).toBe(false);
  });
});

describe('foes put what they read to use', () => {
  it('play their plan as written until they have seen your defence', () => {
    expect(banditPlays(face([jab, barrage, haze]))).toBe('jab');
  });

  it('reach past a seen Guard with a flurry, and past a seen Dodge with an illusion', () => {
    expect(banditPlays(face([jab, barrage, haze], seenKeeping('guard')))).toBe('barrage');
    expect(banditPlays(face([jab, barrage, haze], seenKeeping('dodge')))).toBe('haze');
  });

  it('hold a blow back from a seen Counter', () => {
    expect(banditPlays(face([jab, haze], seenKeeping('counter')))).toBe('haze');
    // With nothing else to throw, the blow still comes.
    expect(banditPlays(face([jab], seenKeeping('counter')))).toBe('jab');
  });

  it('lean on what beats your defence when acting on instinct', () => {
    const count = (reads?: Reads) => {
      const round = face([jab, smash], reads);
      const bandit = round.fighters.find((f) => f.id === 'bandit')!;
      const hero = round.fighters.find((f) => f.id === 'hero');
      let smashes = 0;
      for (let seed = 1; seed <= 400; seed++) {
        const moment = { band: 'close' as const, foe: hero, ...(reads ? { reads } : {}) };
        const played = chooseCard(bandit, moment, createRng(seed));
        if (played.kind === 'jutsu' && played.technique.id === 'smash') smashes++;
      }
      return smashes;
    };
    expect(count(seenKeeping('guard'))).toBeGreaterThan(count() * 1.3);
  });
});

describe('between rounds', () => {
  function rethought(attacks: Partial<Record<'blow' | 'break' | 'illusion', number>>) {
    const round = face([]);
    const keepGuard = (f: PlanFighter): PlanFighter => ({
      ...f,
      reactions: { close: 'guard', mid: 'guard', far: 'guard' },
    });
    const fighters = round.fighters.map(keepGuard);
    const reads: Reads = { hero: { defences: {}, attacks } };
    return betweenRounds(fighters, reads);
  }

  it('a foe trades a smashed Guard for a Dodge once it has seen enough', () => {
    const after = rethought({ break: ADAPT_AFTER + 1 });
    expect(after.find((f) => f.id === 'bandit')?.reactions?.close).toBe('dodge');
    // Your own side keeps the defences you chose.
    expect(after.find((f) => f.id === 'hero')?.reactions?.close).toBe('guard');
  });

  it('keeps its defence on too little to go on, or when it already meets the attacks', () => {
    expect(
      rethought({ break: ADAPT_AFTER - 1 }).find((f) => f.id === 'bandit')?.reactions?.close,
    ).toBe('guard');
    expect(rethought({ illusion: 5 }).find((f) => f.id === 'bandit')?.reactions?.close).toBe(
      'guard',
    );
  });

  it('keeps a Guard against plain blows: a Counter meets them no better', () => {
    const after = rethought({ blow: 6 }).find((f) => f.id === 'bandit');
    expect(after?.reactions).toEqual({ close: 'guard', mid: 'guard', far: 'guard' });
  });
});
