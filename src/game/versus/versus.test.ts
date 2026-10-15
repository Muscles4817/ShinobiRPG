import { combatScene, combatScouting } from '@/game';
import { fightOut } from '@/test/gameFixtures';

import { contextForPack } from '../context';
import { createVersus } from './match';
import { versusRoster } from './roster';

/** Versus mode: any two of the pack's fighters, head to head, in a sandbox. */

const naruto = contextForPack('naruto')!;

function bout(youId: string, foeId: string) {
  const made = createVersus(naruto, { youId, foeId, seed: 7 });
  if (!made.ok) throw new Error(made.error);
  return made.value;
}

describe('versus roster', () => {
  it('lists the pack’s shinobi by group, strongest first, then its foes', () => {
    const roster = versusRoster(naruto);
    const ids = roster.map((f) => f.id);
    expect(roster[0]?.group).toBe('Kage');
    expect(ids).toEqual(expect.arrayContaining(['person:kakashi', 'person:naruto']));
    expect(ids).not.toContain('person:teuchi');
    expect(roster.find((f) => f.id === 'person:kakashi')?.group).toBe('Jōnin');
    expect(roster.some((f) => f.group === 'Foes')).toBe(true);
    const jonin = roster.filter((f) => f.group === 'Jōnin').map((f) => f.power);
    expect(jonin).toEqual([...jonin].sort((a, b) => b - a));
  });
});

describe('versus bouts', () => {
  it('starts the fight at once, with your fighter as the sandbox’s character', () => {
    const state = bout('person:kakashi', 'person:guy');
    const kakashi = naruto.content.people.require('kakashi');
    expect(state.combat).not.toBeNull();
    expect(state.character.stats).toEqual(kakashi.stats);
    const view = combatScene(state, naruto)!;
    const foe = view.combatants.find((c) => c.side === 'enemy');
    expect(foe?.name).toBe('Might Guy');
    expect(Object.keys(combatScouting(state, naruto))).toEqual([foe?.id]);
  });

  it('can face a foe from the pack, or play as one', () => {
    const foe = versusRoster(naruto).find((f) => f.group === 'Foes')!;
    expect(bout('person:kakashi', foe.id).combat).not.toBeNull();
    expect(bout(foe.id, 'person:kakashi').combat).not.toBeNull();
  });

  it('ends on a result card, with nobody hurt for real and nothing learned', () => {
    const start = bout('person:kakashi', 'person:asuma');
    const end = fightOut(start, naruto);
    expect(end.combat).toBeNull();
    expect(end.combatFinale).not.toBeNull();
    expect(end.reports).toHaveLength(1);
    const [report] = end.reports;
    expect(report?.kind).toBe('fight');
    if (report?.kind !== 'fight') return;
    expect(report.enemies).toBe('Asuma Sarutobi');
    expect(report.taught).toBeUndefined();
    expect(end.character.stats).toEqual(start.character.stats);
    expect(end.character.injuries).toEqual(start.character.injuries);
  });

  it('refuses a pick the pack doesn’t have', () => {
    expect(createVersus(naruto, { youId: 'person:nobody', foeId: 'person:guy', seed: 1 }).ok).toBe(
      false,
    );
  });
});
