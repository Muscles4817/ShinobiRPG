import { act, ctx, newGame, veteran, withAllStats } from '@/test/gameFixtures';
import { createStats } from '@/systems/stats';

import { scout } from './scouting';
import { missionBoardView } from './views/boards';
import { combatScouting } from './views/scene';
import { shinobiView } from './views/shinobi';

describe('sizing up an opponent', () => {
  it('says how they compare with you', () => {
    const you = createStats(6);
    expect(scout(createStats(3), you, false).threat).toBe('much-weaker');
    expect(scout(createStats(6), you, false).threatLabel).toBe('Evenly matched');
    expect(scout(createStats(10), you, false).threatLabel).toBe('Far stronger than you');
  });

  it('reads how they fight from their stats', () => {
    const you = createStats(6);
    expect(scout(createStats(6, { taijutsu: 4 }), you, false).style).toBe(
      'Brawler · wants you close',
    );
    expect(scout(createStats(6, { ninjutsu: 4 }), you, false).style).toBe(
      'Jutsu user · keeps their distance',
    );
    expect(scout(createStats(3, { speed: 3, strength: 1 }), you, false).style).toBe(
      'Quick and slippery · wants you close',
    );
  });

  it('sharp eyes see exactly where they outclass you', () => {
    const read = scout(createStats(6, { strength: 4 }), createStats(6), true);
    expect(read.details[0]).toEqual({ label: 'Strength', theirs: 10, yours: 6 });
    expect(scout(createStats(6), createStats(6), false).details).toEqual([]);
  });
});

describe('scouting in play', () => {
  it('every foe in a fight gets a read', () => {
    const fight = act(newGame(), { type: 'spar', personId: 'kaen' });
    expect(combatScouting(fight, ctx)['person:kaen']?.threatLabel).toBe('Evenly matched');
  });

  it('mission notices say how tough the opposition is', () => {
    const board = missionBoardView(veteran(newGame(), 2), ctx)!;
    const bandits = board.notices.find((n) => n.id === 'river-road-bandits');
    expect(bandits?.opposition?.label).toMatch(/\(3 foes\)$/);
    const weeding = board.notices.find((n) => n.id === 'shrine-weeding');
    expect(weeding?.opposition).toBeNull();
    const strong = missionBoardView(withAllStats(veteran(newGame(), 2), 30), ctx)!;
    expect(strong.notices.find((n) => n.id === 'river-road-bandits')?.opposition?.threat).toBe(
      'much-weaker',
    );
  });

  it('your stats come with what they mean', () => {
    const view = shinobiView(newGame(), ctx);
    expect(view.overall.label).toBe('E · Genin');
    expect(view.overall.next).toEqual({ label: 'D · Genin', at: 8 });
    expect(view.groups[0]?.stats[0]?.tier.label).toMatch(/^[EDCBAS] · /);
  });
});
