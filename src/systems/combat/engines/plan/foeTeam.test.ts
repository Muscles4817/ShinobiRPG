import type { CombatantSetup, CombatTechnique } from '../../contract';
import { foeMarkFor, foeStances } from './foeTeam';
import { plannedPlay } from './priority';
import { initialFighters, type PlanFighter, type Round } from './state';
import { withStances } from './team';

const attributes = {
  strength: 10,
  speed: 10,
  stamina: 10,
  chakraControl: 10,
  intellect: 4,
  perception: 10,
  willpower: 10,
  taijutsu: 10,
  ninjutsu: 10,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};
/** A mind that reads a fight in the moment, and so can call the plays. */
const leader = { attributes: { ...attributes, intellect: 16 } };

const bind: CombatTechnique = {
  id: 'bind',
  name: 'Bind',
  discipline: 'genjutsu',
  effects: [{ verb: 'daze', power: 8 }],
  chakraCost: 4,
};

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 30,
    maxChakra: 30,
    techniques: [],
    ...overrides,
  };
}

function fight(enemies: CombatantSetup[], allies: CombatantSetup[] = []): PlanFighter[] {
  return initialFighters({ player: setup('hero'), allies, enemies, canFlee: true });
}

const brute = setup('brute', { ...leader, row: 'front', maxHealth: 140, health: 140 });
const thug = setup('thug', { row: 'front' });
const caster = setup('caster', { row: 'back', techniques: [bind] });

function stances(fighters: readonly PlanFighter[]) {
  return Object.fromEntries(foeStances(fighters).map((f) => [f.id, f.stance]));
}

describe('foes as a team', () => {
  it('a lone foe, or a pack with no one to lead it, fights by its own plan', () => {
    expect(stances(fight([brute])).brute).toBeUndefined();
    const dull = fight([{ ...brute, attributes }, thug]);
    expect(Object.values(stances(dull)).every((s) => s === undefined)).toBe(true);
    expect(foeMarkFor(dull)).toEqual({});
  });

  it('with someone to call the plays, the sturdiest covers the caster, who supports', () => {
    const team = stances(fight([brute, thug, caster]));
    expect(team.brute).toEqual({ kind: 'cover', covers: 'caster' });
    expect(team.caster).toEqual({ kind: 'support' });
    expect(team.thug).toEqual({ kind: 'press' });
    expect(team.hero).toBeUndefined();
  });

  it('mark whoever on your side would fall soonest, you on a tie', () => {
    const fighters = fight([brute, thug], [setup('ally')]);
    expect(foeMarkFor(fighters)).toEqual({ foeMark: 'hero' });
    const hurt = fighters.map((f) => (f.id === 'ally' ? { ...f, health: 40 } : f));
    expect(foeMarkFor(hurt)).toEqual({ foeMark: 'ally' });
  });

  it('those pressing go for the mark', () => {
    const fighters = withStances(foeStances(fight([brute, thug], [setup('ally')])));
    const round: Round = {
      number: 1,
      fighters: fighters.map((f) => (f.id === 'hero' ? { ...f, health: 30 } : f)),
      range: 'close',
      lines: [],
      seen: {},
      intents: {},
      foeMark: 'ally',
    };
    const thugNow = round.fighters.find((f) => f.id === 'thug')!;
    // Left to itself it would go for the most hurt, you; pressing, it goes for the mark.
    expect(plannedPlay(thugNow, round).target?.id).toBe('ally');
  });
});
