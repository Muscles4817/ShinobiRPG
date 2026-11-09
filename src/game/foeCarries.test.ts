import { ctx, newGame } from '@/test/gameFixtures';

import { enemyCombatant, enemyCombatantId } from './combatants';
import { scoutOpponents } from './scouting';

/** Foes known by their kit carry it into the fight: the gear they wear and a full pouch. */

const foe = (id: string) => enemyCombatant(ctx.content.enemies.require(id), 0, ctx);

describe('what foes carry into a fight', () => {
  it('wears the gear written for it, a weapon in hand and armour on', () => {
    const captain = foe('retainer-captain');
    expect(captain.gear?.held?.name).toBe('Kurogane Katana');
    expect(captain.gear?.armour?.level).toBe('plate');
    expect(foe('spear-footman').gear?.held?.weaponClass).toBe('polearm');
  });

  it('brings a full pouch of the tools written for it', () => {
    expect(foe('bandit-cutpurse').items).toEqual([
      expect.objectContaining({ id: 'smoke-bomb', count: 2 }),
    ]);
  });

  it('a foreign shinobi carries what their kind of shinobi does', () => {
    const scout = foe('foe-sakyugakure-scout-genin');
    expect(scout.items).toEqual([expect.objectContaining({ id: 'smoke-bomb', count: 1 })]);
    expect(scout.gear).toBeDefined();
  });

  it('a foe that carries nothing is armed as its kit suggests', () => {
    const wolf = foe('grey-wolf');
    expect(wolf.gear).toBeUndefined();
    expect(wolf.items).toBeUndefined();
  });
});

describe('what a read says a foe carries', () => {
  const state = newGame();
  const read = (id: string, knowledge: 'full' | 'glance', perception = 8) => {
    const eyes = {
      ...state,
      character: { ...state.character, stats: { ...state.character.stats, perception } },
    };
    return scoutOpponents(eyes, ctx, [enemyCombatantId(id, 0)], knowledge)[enemyCombatantId(id, 0)];
  };

  it('names the gear they wear, and in a fight the tools in their pouch', () => {
    const labels = read('hill-warlord', 'full')?.pools.map((p) => p.label);
    expect(labels).toEqual(['Kurogane Katana', 'Lacquered Cuirass', 'Soldier pill']);
  });

  it('a glance always sees what they wear, and sharp eyes see into the pouch more often', () => {
    const glances = [2, 40].map((perception) => read('bandit-cutpurse', 'glance', perception));
    expect(glances[1]?.pools.map((p) => p.label)).toContain('Smoke bomb');
    expect(read('hill-warlord', 'glance', 2)?.pools.map((p) => p.label)).toEqual(
      expect.arrayContaining(['Kurogane Katana', 'Lacquered Cuirass']),
    );
  });
});
