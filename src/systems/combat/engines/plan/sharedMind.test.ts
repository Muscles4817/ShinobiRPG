import { createRng } from '@/core';
import type { TechniqueDef } from '@/systems/techniques';

import type { CombatantSetup, CombatCall } from '../../contract';
import { raiseCost } from '../../rules/minds';
import { killingMoment } from './avoid';
import { createPlanEngine } from './engine';
import { decide } from './round';
import { mindsAfter, mindsMark, stillFighting, watched } from './sharedMind';
import { kitCall } from './calling';
import { callSummon, summonsAfter } from './summons';
import { decode, initialFighters, type PlanFighter, type Round } from './state';

/**
 * Bodies of one mind (`sharedMind.ts`): one judgement, one mark, no blind spots; a hidden source
 * whose fall takes its bodies down; fallen bodies raised unless a seal holds them.
 */

const attributes = {
  strength: 10,
  speed: 10,
  stamina: 10,
  chakraControl: 10,
  intellect: 10,
  perception: 10,
  willpower: 10,
  taijutsu: 10,
  ninjutsu: 10,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const BLOW: TechniqueDef = {
  id: 'mask-strike',
  name: 'Mask Strike',
  description: 'A blow from a walking mask.',
  discipline: 'taijutsu',
  effects: [{ verb: 'damage', power: 10 }],
  chakraCost: 0,
  rank: 'E',
  difficulty: 10,
};

function setup(id: string, over: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 100,
    maxChakra: 100,
    techniques: [BLOW],
    ...over,
  };
}

const MIND = { id: 'keeper' };
const sharp = { ...attributes, intellect: 30 };

