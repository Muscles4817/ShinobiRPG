import { splitNarration } from '../../rules/narration';
import type { CombatantSetup, CombatTechnique } from '../../contract';
import { initialFighters, type PlanFighter, type Round } from './state';
import { watchedBy } from './mimicry';

/** Mimicry: a technique watched is a technique copied, and put to use. */

const attributes = {
  strength: 10,
  speed: 10,
  stamina: 10,
  chakraControl: 10,
  intellect: 30,
  perception: 30,
  willpower: 10,
  taijutsu: 10,
  ninjutsu: 30,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const bullet: CombatTechnique = {
  id: 'bullet',
  name: 'Bullet',
  discipline: 'ninjutsu',
  effects: [{ verb: 'damage', power: 16 }],
  chakraCost: 10,
};

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 60,
    maxChakra: 60,
    techniques: [],
    ...overrides,
  };
}

function round(perks: CombatantSetup['perks'] = ['insight', 'mimicry']): Round {
  const fighters = initialFighters({
    player: setup('copier', { perks }),
    allies: [],
    enemies: [setup('user', { techniques: [bullet] })],
    canFlee: true,
  }).map((f): PlanFighter =>
    f.id === 'copier'
      ? { ...f, loadout: { close: [{ card: 'strike' }], mid: [{ card: 'throw' }], far: [] } }
      : f,
  );
  return { number: 1, fighters, range: 'mid', lines: [], seen: {}, intents: {} };
}

const copier = (r: Round) => r.fighters.find((f) => f.id === 'copier')!;
const user = (r: Round) => r.fighters.find((f) => f.id === 'user')!;

describe('mimicry', () => {
  it('copies a technique watched: into the kit and the plan, told as the copier’s', () => {
    const r = round();
    const after = watchedBy(r, user(r), bullet);
    expect(copier(after).techniques.map((t) => t.id)).toContain('bullet');
    expect(copier(after).copied).toEqual(['bullet']);
    expect(copier(after).loadout.mid.map((s) => s.card)).toEqual(['throw', 'jutsu:bullet']);
    const told = splitNarration(after.lines.at(-1)!);
    expect(told.text).toMatch(/takes? in every seal of Bullet/);
    expect(told.actorId).toBe('copier');
  });

  it('copies nothing without the perk, or while dazed', () => {
    const plain = round(['insight']);
    expect(watchedBy(plain, user(plain), bullet).lines).toEqual([]);
    const r = round();
    const dazed = {
      ...r,
      fighters: r.fighters.map((f) => (f.id === 'copier' ? { ...f, stunned: 1 } : f)),
    };
    expect(watchedBy(dazed, user(dazed), bullet).lines).toEqual([]);
  });
});
