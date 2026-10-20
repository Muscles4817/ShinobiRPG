import { CONTENT_PACKS } from '@/content';
import { signPass } from '@/systems/travel';
import { newGame } from '@/test/gameFixtures';

import { createGameContext } from './context';
import { dispatch } from './dispatch';
import { PASS_DAYS, SAFE_ROADS_ONLY } from './leave';
import type { GameState } from './state';
import { travelView } from './views/travel';

const naruto = CONTENT_PACKS.find((p) => p.id === 'naruto');
/** The towns a genin's pass covers: every road to them is safe. */
const TOWNS = ['tanzaku-town', 'shukuba-town', 'otafuku-town', 'fire-temple'];
const describeFan = naruto ? describe : describe.skip;

function withPass(state: GameState): GameState {
  return { ...state, leave: signPass(state.leave, state.time.day, PASS_DAYS) };
}

describeFan('the fan pack’s towns', () => {
  const ctx = createGameContext(naruto!);

  it('opens the fan pack’s towns on the travel screen', () => {
    const open = travelView(newGame({}, ctx), ctx).destinations.filter(
      (d) => d.lockedReason === null,
    );
    expect(open.map((d) => d.id)).toEqual(
      expect.arrayContaining([...TOWNS, 'land-of-waves', 'kirigakure']),
    );
  });

  it('lets a genin on a pass reach the towns on safe roads, but not the Waves or the Mist', () => {
    const passed = withPass(newGame({}, ctx));
    for (const town of TOWNS) {
      expect(dispatch(passed, { type: 'travel', locationId: town }, ctx).ok).toBe(true);
    }
    for (const far of ['land-of-waves', 'kirigakure']) {
      expect(dispatch(passed, { type: 'travel', locationId: far }, ctx)).toEqual({
        ok: false,
        error: SAFE_ROADS_ONLY,
      });
    }
  });

  it('meets the harbour ward’s people at home in Kirigakure, with its own work to do', () => {
    const residents = naruto!.people.filter((p) => p.homeLocationId === 'kirigakure');
    expect(residents.map((p) => p.id)).toEqual([
      'ao',
      'mirei',
      'granny-shio',
      'ryugo',
      'kasumi-yuge',
      'isana-tora',
      'kurage-nami',
      'amibari-shiori',
      'uminari-awa',
      'shiogama-kanae',
    ]);
    const kiri = naruto!.locations.find((l) => l.id === 'kirigakure');
    const compounds = kiri?.places.flatMap((p) => (p.kind === 'compound' ? [p] : [])) ?? [];
    expect(compounds.map((c) => c.clanId)).toEqual([
      'kasumi',
      'amibari',
      'kurage',
      'isana',
      'shiogama',
    ]);
    for (const c of compounds) {
      const home = residents.filter((p) => p.clanId === c.clanId);
      expect(home.some((p) => p.schedule.evening === c.id)).toBe(true);
    }
    const desk = kiri?.places.find((p) => p.kind === 'missions');
    expect(desk?.kind === 'missions' && desk.missionIds.length).toBeGreaterThan(0);
  });

  it('meets the bridge builder’s family at home in the Land of Waves', () => {
    const residents = naruto!.people.filter((p) => p.homeLocationId === 'land-of-waves');
    expect(residents.map((p) => p.id)).toEqual(['tazuna', 'tsunami', 'inari']);
  });
});
