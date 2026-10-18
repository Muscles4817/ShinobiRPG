import { act, ctx, lastEntry, newGame } from '@/test/gameFixtures';

import type { GameState } from '../state';
import { DRILL_LINES } from './drillLines';
import { NAP_LINES } from './restLines';
import { MEAL_LINES } from './tableLines';

function tired(state: GameState): GameState {
  const { vitals } = state.character;
  return { ...state, character: { ...state.character, vitals: { ...vitals, energy: 10 } } };
}

function linesOf(bank: typeof DRILL_LINES, when: string): string[] {
  return bank.lines.filter((l) => l.when === when).map((l) => l.text);
}

describe('everyday lines', () => {
  it('never says the same nap line twice in three naps', () => {
    let state = newGame();
    const said: string[] = [];
    for (let nap = 0; nap < 3; nap++) {
      state = act(tired(state), { type: 'rest' });
      said.push(lastEntry(state)?.text ?? '');
    }
    expect(new Set(said).size).toBe(3);
  });

  it('tells a first drill differently from an again, and never echoes the drill’s blurb', () => {
    const drill = ctx.content.training.require('lake-laps');
    const first = act(newGame(), { type: 'train', trainingId: drill.id });
    const again = act(tired(first), { type: 'rest' });
    const second = act(
      { ...again, character: first.character },
      {
        type: 'train',
        trainingId: drill.id,
      },
    );
    expect(linesOf(DRILL_LINES, 'first')).toContain(lastEntry(first)?.text);
    expect(linesOf(DRILL_LINES, 'first')).not.toContain(lastEntry(second)?.text);
    for (const s of [first, second]) expect(lastEntry(s)?.text).not.toContain(drill.description);
  });

  it('writes one journal entry for a meal, and not the stall card’s words', () => {
    const before = newGame();
    const after = act(before, { type: 'eat', foodId: 'ember-noodles' });
    // The sensei may also have a word about food the first time; that is theirs, not the meal's.
    const meal = MEAL_LINES.lines.map((l) => l.text);
    const added = after.journal.entries.filter((e) => e.id >= before.journal.nextId);
    expect(added.filter((e) => meal.includes(e.text))).toHaveLength(1);
    const food = ctx.content.foods.require('ember-noodles');
    expect(added.map((e) => e.text)).not.toContain(food.description);
  });

  it('keeps a hungry drill’s line about hunger', () => {
    const s = newGame();
    const trained = act(s, { type: 'train', trainingId: 'lake-laps' });
    const hungry = {
      ...trained,
      character: {
        ...trained.character,
        vitals: { ...trained.character.vitals, satiety: 20, energy: 100 },
      },
    };
    const again = act(hungry, { type: 'train', trainingId: 'lake-laps' });
    // Going hungry for the first time also brings the sensei over with a bowl, after the drill.
    const added = again.journal.entries.filter((e) => e.id >= hungry.journal.nextId);
    const hungryLines = linesOf(DRILL_LINES, 'hungry');
    expect(added.some((e) => hungryLines.includes(e.text))).toBe(true);
  });

  it('keeps every bank big enough to rotate', () => {
    expect(NAP_LINES.lines.filter((l) => l.when === undefined).length).toBeGreaterThan(3);
  });
});
