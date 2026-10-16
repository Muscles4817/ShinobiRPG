import { NARUTO_PACK } from './packs/naruto';
import { validateContent } from './validate';

/** Ladders: every step a technique needs can be opened, by the pack and by whoever fights with it. */

describe('ladders', () => {
  it('accepts the pack as written', () => {
    expect(validateContent(NARUTO_PACK)).toEqual([]);
  });

  it('needs anyone fighting with a gate art to hold the gates that open it', () => {
    const people = NARUTO_PACK.people.map((p) =>
      p.id === 'kakashi' ? { ...p, arsenal: { techniqueIds: ['daytime-tiger'] } } : p,
    );
    expect(validateContent({ ...NARUTO_PACK, people })).toContain(
      'person "kakashi" can\'t open the gates to step 7 that "daytime-tiger" needs',
    );
  });

  it('needs the pack’s openings to climb to every step needed, each within reach of the last', () => {
    const techniques = NARUTO_PACK.techniques.filter(
      (t) =>
        !['gate-of-wonder', 'gate-of-view', 'gate-of-limit', 'eight-gates-released'].includes(t.id),
    );
    const problems = validateContent({ ...NARUTO_PACK, techniques });
    expect(problems).toContain(
      'the pack can\'t open the gates to step 7 that "daytime-tiger" needs',
    );
  });

  it('needs a real step', () => {
    const techniques = NARUTO_PACK.techniques.map((t) =>
      t.id === 'daytime-tiger' ? { ...t, needsOpen: { ladder: 'gates' as const, step: 9 } } : t,
    );
    expect(validateContent({ ...NARUTO_PACK, techniques })).toContain(
      'technique "daytime-tiger" needs step 9 of the gates ladder (it runs 1 to 8)',
    );
  });
});
