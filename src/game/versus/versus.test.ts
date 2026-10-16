import { combatScene, combatScouting } from '@/game';
import { fightOut } from '@/test/gameFixtures';

import { contextForPack } from '../context';
import { createVersus } from './match';
import { versusRoster } from './roster';

/** Versus mode: any two of the pack's fighters, head to head, in a sandbox. */

const naruto = contextForPack('naruto')!;

function team(side: readonly string[], foes: readonly string[]) {
  const made = createVersus(naruto, { side, foes, seed: 7 });
  if (!made.ok) throw new Error(made.error);
  return made.value;
}

function bout(youId: string, foeId: string) {
  const made = createVersus(naruto, { side: [youId], foes: [foeId], seed: 7 });
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

  it('can be only watched: both sides fight on their own and the card names who won', () => {
    const made = createVersus(naruto, {
      side: ['person:kakashi'],
      foes: ['person:guy'],
      seed: 7,
      watch: true,
    });
    if (!made.ok) throw new Error(made.error);
    const view = combatScene(made.value, naruto)!;
    expect(view.log[0]).toBe('Kakashi Hatake against Might Guy.');
    expect(view.options.some((o) => o.kind === 'plan' || o.kind === 'escape')).toBe(false);
    const done = fightOut(made.value, naruto);
    const report = done.reports[0];
    expect(report?.kind === 'fight' && report.verdict).toMatch(/^(Kakashi Hatake|Might Guy) wins$/);
  });

  it('is fought on the ground picked, which its opening names', () => {
    const made = createVersus(naruto, {
      side: ['person:kakashi'],
      foes: ['person:guy'],
      seed: 7,
      ground: 'lake',
    });
    if (!made.ok) throw new Error(made.error);
    const view = combatScene(made.value, naruto)!;
    expect(view.log.join(' ')).toMatch(/Open water/);
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
    const made = createVersus(naruto, { side: ['person:nobody'], foes: ['person:guy'], seed: 1 });
    expect(made.ok).toBe(false);
  });
});

describe('versus team fights', () => {
  const team7 = ['person:kakashi', 'person:naruto', 'person:sasuke', 'person:sakura'];

  it('fields up to four a side, your allies under your orders', () => {
    const state = team(team7, ['enemy:zabuza', 'enemy:haku']);
    const view = combatScene(state, naruto)!;
    const ours = view.combatants.filter((c) => c.side === 'player');
    const theirs = view.combatants.filter((c) => c.side === 'enemy');
    expect(ours.map((c) => c.name)).toEqual(['Kakashi', 'Naruto', 'Sasuke', 'Sakura']);
    expect(theirs.map((c) => c.name)).toEqual(['Zabuza Momochi', 'Haku']);
    expect(view.options.some((o) => o.kind === 'order')).toBe(true);
    expect(state.versus?.foeName).toBe('Zabuza Momochi and Haku');
  });

  it('numbers a foe that stands more than once', () => {
    const state = team(['person:kakashi'], ['enemy:gozu', 'enemy:gozu']);
    const ids = combatScene(state, naruto)!
      .combatants.filter((c) => c.side === 'enemy')
      .map((c) => c.id);
    expect(new Set(ids).size).toBe(2);
  });

  it('refuses a person twice on one side, or a side of more than four', () => {
    const twice = createVersus(naruto, {
      side: ['person:kakashi', 'person:kakashi'],
      foes: ['person:guy'],
      seed: 1,
    });
    expect(twice).toEqual({ ok: false, error: 'Kakashi Hatake can’t stand twice on one side.' });
    const crowd = createVersus(naruto, {
      side: [...team7, 'person:guy'],
      foes: ['person:asuma'],
      seed: 1,
    });
    expect(crowd.ok).toBe(false);
  });

  it('plays a team bout to its result card', () => {
    const end = fightOut(team(team7, ['enemy:zabuza', 'enemy:haku']), naruto);
    expect(end.combat).toBeNull();
    expect(end.reports[0]?.kind).toBe('fight');
  });
});
