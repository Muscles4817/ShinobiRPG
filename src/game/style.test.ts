import { act, ctx, newGame } from '@/test/gameFixtures';

import { blockerFor } from './dispatch';
import { playerCombatant } from './combatants';
import type { GameState } from './state';
import { noteNewMoves, styleMoveIds, styleRoom } from './style';
import { styleView } from './views/style';

/** Body moves a fresh genin knows (Palm Strike) or has been taught here. */
const MOVES = ['palm-strike', 'shoulder-throw', 'crescent-drop', 'post-sweep', 'ferrymans-shove'];

/** A fresh genin who has learned more body moves than a style holds (and knows wind's Gale Heel). */
function trained(): GameState {
  const state = newGame();
  const known = [...new Set([...state.techniques.known, ...MOVES])];
  return { ...state, techniques: { ...state.techniques, known } };
}

function spareOf(state: GameState): string {
  const style = styleMoveIds(state, ctx);
  return MOVES.find((id) => !style.includes(id))!;
}

describe('your style', () => {
  it('keeps your best moves until you choose', () => {
    const state = trained();
    expect(state.techniques.repertoire).toBeNull();
    expect(styleMoveIds(state, ctx)).toHaveLength(styleRoom(state));
    expect(styleView(state, ctx)).toMatchObject({ room: styleRoom(state), chosen: false });
    expect(playerCombatant(state, ctx).repertoire).toBeUndefined();
  });

  it('takes a move out and puts another in, and fights carry your choice', () => {
    const state = trained();
    const [first] = styleMoveIds(state, ctx);
    const out = act(state, { type: 'setStyleMove', techniqueId: first!, inStyle: false });
    expect(out.techniques.repertoire).not.toContain(first);
    const spare = spareOf(out);
    const back = act(out, { type: 'setStyleMove', techniqueId: spare, inStyle: true });
    expect(back.techniques.repertoire).toContain(spare);
    expect(playerCombatant(back, ctx).repertoire).toEqual(back.techniques.repertoire);
  });

  it('says why a move can’t go in', () => {
    const state = trained();
    const add = { type: 'setStyleMove', techniqueId: spareOf(state), inStyle: true } as const;
    expect(blockerFor(state, add, ctx)).toMatch(/moves at your taijutsu grade\. Take one out/);
    const wind = { type: 'setStyleMove', techniqueId: 'gale-heel', inStyle: true } as const;
    expect(blockerFor(state, wind, ctx)).toMatch(/Only plain body moves/);
    const unknown = { type: 'setStyleMove', techniqueId: 'iron-hold', inStyle: true } as const;
    expect(blockerFor(state, unknown, ctx)).toMatch(/don’t know/);
  });

  it('goes back to keeping your best', () => {
    const state = trained();
    const [first] = styleMoveIds(state, ctx);
    const chosen = act(state, { type: 'setStyleMove', techniqueId: first!, inStyle: false });
    expect(blockerFor(state, { type: 'resetStyle' }, ctx)).not.toBeNull();
    expect(act(chosen, { type: 'resetStyle' }).techniques.repertoire).toBeNull();
  });

  it('takes a body move you learn while it has room', () => {
    const state = trained();
    const chosen = { ...state, techniques: { ...state.techniques, repertoire: ['palm-strike'] } };
    const known = [...chosen.techniques.known, 'arm-lock'];
    const learned = { ...chosen, techniques: { ...chosen.techniques, known } };
    expect(noteNewMoves(chosen, learned, ctx).techniques.repertoire).toEqual([
      'palm-strike',
      'arm-lock',
    ]);
  });
});
