import type { Assessment } from './assess';
import type { Identity } from './identity';
import { choose, scored } from './objectives';

/** Choosing what to bring about (`objectives.ts`): scored, held with discipline, interrupted. */

const calm: Assessment = {
  killer: false,
  danger: 0.2,
  canEnd: false,
  openFoe: false,
  canSetUp: false,
  home: 'close',
  atHome: true,
  chakra: 1,
  breath: 1,
  health: 1,
  nothingInSight: false,
  canEscalate: false,
  climbs: false,
  canFight: true,
  outclassed: false,
};

const identity: Identity = {
  philosophy: { overwhelm: 0.4, outlast: 0.3, outwit: 0.2, protect: 0.1 },
  range: 'close',
  rangePull: 0.5,
  aggression: 0.5,
  risk: 0.5,
  resources: 0.5,
  adaptability: 0.5,
  deception: 0.3,
  discipline: 0.5,
};

describe('choosing an objective', () => {
  it('wears down when nothing else is on', () => {
    expect(choose(calm, identity, { held: undefined, now: 1 }).id).toBe('wear-down');
  });

  it('a killer in reach takes over at once, whatever is held', () => {
    const held = { id: 'wear-down' as const, since: 1 };
    expect(
      choose({ ...calm, killer: true }, { ...identity, discipline: 1 }, { held, now: 4 }).id,
    ).toBe('survive');
  });

  it('finishes a foe it can end, and looks for one it cannot see', () => {
    expect(choose({ ...calm, canEnd: true }, identity, { held: undefined, now: 1 }).id).toBe(
      'finish',
    );
    expect(
      choose({ ...calm, nothingInSight: true }, identity, { held: undefined, now: 1 }).id,
    ).toBe('find');
  });

  it('a deceptive mind sets up where a plain one wears down', () => {
    const chance = { ...calm, canSetUp: true };
    const trickster = {
      ...identity,
      deception: 0.9,
      philosophy: { overwhelm: 0.2, outlast: 0.2, outwit: 0.5, protect: 0.1 },
    };
    expect(scored(chance, trickster)[0]?.id).toBe('set-up');
    expect(scored(chance, { ...identity, deception: 0 })[0]?.id).toBe('wear-down');
  });

  it('holds what it holds unless something clearly better comes, the disciplined longer', () => {
    const chance = { ...calm, canSetUp: true };
    const leaning = {
      ...identity,
      deception: 0.7,
      philosophy: { ...identity.philosophy, outwit: 0.4 },
    };
    const held = { id: 'wear-down' as const, since: 1 };
    const [best, next] = scored(chance, leaning);
    expect(best?.id).toBe('set-up');
    const gap = (best?.score ?? 0) - (next?.score ?? 0);
    expect(gap).toBeLessThan(0.35);
    expect(choose(chance, { ...leaning, discipline: 1 }, { held, now: 3 })).toMatchObject({
      id: 'wear-down',
      since: 1,
    });
    expect(gap).toBeGreaterThan(0.05);
    expect(choose(chance, { ...leaning, discipline: 0 }, { held, now: 3 })).toMatchObject({
      id: 'set-up',
      since: 3,
    });
  });

  it('keeps a fallback', () => {
    expect(
      choose({ ...calm, atHome: false }, identity, { held: undefined, now: 1 }).fallback,
    ).toBeDefined();
  });
});
