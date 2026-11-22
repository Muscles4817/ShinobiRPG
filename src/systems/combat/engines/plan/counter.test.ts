import { told } from '@/test/fightLines';
import { createRng } from '@/core';
import { COUNTER_WAITS } from '../../rules/counters';
import { tell, type Told } from '../../rules/telling';

import type { CombatantSetup, CombatAttributes } from '../../contract';
import { counterOn, type Coming } from './counter';
import { counterRisk } from './counterRisk';
import { CLEAN, LATE, MISSED, WAITING } from './counterLines';
import { react, type Blow } from './react';
import { readyDefences } from './readiness';
import { fighterIn, initialFighters, type PlanFighter, type Round } from './state';

/** Counters: slotted, waiting for one kind of attack, read cleanly, late or wrong. */

const stats = (over: Partial<CombatAttributes>): CombatAttributes => ({
  strength: 20,
  speed: 20,
  stamina: 20,
  chakraControl: 20,
  intellect: 20,
  perception: 20,
  willpower: 20,
  taijutsu: 20,
  ninjutsu: 20,
  genjutsu: 20,
  kenjutsu: 20,
  fuuinjutsu: 20,
  ...over,
});

const setup = (id: string, attributes: CombatAttributes): CombatantSetup => ({
  id,
  name: id,
  attributes,
  health: 100,
  maxHealth: 100,
  chakra: 100,
  maxChakra: 100,
  techniques: [],
});

function facing(reader: CombatAttributes, attacker: CombatAttributes): Round {
  const [me, foe] = initialFighters({
    player: setup('me', reader),
    allies: [],
    enemies: [setup('foe', attacker)],
    canFlee: true,
  });
  const waiting: PlanFighter = { ...me!, committed: 'counter' };
  return { number: 1, fighters: [waiting, foe!], range: 'close', story: [], seen: {}, intents: {} };
}

function coming(round: Round, over: Partial<Coming>, seed: number): Coming {
  return {
    attacker: round.fighters[1]!,
    target: round.fighters[0]!,
    what: 'Raikiri',
    came: 'blow',
    skill: round.fighters[1]!.attributes.taijutsu,
    opens: false,
    eyeContact: false,
    rng: createRng(seed),
    ...over,
  };
}

/** How each of 200 tries went: answered, turned aside, or let in. */
function tally(round: Round, over: Partial<Coming> = {}) {
  const counts = { clean: 0, late: 0, missed: 0 };
  for (let seed = 1; seed <= 200; seed++) {
    const after = counterOn(round, coming(round, over, seed));
    const foe = fighterIn(after.round, 'foe')!;
    if (foe.health < 100) counts.clean += 1;
    else if (after.stopped) counts.late += 1;
    else counts.missed += 1;
  }
  return counts;
}

const sharp = stats({ perception: 40, intellect: 40 });
const dull = stats({ perception: 8, intellect: 8 });
const fast = stats({ speed: 45, taijutsu: 45 });

describe('the counter system', () => {
  it('pays off against a committed attack read by sharp eyes', () => {
    const counts = tally(facing(sharp, stats({})), { opens: true });
    expect(counts.clean).toBeGreaterThan(150);
  });

  it('is a gamble for dull eyes against a fast attacker, and the misread leaves them open', () => {
    const round = facing(dull, fast);
    const counts = tally(round);
    expect(counts.missed).toBeGreaterThan(130);
    const after = counterOn(round, coming(round, {}, 3));
    const me = fighterIn(after.round, 'me')!;
    if (!after.stopped) expect(readyDefences(me, after.round)).toEqual([]);
  });

  it('waits only for what it waits for, and costs nothing else', () => {
    const round = facing(sharp, stats({}));
    const thrown = counterOn(round, coming(round, { came: 'thrown' }, 1));
    expect(thrown.round).toBe(round);
    expect(fighterIn(thrown.round, 'me')?.committed).toBe('counter');
  });

  it('answers one attack, then is spent', () => {
    const round = facing(sharp, stats({}));
    const once = counterOn(round, coming(round, { opens: true }, 1));
    expect(fighterIn(once.round, 'me')?.committed).toBeNull();
  });

  it('meets a plain blow in the hit path before any defence', () => {
    const round = facing(sharp, stats({}));
    const blow: Blow = {
      raw: 20,
      what: 'strike',
      dodgeable: true,
      physical: true,
      kind: 'blow',
      came: 'blow',
    };
    const hits = Array.from({ length: 60 }, (_, i) => {
      const after = react(round, {
        attacker: round.fighters[1]!,
        target: round.fighters[0]!,
        blow,
        rng: createRng(i + 1),
      });
      return fighterIn(after, 'me')!.health === 100;
    });
    expect(hits.filter(Boolean).length).toBeGreaterThan(30);
  });
});

describe('counter lines', () => {
  const you: Told = { id: 'p', name: 'You', grammar: 'you' };
  const named: Told = { id: 'f', name: 'Itachi', grammar: 'he' };
  it.each(COUNTER_WAITS)('tell waiting for and meeting a %s', (waits) => {
    for (const bank of [WAITING, CLEAN, LATE, MISSED]) {
      const lines = bank[waits];
      expect(lines.length).toBeGreaterThanOrEqual(3);
      for (const template of lines) {
        for (const [t, a] of [
          [you, named],
          [named, you],
        ] as const) {
          const text = told(tell(template, { t, a, what: 'Raikiri' })).text;
          expect(text).not.toMatch(/[{}\d]/);
        }
      }
    }
  });
});

describe('the counter’s risk on the plan screen', () => {
  it('names a foe too quick to read, and says when a counter should land', () => {
    const slow = facing(dull, fast);
    expect(counterRisk(slow.fighters[0]!, [slow.fighters[1]!])).toBe(
      'foe is too quick for you to read: a guess',
    );
    const sure = facing(sharp, stats({ speed: 10, taijutsu: 10 }));
    expect(counterRisk(sure.fighters[0]!, [sure.fighters[1]!])).toBe(
      'You read them well: it should land',
    );
  });
});

describe('a counter in the story', () => {
  // Bug #1: the line is told in the attacker's turn and names the counterer first, so a reader
  // guessing whom it was aimed at from its words had it backwards.
  it('says whose defence answered whose blow, and whose hurt it was', () => {
    const round = facing(stats({ perception: 60, intellect: 60 }), stats({ speed: 5 }));
    const seed = Array.from({ length: 200 }, (_, i) => i + 1).find(
      (s) => fighterIn(counterOn(round, coming(round, {}, s)).round, 'foe')!.health < 100,
    )!;
    const { story } = counterOn(round, coming(round, {}, seed)).round;
    const answer = story.find((e) => e.kind === 'told' && e.reactions?.length);
    expect(answer).toMatchObject({ reactions: [{ reaction: 'countered', by: 'me', on: 'foe' }] });
    expect(story).toContainEqual(expect.objectContaining({ kind: 'health', who: 'foe', by: 'me' }));
  });
});
