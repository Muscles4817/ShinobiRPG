import { createRng } from '@/core';
import type { TechniqueDef } from '@/systems/techniques';

import type { CombatantSetup, CombatCall } from '../../contract';
import type { CombatSwarm } from '../../swarmContract';
import { avoidOdds, techniqueIncoming } from './avoid';
import { playable } from './cards';
import { lostTurn } from './lostTurn';
import {
  hangsSlack,
  rethreading,
  slackTurn,
  threadsCutBy,
  threadsRetaken,
  threadsTaken,
} from './puppets';
import { canHit } from './rows';
import { readyDefences } from './readiness';
import { callSummon } from './summons';
import { settleOn } from './swarm';
import { intercept } from './team';
import { fighterIn, initialFighters, patch, type Round } from './state';
import { wound } from './wound';

/** Puppets on threads: driven by their master, limited by attention, cut off by what stops them. */

const attributes = {
  strength: 10,
  speed: 10,
  stamina: 10,
  chakraControl: 16,
  intellect: 20,
  perception: 18,
  willpower: 10,
  taijutsu: 10,
  ninjutsu: 10,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

function technique(id: string, over: Partial<TechniqueDef>): TechniqueDef {
  return {
    id,
    name: id,
    description: id,
    discipline: 'ninjutsu',
    effects: [{ verb: 'damage', power: 10 }],
    chakraCost: 5,
    rank: 'E',
    difficulty: 20,
    ...over,
  };
}

const unseal = (call: string) =>
  technique(`unseal-${call}`, { effects: [{ verb: 'summon', power: 1, call }] });
const FIREBALL = technique('fireball', { element: 'fire' });
const NEEDLES = technique('needles', { discipline: 'kenjutsu' });
const ILLUSION = technique('illusion', { discipline: 'genjutsu' });
const SWARM = technique('swarm', { swarmCost: 10 });

function setup(id: string, over: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 80,
    maxChakra: 80,
    techniques: [],
    ...over,
  };
}

const frame = { ...attributes, strength: 30, kenjutsu: 30, speed: 30, intellect: 0 };
const puppet = (id: string, over: Partial<CombatCall> = {}): CombatCall => ({
  id,
  body: setup(id, { attributes: frame, techniques: [NEEDLES] }),
  upkeep: 2,
  puppet: true,
  ...over,
});

const HIVE: CombatSwarm = {
  strain: {
    name: 'drainers',
    qualities: { speed: 3, bite: 3, toughness: 1, brood: 3, size: 3, senses: 3 },
    gifts: { drain: 3 },
    fears: ['fire'],
  },
  count: 100,
  cap: 100,
};

