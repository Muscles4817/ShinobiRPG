import { CONTENT_PACKS } from '@/content';
import { findJourney, signPass } from '@/systems/travel';
import { newGame } from '@/test/gameFixtures';

import { createGameContext } from './context';
import { dispatch } from './dispatch';
import { PASS_DAYS, SAFE_ROADS_ONLY } from './leave';
import type { GameState } from './state';
import { travelView } from './views/travel';

const naruto = CONTENT_PACKS.find((p) => p.id === 'naruto');
/** The towns a genin's pass covers: every road to them is safe. */
const TOWNS = ['tanzaku-town', 'shukuba-town', 'otafuku-town', 'fire-temple', 'kagero-landing'];
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
      expect.arrayContaining([...TOWNS, 'land-of-waves', 'kirigakure', 'sunagakure']),
    );
  });

  it('lets a genin on a pass reach the towns on safe roads, but not the Waves, the Mist or the Sand', () => {
    const passed = withPass(newGame({}, ctx));
    for (const town of TOWNS) {
      expect(dispatch(passed, { type: 'travel', locationId: town }, ctx).ok).toBe(true);
    }
    for (const far of ['land-of-waves', 'kirigakure', 'sunagakure']) {
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

  it('crosses the sand by barge only with the priests’ leave, else on foot through the belt', () => {
    const routes = naruto!.routes;
    const walked = findJourney(routes, 'kagero-landing', 'sunagakure', (r) => !r.needs);
    expect(walked).toMatchObject({ routeIds: ['deep-sand-walk'], danger: 'deadly', days: 4 });
    expect(walked?.legs.map((l) => l.region)).toEqual(['dune-road', 'tainted-belt']);
    const sailed = findJourney(routes, 'kagero-landing', 'sunagakure');
    expect(sailed).toMatchObject({ routeIds: ['barge-crossing'], danger: 'armed', days: 2 });
    expect(sailed?.cost).toBeGreaterThan(0);
    const barge = routes.find((r) => r.id === 'barge-crossing');
    const mark = barge?.needs?.[0];
    const leaves = naruto!.missions.filter((m) =>
      m.stages.some(
        (st) =>
          st.kind === 'ending' &&
          st.endings.some((e) =>
            (e.effects ?? []).some(
              (f) => f.kind === 'world' && mark?.kind === 'worldMark' && f.mark === mark.mark,
            ),
          ),
      ),
    );
    expect(leaves.map((m) => m.id)).toEqual(['landing-lost-skiff']);
  });

  it('meets the Landing’s people, the priest who pilots the barges among them', () => {
    const residents = naruto!.people.filter((p) => p.homeLocationId === 'kagero-landing');
    expect(residents.map((p) => p.id)).toEqual(['sakyu-sunao', 'hamada', 'rokusuke']);
  });

  it('meets the Outer Ring’s people in Sunagakure, each great family home in the evening', () => {
    const residents = naruto!.people.filter((p) => p.homeLocationId === 'sunagakure');
    expect(residents.map((p) => p.id)).toEqual([
      'suna-kiyose',
      'madam-ruri',
      'suna-oyone',
      'suna-gozan',
      'sabaku-hisui',
      'akasuna-tsumugi',
      'kamaitachi-hayase',
      'sakyu-koro',
    ]);
    const suna = naruto!.locations.find((l) => l.id === 'sunagakure');
    const compounds = suna?.places.flatMap((p) => (p.kind === 'compound' ? [p] : [])) ?? [];
    expect(compounds.map((c) => c.clanId)).toEqual(['sabaku', 'akasuna', 'kamaitachi', 'sakyu']);
    for (const c of compounds) {
      const home = residents.filter((p) => p.clanId === c.clanId);
      expect(home.some((p) => p.schedule.evening === c.id)).toBe(true);
    }
    const desk = suna?.places.find((p) => p.kind === 'missions');
    expect(desk?.kind === 'missions' && desk.missionIds.length).toBe(5);
  });

  it('meets the bridge builder’s family at home in the Land of Waves', () => {
    const residents = naruto!.people.filter((p) => p.homeLocationId === 'land-of-waves');
    expect(residents.map((p) => p.id)).toEqual(['tazuna', 'tsunami', 'inari']);
  });
});
