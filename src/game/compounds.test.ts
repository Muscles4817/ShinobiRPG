import { draft, formTeam } from '@/test/gameFixtures';
import { bondWith } from '@/systems/bonds';

import { compoundAccess, compoundHere } from './compounds';
import { contextForPack } from './context';
import { createNewGame } from './creation';
import { dispatch } from './dispatch';
import type { GameState } from './state';
import { hubView } from './views/hub';

const naruto = contextForPack('naruto')!;

function leafGame(clanId = 'none'): GameState {
  return formTeam(createNewGame({ draft: draft({ clanId }, naruto), seed: 1 }, naruto), naruto);
}

function at(state: GameState, slot: number): GameState {
  return { ...state, time: { ...state.time, slot } };
}

function knowing(state: GameState, personId: string, points: number): GameState {
  const bonds = { ...state.people.bonds, [personId]: bondWith(points) };
  return { ...state, people: { ...state.people, bonds } };
}

function gate(state: GameState, placeId: string): string | null {
  return compoundAccess(state, naruto, compoundHere(state, naruto, placeId)!);
}

const MORNING = 0;
const AFTERNOON = 1;
const NIGHT = 3;

describe('clan compounds', () => {
  it('an open clan lets anyone in by day, and no one but the bonded at night', () => {
    const state = leafGame();
    expect(gate(at(state, MORNING), 'akimichi-compound')).toBeNull();
    expect(gate(at(state, NIGHT), 'akimichi-compound')).toMatch(/shut for the night/);
    expect(gate(at(knowing(state, 'choji', 85), NIGHT), 'akimichi-compound')).toBeNull();
  });

  it('a guarded clan wants you close to one of its own, and its own are always home', () => {
    const state = at(leafGame(), MORNING);
    expect(gate(state, 'hyuga-compound')).toMatch(/close friends with one of their own/);
    expect(gate(knowing(state, 'hinata', 30), 'hyuga-compound')).not.toBeNull();
    expect(gate(knowing(state, 'hinata', 55), 'hyuga-compound')).toBeNull();
    expect(gate(at(leafGame('hyuga'), NIGHT), 'hyuga-compound')).toBeNull();
  });

  it('someone home behind a shut gate can’t be talked to', () => {
    const state = at(leafGame(), AFTERNOON);
    const refused = dispatch(state, { type: 'talk', personId: 'hiashi' }, naruto);
    expect(refused.ok ? null : refused.error).toMatch(/home in the compound/);
  });

  it('keeps the compounds behind the quarter, and strangers off who’s here', () => {
    const hub = hubView(at(leafGame(), MORNING), naruto);
    expect(hub.places.some((p) => p.kind === 'compound')).toBe(false);
    expect(hub.places.some((p) => p.kind === 'quarter')).toBe(true);
    expect(hub.inner.every((p) => p.parentId === 'clan-quarter')).toBe(true);
    const state = at(leafGame(), MORNING);
    const team = state.people.team!;
    const known = new Set([team.senseiId, ...team.teammateIds]);
    expect(hub.around.every((f) => known.has(f.id) || state.people.bonds[f.id])).toBe(true);
  });
});