function round(control = 16, calls = [puppet('crow'), puppet('ant')]): Round {
  const fighters = initialFighters({
    player: setup('master', {
      attributes: { ...attributes, chakraControl: control },
      techniques: [unseal('crow'), unseal('ant'), FIREBALL, NEEDLES],
      calls,
    }),
    allies: [],
    enemies: [setup('foe', { techniques: [ILLUSION, SWARM], swarm: HIVE })],
    canFlee: true,
  });
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

const master = (r: Round) => fighterIn(r, 'master')!;
const crow = (r: Round) => fighterIn(r, 'master~crow')!;
const foe = (r: Round) => fighterIn(r, 'foe')!;
const jutsu = (t: TechniqueDef) => ({ kind: 'jutsu', technique: t }) as const;
const unsealed = (r: Round = round()) => callSummon(r, master(r), 'crow');

describe('a puppet on its master’s threads', () => {
  it('moves and strikes with its master’s hands and sees by their eyes', () => {
    const p = crow(unsealed());
    expect(p.puppet).toBe(true);
    expect(p.attributes.strength).toBe(30);
    expect(p.attributes.kenjutsu).toBe(16);
    expect(p.attributes.speed).toBe(16);
    expect(p.attributes.intellect).toBe(20);
  });

  it('is one too many for a master whose control works only one at a time', () => {
    expect(playable(master(unsealed()), jutsu(unseal('ant')))).toBe(false);
    expect(playable(master(unsealed(round(23))), jutsu(unseal('ant')))).toBe(true);
  });

  it('keeps the master’s hands off signs, but not off a blade', () => {
    expect(playable(master(round()), jutsu(FIREBALL))).toBe(true);
    expect(playable(master(unsealed()), jutsu(FIREBALL))).toBe(false);
    expect(playable(master(unsealed()), jutsu(NEEDLES))).toBe(true);
  });

  it('hangs slack, with no defence, while its master is dazed', () => {
    const up = unsealed();
    const dazed = { ...up, fighters: patch(up.fighters, 'master', { stunned: 1 }) };
    expect(hangsSlack(dazed, crow(dazed))).toBe(true);
    expect(readyDefences(crow(dazed), dazed)).toEqual([]);
    expect(slackTurn(dazed, crow(dazed))?.lines.join(' ')).toMatch(/crow hangs slack on/i);
    expect(slackTurn(up, crow(up))).toBeNull();
  });

  it('slips when its master takes a hard hit, until their next turn', () => {
    const hit = wound(unsealed(), 'master', 30);
    expect(hangsSlack(hit, crow(hit))).toBe(true);
    expect(hangsSlack(wound(unsealed(), 'master', 10), crow(unsealed()))).toBe(false);
    const retaken = threadsRetaken(hit, 'master');
    expect(hangsSlack(retaken, crow(retaken))).toBe(false);
  });

  it('carries insects that land on it up the threads to its master', () => {
    const up = unsealed();
    const settled = settleOn(up, 'foe', [crow(up)], SWARM);
    expect(master(settled).settled?.hostId).toBe('foe');
    expect(crow(settled).settled).toBeUndefined();
    expect(settled.lines.join(' ')).toMatch(/up crow’s threads/i);
  });

  it('has no mind for an illusion to fool', () => {
    const up = unsealed();
    const incoming = techniqueIncoming(foe(up), crow(up), ILLUSION, 'close');
    expect(incoming && avoidOdds(up, incoming)).toBe(1);
  });
});

describe('a shell its master fights from inside', () => {
  const shelled = () => unsealed(round(16, [puppet('crow', { worn: true })]));

  it('takes the blows aimed at its master, but not an illusion', () => {
    const r = shelled();
    const turn = { actor: foe(r), target: master(r), rng: createRng(1) };
    expect(intercept(r, turn, jutsu(SWARM)).target?.id).toBe('master~crow');
    expect(intercept(r, turn, jutsu(ILLUSION)).target?.id).toBe('master');
  });
});

describe('eyes that see the threads', () => {
  const seer = (r: Round) => ({ ...foe(r), perks: ['all-seeing' as const] });

  it('cut them with a hit that lands on the puppet; plain eyes do not', () => {
    const up = unsealed();
    expect(hangsSlack(threadsCutBy(up, foe(up), crow(up)), crow(up))).toBe(false);
    const cut = threadsCutBy(up, seer(up), crow(up));
    expect(hangsSlack(cut, crow(cut))).toBe(true);
    expect(cut.lines.join(' ')).toMatch(/sees the threads/);
  });

  it('leave a slack puppet no wall: a blow reaches the master behind it', () => {
    const blow = { kind: 'strike' } as const;
    const behind = (r: Round): Round => ({
      ...r,
      fighters: r.fighters.map((f) => (f.id === 'master' ? { ...f, row: 'back' as const } : f)),
    });
    const up = behind(unsealed());
    expect(canHit(blow, master(up), up.fighters)).toBe(false);
    const cut = threadsCutBy(up, seer(up), crow(up));
    expect(canHit(blow, master(cut), cut.fighters)).toBe(true);
  });

  it('cost the master a turn for fresh threads, from the next exchange, and the next is clear', () => {
    const up = unsealed();
    const cut = threadsCutBy(up, seer(up), crow(up));
    expect(rethreading(cut, master(cut))).toBeNull();
    const later = { ...cut, number: cut.number + 1 };
    const retied = lostTurn(later, master(later));
    expect(retied?.lines.join(' ')).toMatch(/casts fresh threads to crow/i);
    expect(hangsSlack(retied!, crow(retied!))).toBe(true);
    const next = threadsTaken(retied!);
    expect(hangsSlack(next, crow(next))).toBe(false);
  });
});
