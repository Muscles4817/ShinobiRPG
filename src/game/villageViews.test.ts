import { ctx, formTeam, freshGame, newGame } from '@/test/gameFixtures';

import { academyView } from './views/boards';
import { hubView } from './views/hub';
import { marketView } from './views/market';

describe('village views', () => {
  it('a fresh graduate can start a scroll at the academy on day one', () => {
    const view = academyView(newGame(), ctx)!;
    expect(view.ready.length).toBeGreaterThan(0);
    const shortfalls = view.comingUp.map((s) => s.shortfall);
    expect(shortfalls).toEqual([...shortfalls].sort((a, b) => a - b));
  });

  it('the hub flags fresh postings and a lesson that is ready', () => {
    const places = hubView(formTeam(freshGame()), ctx).places;
    expect(places.find((p) => p.kind === 'missions')?.badge).toMatch(/^\d+ new$/);
    expect(places.find((p) => p.kind === 'training')?.badge).toBe('Lesson ready');
    expect(places.find((p) => p.kind === 'home')?.badge).toBeNull();
  });

  it('the market only mentions fullness when food would go to waste', () => {
    const items = marketView(newGame(), ctx)!.stalls.flatMap((s) => s.items);
    const feast = items.reduce((a, b) => (a.satiety > b.satiety ? a : b));
    expect(feast.wasted).toBeGreaterThan(0);
    const hungry = newGame();
    const starving = {
      ...hungry,
      character: { ...hungry.character, vitals: { ...hungry.character.vitals, satiety: 0 } },
    };
    expect(
      marketView(starving, ctx)!
        .stalls.flatMap((s) => s.items)
        .every((i) => i.wasted === 0),
    ).toBe(true);
  });
});
