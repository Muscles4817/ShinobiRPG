import { act, ctx, newGame, withAllStats } from '@/test/gameFixtures';

import type { CombatView } from '@/systems/combat';

import type { GameState } from '../state';
import { roundWhy } from './roundWhy';
import { combatScene } from './scene';

/** A spar played to the plan screen of its second round. */
function afterFirstRound(): GameState {
  let state: GameState = withAllStats(newGame({}, ctx), 8);
  state = act(state, { type: 'spar', personId: 'kaen' }, ctx);
  for (let i = 0; i < 20 && state.combat; i++) {
    const view = combatScene(state, ctx)!;
    if (view.round > 1 && view.options.some((o) => o.kind === 'plan')) return state;
    const go = view.options.find((o) => o.kind === 'continue' && !o.disabledReason)!;
    state = act(state, { type: 'combatAct', optionId: go.id }, ctx);
  }
  return state;
}

describe('why the last round went as it did', () => {
  it('says nothing before a round has been played', () => {
    const state = act(withAllStats(newGame({}, ctx), 8), { type: 'spar', personId: 'kaen' }, ctx);
    expect(roundWhy(combatScene(state, ctx)!)).toEqual([]);
  });

  it('reads the round just played: your attacks, who hurt you and what it cost', () => {
    const view = combatScene(afterFirstRound(), ctx)!;
    const why = roundWhy(view);
    expect(why.map((r) => r.text)).toContain('Your attacks');
    // The harm it counts is the harm the round did: both sides started it whole.
    const harmIn = (rows: typeof why) =>
      rows
        .flatMap((r) => r.chips)
        .reduce((sum, c) => sum + (c.tone === 'harm' ? Number(c.label.slice(1)) : 0), 0);
    const [you, foe] = view.combatants;
    expect(harmIn(why.filter((r) => r.text.startsWith('Hurt by')))).toBe(
      you!.maxHealth - you!.health,
    );
    expect(harmIn(why.filter((r) => r.text === 'Your attacks'))).toBe(foe!.maxHealth - foe!.health);
    // Story text never holds numbers: they are all in the chips.
    expect(why.filter((r) => /\d/.test(r.text))).toEqual([]);
  });

  it('counts only the last round, and says when your turns went off your plan', () => {
    const fighter = { health: 100, maxHealth: 100, chakra: 50, maxChakra: 50, statuses: [] };
    const view: CombatView = {
      round: 3,
      combatants: [
        { id: 'aoi', name: 'Aoi', side: 'player', ...fighter },
        { id: 'goro', name: 'Goro', side: 'enemy', ...fighter },
      ],
      options: [],
      log: [
        '— First exchange — ⟦rs⟧',
        'Aoi hits Goro. ⟦by:aoi⟧ ⟦-9⟧',
        '— First exchange — ⟦rs⟧',
        'Aoi swings at Goro. ⟦op:improvised⟧ ⟦by:aoi⟧ ⟦-3⟧',
        'Aoi looks around. ⟦op:looking⟧ ⟦by:aoi⟧',
        'Goro slips past Aoi’s strike. ⟦by:aoi⟧ ⟦r:missed⟧',
        'Goro hits Aoi. ⟦by:goro⟧ ⟦r:guarded⟧ ⟦-4⟧',
      ],
    };
    expect(roundWhy(view)).toEqual([
      { text: 'Off plan: nothing slotted fit', chips: [{ label: '×1', tone: 'info' }] },
      { text: 'Off plan: no one in sight', chips: [{ label: '×1', tone: 'info' }] },
      {
        text: 'Your attacks',
        chips: [
          { label: '1 landed', tone: 'info' },
          { label: '1 missed', tone: 'info' },
          { label: '−3', tone: 'harm' },
        ],
      },
      { text: 'Hurt by Goro', chips: [{ label: '−4', tone: 'harm' }] },
      { text: 'Your defences', chips: [{ label: 'Guarded ×1', tone: 'info' }] },
    ]);
  });
});
