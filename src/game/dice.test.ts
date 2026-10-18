import { act, ctx, newGame } from '@/test/gameFixtures';

import {
  callOf,
  DICE_ROUNDS_PER_NIGHT,
  diceTableHere,
  hearChance,
  HEAR_MOST,
  heardCall,
  nextCup,
  winnings,
} from './dice';
import { blockerFor } from './dispatch';
import type { DiceCall, GameState } from './state';
import { tavernView } from './views/tavern';

const NIGHT = 3;
const TABLE = 'lantern-dice';

const at = (slot: number, day = 2, ryo = 300): GameState => {
  const state = newGame({ wallet: { ryo } });
  return { ...state, time: { day, slot }, board: { ...state.board, refreshedDay: day } };
};

const table = (state: GameState) => diceTableHere(state, ctx, TABLE)!;
const coming = (state: GameState): DiceCall =>
  callOf(nextCup(state, table(state).placeId, table(state).table));
const flip = (call: DiceCall): DiceCall => (call === 'even' ? 'odd' : 'even');
const bet = (call: DiceCall, stake = 30) =>
  ({ type: 'playDice', pastimeId: TABLE, call, stake }) as const;

describe('chō-han at the back table', () => {
  it('pays a right call its stake back and as much again, less the house’s cut', () => {
    const night = at(NIGHT);
    const won = act(night, bet(coming(night)));
    expect(won.wallet.ryo).toBe(300 + winnings(30));
    expect(winnings(30)).toBeLessThan(30);
    expect(won.village.dice).toMatchObject({ day: 2, rounds: 1, last: { stake: 30 } });
    expect(won.journal.entries.at(-1)?.text).toMatch(/^The cup lifts/);
    expect(won.journal.entries.at(-1)?.tone).toBe('success');
  });

  it('keeps the stake on a wrong call', () => {
    const night = at(NIGHT);
    const lost = act(night, bet(flip(coming(night))));
    expect(lost.wallet.ryo).toBe(300 - 30);
    expect(lost.village.dice?.last.won).toBe(0);
  });

  it('deals a fresh cup each round, and only a few rounds a night', () => {
    let state = at(NIGHT);
    for (let round = 0; round < DICE_ROUNDS_PER_NIGHT; round++) {
      state = act(state, bet('even', 10));
    }
    expect(blockerFor(state, bet('even', 10), ctx)).toBe(
      'The dealer waves you off: that’s enough for one night.',
    );
    const tomorrow = { ...state, time: { day: 3, slot: NIGHT } };
    expect(blockerFor(tomorrow, bet('even', 10), ctx)).toBeNull();
  });

  it('takes only the house’s stakes, from someone who can cover them, while open', () => {
    expect(blockerFor(at(NIGHT), bet('even', 25), ctx)).toBe('The house doesn’t take that bet.');
    expect(blockerFor(at(NIGHT, 2, 5), bet('even', 10), ctx)).toBe(
      'You don’t have 10 ryo to stake.',
    );
    expect(blockerFor(at(0), bet('even', 10), ctx)).toBe(
      'The Paper Lantern is closed. Opens this evening.',
    );
    expect(blockerFor(at(NIGHT), { ...bet('even'), pastimeId: 'shogi' }, ctx)).toBe(
      'There’s no dice table here.',
    );
  });

  it('lets sharp ears hear the cup settle, and what they hear is true', () => {
    expect(hearChance(1000)).toBe(HEAR_MOST);
    expect(hearChance(20)).toBeGreaterThan(hearChance(5));
    const sharp = (day: number): GameState => {
      const state = at(NIGHT, day);
      return {
        ...state,
        character: { ...state.character, stats: { ...state.character.stats, perception: 40 } },
      };
    };
    const days = Array.from({ length: 30 }, (_, i) => sharp(i + 2));
    const heard = days.filter((s) => heardCall(s, table(s).placeId, table(s).table) !== null);
    expect(heard.length).toBeGreaterThan(0);
    expect(heard.length).toBeLessThan(days.length);
    for (const s of heard) {
      expect(heardCall(s, table(s).placeId, table(s).table)).toBe(coming(s));
    }
  });

  it('shows the table on the bar page, with the last cup once played', () => {
    const night = at(NIGHT);
    const before = tavernView(night, ctx)!.pastimes.find((p) => p.id === TABLE)!.dice!;
    expect(before.stakes.map((s) => s.stake)).toEqual([10, 30, 60]);
    expect(before.last).toBeNull();
    const after = act(night, bet('odd', 10));
    const view = tavernView(after, ctx)!.pastimes.find((p) => p.id === TABLE)!.dice!;
    expect(view.last?.faces).toHaveLength(3);
    expect(view.roundsLeft).toBe(DICE_ROUNDS_PER_NIGHT - 1);
    expect(tavernView(after, ctx)!.pastimes.find((p) => p.id === 'shogi')?.dice).toBeNull();
  });
});
