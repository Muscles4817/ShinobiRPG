import { ctx, newGame } from '@/test/gameFixtures';

import { shinobiView } from './shinobi';
import { saveSummary } from './menu';

describe('the main menu’s save card', () => {
  const game = newGame();
  const save = saveSummary(game, ctx);

  it('names you, your rank and how far in you are', () => {
    expect(save.name).toContain(game.character.name);
    expect(save.line).toBe(`${save.rank} in ${ctx.content.packName}, day ${game.time.day}`);
    expect(save.day).toBe(game.time.day);
  });

  it('says where you are and wears the face your sheet shows', () => {
    expect(save.place.length).toBeGreaterThan(0);
    expect(save.slot.length).toBeGreaterThan(0);
    expect(save.appearance).toEqual(shinobiView(game, ctx).appearance);
  });
});
