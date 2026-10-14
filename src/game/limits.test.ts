import { shinobiView, type GameState } from '@/game';
import { evenAptitude, LIMIT_EASE } from '@/systems/stats';
import { ctx, newGame } from '@/test/gameFixtures';

import { growCharacter } from './growth';
import { naturalLimits } from './profile';

const text = ctx.content.text.aptitude.limits;

function built(buildId: string, stats: Partial<GameState['character']['stats']> = {}) {
  const game = newGame();
  return {
    ...game.character,
    buildId,
    aptitude: evenAptitude(1),
    stats: { ...game.character.stats, ...stats },
  };
}

describe('natural limits in play', () => {
  it('give a slight frame room for speed and a heavy one room for strength', () => {
    const slight = naturalLimits(built('slight'), ctx);
    const heavy = naturalLimits(built('heavy'), ctx);
    expect(slight.speed).toBeGreaterThan(heavy.speed);
    expect(heavy.strength).toBeGreaterThan(slight.strength);
    expect(slight.taijutsu).toBe(heavy.taijutsu);
  });

  it('slow you down when you carry more strength than your frame was built for', () => {
    const lean = naturalLimits(built('balanced', { strength: 10 }), ctx);
    const bulky = naturalLimits(built('balanced', { strength: 19 }), ctx);
    expect(bulky.speed).toBeLessThan(lean.speed);
    expect(naturalLimits(built('heavy', { strength: 19 }), ctx).speed).toBe(
      naturalLimits(built('heavy', { strength: 10 }), ctx).speed,
    );
  });

  it('hold growth at the limit, however hard you train', () => {
    const open = built('balanced', { speed: 8 });
    const atLimit = built('balanced', { speed: naturalLimits(open, ctx).speed });
    const gain = (c: typeof open) =>
      growCharacter(c, { speed: 1 }, ctx).character.stats.speed - c.stats.speed;
    expect(gain(atLimit)).toBeLessThan(gain(open) * 0.1);
  });

  it('show on the Shinobi screen once the talent is read, in words', () => {
    const game = newGame();
    const limit = naturalLimits({ ...game.character, aptitude: evenAptitude(1) }, ctx).speed;
    const near = (sensed: boolean): GameState => ({
      ...game,
      character: {
        ...game.character,
        aptitude: evenAptitude(1),
        aptitudeKnown: { ...game.character.aptitudeKnown, speed: sensed ? 'sense' : 'unknown' },
        stats: { ...game.character.stats, speed: limit - LIMIT_EASE / 2 },
      },
    });
    const speed = (s: GameState) =>
      shinobiView(s, ctx)
        .groups.flatMap((g) => g.stats)
        .find((l) => l.label === 'Speed')!.limit;
    expect(speed(near(false))).toBeNull();
    expect(speed(near(true))).toBe(text.born.near);
  });
});
