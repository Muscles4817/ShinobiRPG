import { newGame } from '@/test/gameFixtures';

import { deserialize } from './save';

describe('the fight story migration', () => {
  it('reads a finished fight kept as lines into the events it told', () => {
    const game = newGame();
    const finale = {
      round: 2,
      range: 'close',
      log: [
        '— First exchange — ⟦rs⟧ ⟦pl:player=health:100|foe=health:40⟧',
        'You hit the foe. ⟦n:player|foe⟧ ⟦-40⟧ ⟦pl:foe=health:0⟧ ⟦by:player⟧',
      ],
      logOffset: 12,
      combatants: [],
    };
    const older = { ...game, combatFinale: finale };
    const loaded = deserialize(JSON.stringify({ version: 75, state: older }));
    if (!loaded.ok) throw new Error(loaded.error);
    const kept = loaded.value.combatFinale;
    expect(kept).not.toHaveProperty('log');
    expect(kept?.storyOffset).toBe(12);
    expect(kept?.story).toContainEqual({ kind: 'health', who: 'foe', to: 0, cause: 'settled' });
    expect(kept?.story.at(-1)).toMatchObject({
      kind: 'told',
      text: 'You hit the foe.',
      actor: 'player',
      amounts: [{ kind: 'harm', amount: 40 }],
    });
  });

  it('leaves a save with no finished fight as it was', () => {
    const loaded = deserialize(JSON.stringify({ version: 75, state: newGame() }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.combatFinale).toBeNull();
  });
});
