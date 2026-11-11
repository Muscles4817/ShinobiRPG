import { act, ctx, intoFight, newGame } from '@/test/gameFixtures';

import { playerCombatant } from './combatants';
import { combatScene } from './views/scene';

describe('how fighters look in a fight', () => {
  it('brings your own look into the fight', () => {
    const state = newGame();
    expect(playerCombatant(state, ctx).look?.hairStyle).toBe(state.character.appearance.hairStyle);
  });

  it('shows you with your look, and every fighter as a kind of body', () => {
    let state = act(newGame({ standing: { ...newGame().standing, missionsCompleted: 5 } }), {
      type: 'startMission',
      missionId: 'tea-merchant-escort',
    });
    state = act(state, { type: 'missionContinue' });
    state = act(state, { type: 'missionChoose', approachIndex: 0 });
    const view = combatScene(intoFight(state), ctx);
    const you = view?.combatants.find((c) => c.side === 'player');
    expect(you?.look).toBeDefined();
    expect(view?.combatants.length).toBeGreaterThan(1);
    for (const fighter of view?.combatants ?? []) expect(fighter.form).toBeDefined();
  });
});
