import { MAX_HEALTH } from '@/systems/vitals';
import { act, ctx, intoFight, newGame, withAllStats } from '@/test/gameFixtures';

import { enemyCombatant, playerCombatant } from './combatants';
import { deserialize } from './persistence/save';
import type { GameState } from './state';
import { combatScene } from './views/scene';

/** A fight under way on an escort job. */
function midFight(): GameState {
  let state = act(newGame({ standing: { ...newGame().standing, missionsCompleted: 5 } }), {
    type: 'startMission',
    missionId: 'tea-merchant-escort',
  });
  state = act(state, { type: 'missionContinue' });
  state = act(state, { type: 'missionChoose', approachIndex: 0 });
  return intoFight(state);
}

describe('health', () => {
  it('is 100 for every human, however tough', () => {
    const tough = withAllStats(newGame(), 30);
    expect(playerCombatant(tough, ctx).maxHealth).toBe(MAX_HEALTH);
    expect(playerCombatant(newGame(), ctx).maxHealth).toBe(MAX_HEALTH);
  });

  it('scales for creatures bigger or smaller than a person', () => {
    const scaled = ctx.content.enemies.all.find((e) => e.healthScale !== undefined)!;
    const human = ctx.content.enemies.all.find((e) => e.healthScale === undefined)!;
    expect(enemyCombatant(human, 0, ctx).maxHealth).toBe(MAX_HEALTH);
    expect(enemyCombatant(scaled, 0, ctx).maxHealth).toBe(
      Math.round(MAX_HEALTH * scaled.healthScale!),
    );
  });

  it('a version 14 save keeps its share of health, and a fight in progress resumes', () => {
    const state = midFight();
    expect(state.combat).not.toBeNull();
    const stats = { ...state.character.stats, stamina: 10, strength: 5 };
    // The old maximum for these stats was 60 + 10 × 4 + 5 = 105; 63 of it is 60%.
    const v14 = {
      ...state,
      character: { ...state.character, stats, vitals: { ...state.character.vitals, health: 63 } },
    };
    const loaded = deserialize(JSON.stringify({ version: 14, state: v14 }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.character.vitals.health).toBe(60);
    expect(loaded.value.combat).toEqual(state.combat);
    expect(combatScene(loaded.value, ctx)?.options.length).toBeGreaterThan(0);
  });
});
