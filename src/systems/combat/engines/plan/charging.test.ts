import { createRng } from '@/core';

import { splitNarration } from '../../rules/narration';
import type { CombatantSetup, CombatTechnique } from '../../contract';
import { defaultLoadout } from './defaults';
import { plannedPlay } from './priority';
import { charge } from './steps';
import { initialFighters, type PlanFighter, type Round } from './state';
import { isEntry } from './stepping';

/** Closing in: readying the charge, entries, and the holder's fire told as theirs. */

const attributes = {
  strength: 20,
  speed: 20,
  stamina: 20,
  chakraControl: 10,
  intellect: 20,
  perception: 10,
  willpower: 10,
  taijutsu: 20,
  ninjutsu: 30,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const entry: CombatTechnique = {
  id: 'entry',
  name: 'Flying Kick',
  discipline: 'taijutsu',
  reach: ['close', 'mid'],
  effects: [
    { verb: 'move', to: 'close', power: 6 },
    { verb: 'break', power: 14 },
  ],
  chakraCost: 6,
};
const gate: CombatTechnique = {
  id: 'gate',
  name: 'Gate',
  discipline: 'taijutsu',
  effects: [{ verb: 'empower', power: 12, boosts: ['speed'] }],
  chakraCost: 8,
};
const storm: CombatTechnique = {
  id: 'storm',
  name: 'Storm',
  discipline: 'ninjutsu',
  reach: ['close', 'mid'],
  effects: [{ verb: 'area', power: 18, size: 'wide' }],
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

function atMid(holds: boolean): Round {
  const fighters = initialFighters({
    player: setup('brawler', { techniques: [entry, gate], traits: ['brawler'] }),
    allies: [],
    enemies: [setup('caster', { techniques: [storm] })],
    canFlee: true,
  }).map((f): PlanFighter => {
    if (f.id === 'caster')
      return holds ? { ...f, holdOff: { close: null, mid: 'jutsu:storm', far: null } } : f;
    return { ...f, keepAt: 'close', loadout: defaultLoadout(f, []) };
  });
  return { number: 1, fighters, range: 'mid', lines: [], seen: {}, intents: {} };
}

describe('closing in', () => {
  it('a brawler’s plan for range readies the charge and goes in with an entry', () => {
    const [brawler] = atMid(false).fighters;
    const mid = brawler!.loadout.mid.map((s) => s.card);
    expect(mid).toEqual(expect.arrayContaining(['jutsu:gate', 'jutsu:entry']));
    expect(isEntry(brawler!, { kind: 'jutsu', technique: entry }, 'mid')).toBe(true);
    expect(isEntry(brawler!, { kind: 'jutsu', technique: entry }, 'close')).toBe(false);
  });

  it('powers up before the charge rather than stepping in cold', () => {
    const round = atMid(false);
    const play = plannedPlay(round.fighters[0]!, round);
    expect(play.card).toMatchObject({ kind: 'jutsu', technique: { id: 'gate' } });
  });

  it('once powered up, charges with the entry instead of a plain step', () => {
    const round = atMid(false);
    const [brawler, caster] = round.fighters;
    const empowered = {
      ...brawler!,
      empowered: { techniqueId: 'gate', added: {}, until: 9, healthPerExchange: 0 },
    };
    const play = plannedPlay(empowered, { ...round, fighters: [empowered, caster!] });
    expect(play.card).toMatchObject({ kind: 'jutsu', technique: { id: 'entry' } });
  });

  it('a charge stopped by a hold-off is told first, costs its chakra, and the fire is the holder’s', () => {
    const stopped = Array.from({ length: 30 }, (_, i) => {
      const round = atMid(true);
      const [brawler, caster] = round.fighters;
      const turn = { actor: brawler!, target: caster, rng: createRng(i + 1) };
      return charge(round, turn, { kind: 'jutsu', technique: entry });
    }).find((c) => c.stopped);
    expect(stopped).toBeDefined();
    const lines = stopped!.round.lines.map(splitNarration);
    expect(lines[0]?.text).toMatch(/Flying Kick/);
    expect(lines.slice(1).every((l) => l.actorId === 'caster')).toBe(true);
    expect(lines.some((l) => /too wide to slip|no gap in/.test(l.text))).toBe(true);
    expect(stopped!.round.fighters[0]!.chakra).toBeLessThan(60);
  });
});
