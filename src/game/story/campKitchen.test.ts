import { createRng } from '@/core';
import { startRun, type Crew, type MissionNote } from '@/systems/missions';
import { ctx, newGame } from '@/test/gameFixtures';

import type { GameState } from '../state';
import { CAMP_MEAL_BOND, cookForCamp, forageCamp } from './campKitchen';

function firstText(notes: readonly MissionNote[]): string {
  const [note] = notes;
  return note && 'text' in note ? note.text : '';
}

/** On the escort job with your old team, with this in your pack. */
function atCamp(pantry: Record<string, number>): GameState {
  const state = newGame();
  const team = state.people.team!;
  const crew: Crew = { kind: 'old-team', leaderId: null, memberIds: team.teammateIds };
  const def = ctx.content.missions.require('tea-merchant-escort');
  return {
    ...state,
    time: { ...state.time, slot: 2 },
    mission: startRun(def, crew),
    inventory: { ...state.inventory, pantry },
  };
}

describe('the camp kitchen', () => {
  it('cooks the best dish the pack covers for everyone, and the crew grows closer', () => {
    const state = atCamp({ rice: 3, 'river-fish': 3, vegetables: 3 });
    const [mate] = state.people.team!.teammateIds;
    const cooked = cookForCamp(state, ctx);
    expect(firstText(cooked.notes)).toContain('Grilled Fish Set');
    expect(cooked.state.inventory.pantry).toEqual({});
    expect(cooked.state.cooking.known['grilled-fish-set']).toBe(1);
    expect(cooked.state.people.bonds[mate!]?.points).toBe(
      (state.people.bonds[mate!]?.points ?? 0) + CAMP_MEAL_BOND,
    );
  });

  it('with too little for everyone, there is no meal', () => {
    const state = atCamp({ rice: 1, eggs: 1 });
    const cooked = cookForCamp(state, ctx);
    expect(cooked.state).toBe(state);
    expect(firstText(cooked.notes)).toContain('nothing in your pack');
  });

  it('a look around the camp finds something for the pot', () => {
    const state = atCamp({});
    const foraged = forageCamp(state, ctx, createRng(3));
    expect(Object.keys(foraged.state.inventory.pantry).length).toBeGreaterThan(0);
    expect(foraged.state.character.vitals.energy).toBeLessThan(state.character.vitals.energy);
  });
});
