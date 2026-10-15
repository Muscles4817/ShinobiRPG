import { senseiWaysProblems, type PersonDef } from '@/content';
import { ctx, newGame } from '@/test/gameFixtures';

import { generatedWays, waysOf } from './sensei/generate';
import { weekPlan } from './sensei/plan';

/** Senseis a pack wrote no ways for get ways generated from an archetype, coherent every time. */

const goran = ctx.content.people.require('goran');
const yomi = ctx.content.people.require('yomi');

/** A sensei like `base` with no authored ways, under another id. */
function unwritten(base: PersonDef, id: string): PersonDef {
  const { ways: _ways, ...sensei } = base.sensei!;
  return { ...base, id, sensei };
}

describe('generated senseis', () => {
  const rolled = Array.from({ length: 200 }, (_, i) => unwritten(i % 2 ? goran : yomi, `gen-${i}`));

  it('always hang together, whatever the roll', () => {
    for (const person of rolled) {
      expect(senseiWaysProblems(person, generatedWays(person))).toEqual([]);
    }
  });

  it('are the same every time for the same person, and varied across people', () => {
    const [first] = rolled;
    expect(generatedWays(first!)).toEqual(generatedWays(first!));
    const kinds = new Set(rolled.map((p) => generatedWays(p).philosophy));
    expect(kinds.size).toBeGreaterThanOrEqual(5);
    const grips = new Set(rolled.map((p) => generatedWays(p).grip));
    expect(grips.size).toBe(3);
  });

  it('give way to authored ways, and are nothing for someone who isn’t a sensei', () => {
    expect(waysOf(goran)).toBe(goran.sensei!.ways);
    const plain = unwritten(goran, 'gen-plain');
    expect(waysOf(plain)).toEqual(generatedWays(plain));
    expect(waysOf(ctx.content.people.require('rin'))).toBeNull();
  });

  it('a distracted teacher is never the one who reads hidden talent', () => {
    const distracted = rolled.filter((p) => p.teacher?.quirk === 'distracted');
    expect(distracted.length).toBeGreaterThan(0);
    expect(distracted.every((p) => generatedWays(p).lens !== 'hidden-talent')).toBe(true);
  });

  it('run a week like any other', () => {
    const plain = unwritten(goran, 'gen-week');
    const plan = weekPlan(newGame(), plain, 0);
    expect(plan).toHaveLength(generatedWays(plain).cadence.sessions);
    expect(plan[0]?.kind).toBe('lesson');
  });
});
