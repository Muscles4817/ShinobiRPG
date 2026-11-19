import type { CombatTechnique } from '../../contract';
import { readingOf, tagsOf } from './tags';

/** How a technique works, read from what it says and laid under what was written by hand. */

function technique(over: Partial<CombatTechnique> & { description?: string }): CombatTechnique {
  return {
    id: 't',
    name: 'T',
    discipline: 'ninjutsu',
    effects: [{ verb: 'damage', power: 10 }],
    chakraCost: 0,
    ...over,
  };
}

describe('technique tags', () => {
  it('reads a grapple from its words, and asks for a body the user can lift', () => {
    const liger = technique({
      discipline: 'taijutsu',
      description: 'The foe is caught and lifted overhead, then driven into the ground.',
      effects: [
        { verb: 'damage', power: 28 },
        { verb: 'daze', power: 10 },
      ],
    });
    const tags = tagsOf(liger);
    expect(tags.delivery).toEqual(['grapple']);
    expect(tags.needs).toContain('liftable');
    expect(tags.lands).toEqual(['slammed', 'stunned']);
    expect(tags.catches).toBe('whole');
  });

  it('reads an illusion through the eyes as needing a mind that meets them, with no signs', () => {
    const look = technique({
      discipline: 'genjutsu',
      description: 'One look from the Sharingan.',
      effects: [{ verb: 'daze', power: 14 }],
    });
    const tags = tagsOf(look);
    expect(tags.delivery).toEqual(['eye-contact']);
    expect(tags.needs).toEqual(['mind', 'meets-eyes']);
    expect(tags.lands).toEqual(['frozen']);
    expect(tags.answeredBy).toContain('look-away');
    expect(tags.execution.handSigns).toBe(false);
  });

  it('reads trees from the ground as crushing what they bind, and burnable', () => {
    const forest = technique({
      description: 'Trees burst up and wind round everything in reach.',
      effects: [
        { verb: 'area', power: 22, size: 'wide' },
        { verb: 'pin', power: 16 },
      ],
    });
    const tags = tagsOf(forest);
    expect(tags.delivery).toEqual(['from-ground']);
    expect(tags.shape).toBe('zone');
    expect(tags.lands).toContain('crushed');
    expect(tags.answeredBy).toEqual(expect.arrayContaining(['burn', 'ally-frees']));
    expect(tags.execution.tell).toBe('loud');
  });

  it('keeps a plain blow a point strike, and is sure of it', () => {
    const jab = technique({ discipline: 'taijutsu', reach: ['close'] });
    const reading = readingOf(jab);
    expect(reading.tags.delivery).toEqual(['strike']);
    expect(reading.tags.catches).toBe('point');
    expect(reading.sure).toBe(true);
  });

  it('says when the delivery is only a guess from the art', () => {
    const vague = technique({ description: 'Something happens.' });
    expect(readingOf(vague).sure).toBe(false);
  });

  it('lets what was written by hand replace an axis, and keeps the rest read', () => {
    const push = technique({
      description: 'Everything in front of him is thrown away.',
      tags: { delivery: ['burst'], shape: 'burst', execution: { recovery: 1 } },
    });
    const reading = readingOf(push);
    expect(reading.tags.delivery).toEqual(['burst']);
    expect(reading.tags.execution.recovery).toBe(1);
    expect(reading.tags.execution.handSigns).toBe(true);
    expect(reading.written).toBe(true);
    expect(reading.sure).toBe(true);
  });

  it('keeps clones and power-ups as bodies and the self, with nothing to land', () => {
    const clone = technique({ effects: [{ verb: 'clone', power: 10 }] });
    const gate = technique({ effects: [{ verb: 'empower', power: 10, boosts: ['speed'] }] });
    expect(tagsOf(clone)).toMatchObject({ delivery: ['body'], shape: 'none', catches: 'none' });
    expect(tagsOf(gate).delivery).toEqual(['self']);
  });
});
