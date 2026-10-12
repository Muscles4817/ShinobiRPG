import type { CombatOutcome, CombatUsage } from '@/systems/combat';
import { createStats, evenAptitude, type StatId, type Stats } from '@/systems/stats';
import {
  act,
  ctx,
  fightOut,
  newGame,
  postEverything,
  veteran,
  withAllStats,
} from '@/test/gameFixtures';

import { PLAYER_COMBATANT_ID } from './combatants';
import { dispatch } from './dispatch';
import { growFromFight, type FightLessons } from './fightGrowth';
import { growCharacter } from './growth';
import type { GameState } from './state';

/** A plain fighter at `value` everywhere, with an ordinary talent for everything. */
function fighterAt(value: number, overrides: Partial<Stats> = {}): GameState {
  const state = withAllStats(newGame(), value);
  const stats = { ...state.character.stats, ...overrides };
  return { ...state, character: { ...state.character, stats, aptitude: evenAptitude(1) } };
}

function lessons(used: Partial<CombatUsage>, foe: number, hurt = 0): FightLessons {
  const outcome: CombatOutcome = {
    result: 'victory',
    rounds: 3,
    player: { health: 80, chakra: 30 },
    used: { [PLAYER_COMBATANT_ID]: { techniqueIds: [], chakraSpent: 0, ...used } },
  };
  return { outcome, foes: [createStats(foe)], hurt, reportsBefore: 0 };
}

function grown(state: GameState, taught: FightLessons, id: StatId): number {
  return growFromFight(state, taught, ctx).character.stats[id] - state.character.stats[id];
}

describe('fights teach', () => {
  it('teaches the art of each technique used, more from a stronger foe', () => {
    const me = fighterAt(9);
    const jutsu = { techniqueIds: ['pebble-volley'] };
    const weaker = grown(me, lessons(jutsu, 3), 'ninjutsu');
    const equal = grown(me, lessons(jutsu, 9), 'ninjutsu');
    const better = grown(me, lessons(jutsu, 14), 'ninjutsu');
    const muchBetter = grown(me, lessons(jutsu, 21), 'ninjutsu');
    expect(weaker).toBeLessThan(equal / 5);
    expect(equal).toBeGreaterThan(0);
    expect(better).toBeGreaterThan(equal);
    expect(muchBetter).toBeGreaterThan(better);
    expect(grown(me, lessons(jutsu, 30), 'ninjutsu')).toBe(muchBetter);
    expect(grown(me, lessons(jutsu, 14), 'taijutsu')).toBe(0);
  });

  it('is a scaled-down lesson: one fight teaches less than a drill', () => {
    const me = fighterAt(5);
    const fight = grown(me, lessons({ techniqueIds: ['pebble-volley'] }, 5), 'ninjutsu');
    // A drill's main gain is about 1.5 (Seal Drills: ninjutsu 1.5).
    const drilled = growCharacter(me.character, { ninjutsu: 1.5 }, ctx).character;
    const drill = drilled.stats.ninjutsu - me.character.stats.ninjutsu;
    expect(fight).toBeGreaterThan(0);
    expect(fight).toBeLessThan(drill);
  });

  it('counts plain strikes as taijutsu and strength, footwork as speed, hits as stamina', () => {
    const me = fighterAt(5);
    const brawl = lessons({ blows: 4 }, 9);
    expect(grown(me, brawl, 'taijutsu')).toBeGreaterThan(0);
    expect(grown(me, brawl, 'strength')).toBeGreaterThan(0);
    expect(grown(me, brawl, 'speed')).toBe(0);
    expect(grown(me, lessons({ footwork: 2 }, 9), 'speed')).toBeGreaterThan(0);
    expect(grown(me, lessons({}, 9, 30), 'stamina')).toBeGreaterThan(0);
    expect(grown(me, lessons({}, 9, 2), 'stamina')).toBe(0);
  });

  it('teaches nothing where you have no talent at all', () => {
    const me = fighterAt(5);
    const void_ = { ...me.character, aptitude: { ...me.character.aptitude, ninjutsu: 0 } };
    const state = { ...me, character: void_ };
    expect(grown(state, lessons({ techniqueIds: ['pebble-volley'] }, 14), 'ninjutsu')).toBe(0);
  });

  it('says what the fight taught in a journal line and on the fight’s card', () => {
    const start = postEverything(veteran(fighterAt(9), 3));
    let s = act(start, { type: 'startMission', missionId: 'storehouse-ghost' });
    for (let i = 0; i < 50 && (s.mission || s.combat); i++) {
      if (s.combat) s = fightOut(s);
      else if (s.mission?.encounter) s = act(s, { type: 'encounterApproach', approach: 'head-on' });
      else if (dispatch(s, { type: 'missionContinue' }, ctx).ok)
        s = act(s, { type: 'missionContinue' });
      else s = act(s, { type: 'missionChoose', approachIndex: 0 });
    }
    const card = s.reports.find((r) => r.kind === 'fight' || r.kind === 'defeat');
    const taught = card?.kind === 'fight' || card?.kind === 'defeat' ? card.taught : undefined;
    expect(taught?.length).toBeGreaterThan(0);
    const entry = s.journal.entries.find((e) => e.heading === 'What the fight taught you');
    expect(entry?.text).not.toMatch(/\d/);
    expect(entry?.chips?.length).toBeGreaterThan(0);
  });
});
