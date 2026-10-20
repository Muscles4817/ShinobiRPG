import type { CombatTechnique } from '../contract';
import { chainLength, chainProblem, defaultChains } from './chains';

const move = (id: string, effects: CombatTechnique['effects'], more = {}): CombatTechnique => ({
  id,
  name: id,
  discipline: 'taijutsu',
  effects,
  chakraCost: 4,
  ...more,
});
const sweep = move('sweep', [
  { verb: 'damage', power: 6 },
  { verb: 'pin', power: 8 },
]);
const heel = move('heel', [{ verb: 'damage', power: 18 }]);
const launch = move('launch', [
  { verb: 'damage', power: 10 },
  { verb: 'knock', power: 6, to: 'mid' },
]);
const rush = move('rush', [
  { verb: 'move', to: 'close', power: 6 },
  { verb: 'damage', power: 12 },
]);
const gale = move('gale', [{ verb: 'damage', power: 14 }], { element: 'wind' });

describe('chains', () => {
  it('come at taijutsu C, and grow to three links at A', () => {
    expect(chainLength(10)).toBe(0);
    expect(chainLength(14)).toBe(2);
    expect(chainLength(30)).toBe(3);
  });

  it('follow only where the last link leaves the fight', () => {
    expect(chainProblem([sweep, heel], 14)).toBeNull();
    expect(chainProblem([launch, heel], 14)).toMatch(/launch leaves them at mid/);
    expect(chainProblem([launch, rush], 14)).toBeNull();
  });

  it('hold only body moves, as many as the grade allows', () => {
    expect(chainProblem([sweep, gale], 14)).toMatch(/gale isn’t a body move/);
    expect(chainProblem([sweep, heel, rush], 14)).toMatch(/2 moves at most/);
    expect(chainProblem([sweep, heel], 10)).toMatch(/grade C/);
  });

  it('are built from moves that set a foe up, strongest first', () => {
    const chains = defaultChains([sweep, heel, launch, rush, gale], 14);
    expect(chains).toContainEqual(['sweep', 'heel']);
    expect(chains).toContainEqual(['launch', 'rush']);
    expect(chains.every((c) => !c.includes('gale'))).toBe(true);
  });
});
