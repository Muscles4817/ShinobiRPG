import type { PlanFighter, PlanState } from './state';
import { fightSummary } from './summary';

/** A fighter as the summary reads one: who, which side, alive or when they fell, and swings. */
function body(id: string, side: 'player' | 'enemy', extra: Partial<PlanFighter> = {}) {
  const you = id === 'player';
  return {
    id,
    name: id,
    called: you ? 'you' : `the ${id}`,
    grammar: you ? 'you' : 'it',
    side,
    isPlayer: you,
    health: extra.fellAt === undefined ? 50 : 0,
    maxHealth: 100,
    ...extra,
  } as unknown as PlanFighter;
}

const stateOf = (fighters: readonly PlanFighter[], bout: number) =>
  ({ fighters, bout }) as unknown as PlanState;

describe('the fight summed up by its turning point', () => {
  it('names a daze that came just before the last foe went down', () => {
    const wolf = body('wolf', 'enemy', { fellAt: 7, dazedBy: { at: 5, by: 'player' } });
    const summary = fightSummary(stateOf([body('player', 'player'), wolf], 2), 'victory');
    expect(summary).toBe(
      'You won in two rounds. You dazed the wolf in the second round, and it never found its feet again.',
    );
  });

  it('names a smashed guard that turned it against you', () => {
    const player = body('player', 'player', { fellAt: 6, guardBrokenBy: { at: 4, by: 'bear' } });
    const summary = fightSummary(stateOf([player, body('bear', 'enemy')], 2), 'defeat');
    expect(summary).toMatch(/The bear smashed through your guard in the first round/);
  });

  it('passes over a daze too long before the end, and an ally’s fall reads as the turn', () => {
    const player = body('player', 'player', { fellAt: 11, dazedBy: { at: 2, by: 'bear' } });
    const ally = body('dog', 'player', { fellAt: 3 });
    const summary = fightSummary(stateOf([player, ally, body('bear', 'enemy')], 3), 'defeat');
    expect(summary).toBe(
      'You lasted three rounds before going down. Once the dog went down in the first round, it turned against you.',
    );
  });

  it('keeps to who went down when nothing turned it', () => {
    const summary = fightSummary(
      stateOf([body('player', 'player'), body('wolf', 'enemy', { fellAt: 2 })], 1),
      'victory',
    );
    expect(summary).toBe('You won in a single round. The wolf went down in the first round.');
  });
});