function keeperFight(): Round {
  const fighters = initialFighters({
    player: setup('you'),
    allies: [setup('friend')],
    enemies: [
      setup('keeper', { attributes: sharp, mind: { ...MIND, source: true }, perks: ['raises'] }),
      setup('mask-a', { mind: MIND }),
      setup('mask-b', { mind: MIND }),
    ],
    canFlee: false,
  });
  return { number: 3, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

const who = (r: Round, id: string) => r.fighters.find((f) => f.id === id)!;
function changed(r: Round, id: string, change: Partial<PlanFighter>): Round {
  return { ...r, fighters: r.fighters.map((f) => (f.id === id ? { ...f, ...change } : f)) };
}

describe('a shared mind', () => {
  it('thinks with the sharpest of it, and its source starts hidden and hard to find', () => {
    const r = keeperFight();
    expect(who(r, 'mask-a').attributes.intellect).toBe(30);
    expect(who(r, 'you').attributes.intellect).toBe(10);
    expect(who(r, 'keeper')).toMatchObject({ hidden: true });
    expect(who(r, 'keeper').concealment).toBeGreaterThan(30);
  });

  it('aims at its side’s mark, as one', () => {
    const r = { ...keeperFight(), foeMark: 'friend' };
    const foes = [who(r, 'you'), who(r, 'friend')];
    expect(mindsMark(who(r, 'mask-a'), foes, r)?.id).toBe('friend');
    expect(mindsMark(who(r, 'you'), foes, r)).toBeUndefined();
  });

  it('has no blind spots: nothing strikes a body unseen while another of it stands in sight', () => {
    const r = changed(keeperFight(), 'you', { hidden: true });
    const target = who(r, 'mask-a');
    expect(watched(r.fighters, target)).toBe(true);
    expect(killingMoment(who(r, 'you'), target, r.fighters).unseen).toBe(false);
    const alone = changed(r, 'mask-b', { health: 0 });
    expect(killingMoment(who(alone, 'you'), target, alone.fighters).unseen).toBe(true);
  });

  it('is beaten when its source falls, its bodies dropping with it', () => {
    const r = changed(keeperFight(), 'keeper', { health: 0, hidden: false });
    expect(stillFighting(r.fighters, who(r, 'mask-a'))).toBe(false);
    expect(decide(r.fighters)).toBe('victory');
    const after = mindsAfter(r);
    expect(who(after, 'mask-a').health).toBe(0);
    expect(after.lines.join(' ')).toMatch(/drops where/);
  });

  it('is beaten when every body falls, its source giving up the fight', () => {
    const noRaiser = changed(keeperFight(), 'keeper', { perks: [] });
    const r = changed(changed(noRaiser, 'mask-a', { health: 0 }), 'mask-b', { health: 0 });
    expect(decide(r.fighters)).toBe('victory');
    const after = mindsAfter(r);
    expect(who(after, 'keeper').health).toBe(0);
    expect(after.lines.join(' ')).toMatch(/gives up the fight/);
  });

  it('raises a body that fell, for chakra, giving a hidden raiser away a little', () => {
    const r = changed(keeperFight(), 'mask-a', { health: 0, fellAt: 3 });
    const after = mindsAfter(r);
    expect(who(after, 'mask-a').health).toBe(50);
    expect(who(after, 'mask-a').fellAt).toBeUndefined();
    expect(who(after, 'keeper').chakra).toBe(100 - raiseCost(who(r, 'keeper')));
    expect(who(after, 'keeper').exposure).toBe(1);
    expect(after.lines.join(' ')).toMatch(/stands up again/);
  });

  it('can’t raise a body that fell under a seal', () => {
    const r = changed(keeperFight(), 'mask-a', { health: 0, fellAt: 3, sealed: 2 });
    const after = mindsAfter(r);
    expect(who(after, 'mask-a').health).toBe(0);
    expect(after.lines.join(' ')).toMatch(/seal on mask-a holds/);
  });

  it('takes in a body called to share its caller’s mind', () => {
    const shared: CombatCall = { id: 'shade', body: setup('shade'), upkeep: 5, shared: true };
    const r0 = keeperFight();
    const caller = { ...who(r0, 'you'), attributes: sharp, calls: [shared] };
    const r = changed(r0, 'you', caller);
    const called = callSummon(r, caller, 'shade');
    const shade = called.fighters.find((f) => f.summoner === 'you')!;
    expect(shade.mind?.id).toBe('you');
    expect(shade.attributes.intellect).toBe(30);
  });

  it('calls bodies of its own mind at once against anyone strong, and they never go home hurt', () => {
    const raise: TechniqueDef = {
      ...BLOW,
      id: 'raise-two',
      discipline: 'ninjutsu',
      effects: [
        { verb: 'summon', power: 1, call: 'shade-a' },
        { verb: 'summon', power: 1, call: 'shade-b' },
      ],
    };
    const shade = (id: string): CombatCall => ({ id, body: setup(id), upkeep: 2, shared: true });
    const r0 = keeperFight();
    const caller = {
      ...who(r0, 'you'),
      techniques: [raise],
      calls: [shade('shade-a'), shade('shade-b')],
    };
    const r = changed(r0, 'you', caller);
    const call = kitCall(caller, { fighters: r.fighters, band: 'close' });
    expect(call).toMatchObject({ kind: 'jutsu', technique: { id: 'raise-two' } });
    const called = callSummon(callSummon(r, caller, 'shade-a'), who(r, 'you'), 'shade-b');
    const hurt = called.fighters.map((f) => (f.summoner === 'you' ? { ...f, health: 5 } : f));
    const kept = summonsAfter({ ...called, fighters: hurt });
    expect(kept.fighters.filter((f) => f.summoner === 'you')).toHaveLength(2);
  });

  it('a whole fight against a hidden source ends, one way or the other', () => {
    const engine = createPlanEngine();
    let state = engine.start(
      {
        player: setup('you', { attributes: { ...attributes, perception: 30, taijutsu: 25 } }),
        allies: [],
        enemies: keeperFight()
          .fighters.filter((f) => f.side === 'enemy')
          .map((f) => setup(f.id, { ...(f.mind ? { mind: f.mind } : {}), perks: f.perks })),
        canFlee: false,
        watch: true,
      },
      createRng(7),
    );
    const rng = createRng(8);
    const done = engine.act(state, { optionId: 'finish' }, rng);
    if (!done.ok) throw new Error(done.error);
    state = done.value;
    expect(decode(state).result).not.toBeNull();
  });
});
