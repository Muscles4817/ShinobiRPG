import { CONTENT_PACKS } from '@/content';
import { bondWith } from '@/systems/bonds';
import { stock } from '@/systems/inventory';
import { act, fightOut, newGame, veteran, withAllStats } from '@/test/gameFixtures';

import { availability, crewFor } from './board';
import { createGameContext } from './context';
import type { GameState } from './state';
import { missionBoardView } from './views/boards';
import { missionScene } from './views/missionScene';

/** The fan pack's Temple Bell: Kaname's story opens it, and it is played to its end. */

const naruto = CONTENT_PACKS.find((p) => p.id === 'naruto');
const describeFan = naruto ? describe : describe.skip;

const ACT_ONE = 'arc-kaname-bell-one';
const ACT_TWO = 'arc-kaname-bell-two';
const MERCY = '“That the temple didn’t forget. You came back.”';

describeFan('the Temple Bell', () => {
  const ctx = createGameContext(naruto!);
  const job = (id: string) => ctx.content.missions.require(id);

  /** A seasoned genin under Kaname, close enough to hear the last of his story. */
  function ready(): GameState {
    const s = withAllStats(veteran(newGame({}, ctx), 5), 60);
    const team = { ...s.people.team!, senseiId: 'kaname' };
    const bonds = { ...s.people.bonds, kaname: bondWith(120) };
    return {
      ...s,
      people: { ...s.people, team, bonds },
      inventory: stock(s.inventory, 'travel-rations', 12),
    };
  }

  function rested(s: GameState): GameState {
    const fresh = ready().character.vitals;
    return { ...s, character: { ...s.character, vitals: fresh } };
  }

  function hearBell(s: GameState): GameState {
    const conversation = { personId: 'kaname', conversationId: 'kaname-bell', answer: null };
    const asked = act(
      { ...s, people: { ...s.people, conversation } },
      { type: 'reply', choiceIndex: 0 },
      ctx,
    );
    return act(asked, { type: 'endConversation' }, ctx);
  }

  function play(start: GameState, id: string): GameState {
    let s = act(rested(start), { type: 'startMission', missionId: id }, ctx);
    for (let i = 0; i < 60 && s.mission; i++) {
      if (s.combat) s = fightOut(s, ctx);
      else if (s.mission.encounter) {
        s = act(s, { type: 'encounterApproach', approach: 'head-on' }, ctx);
      } else {
        const choices = missionScene(s, ctx)?.choices ?? [];
        const pick = choices.find((c) => c.label === MERCY) ?? choices[0];
        s = act(s, pick!.action, ctx);
      }
    }
    return { ...s, combatFinale: null, reports: [] };
  }

  it('stays shut until Kaname asks, then opens with him leading', () => {
    const start = ready();
    expect(availability(start, ctx, job(ACT_ONE)).kind).toBe('absent');
    const asked = hearBell(start);
    expect(availability(asked, ctx, job(ACT_ONE))).toEqual({
      kind: 'arc',
      arc: 'The Temple Bell',
    });
    expect(availability(asked, ctx, job(ACT_TWO)).kind).toBe('absent');
    expect(crewFor(asked, ctx, job(ACT_ONE))).toMatchObject({ leaderId: 'kaname' });
    expect(missionBoardView(asked, ctx)!.arcs[0]).toMatchObject({
      act: 'Act 1 of 2: The silent bell',
    });
  });

  it('goes to the temple and back twice, and the bell rings for the mercy shown', () => {
    const found = play(hearBell(ready()), ACT_ONE);
    expect(found.village.marks).toContain('kaname-bell-found');
    expect(availability(found, ctx, job(ACT_ONE)).kind).toBe('absent');
    expect(availability(found, ctx, job(ACT_TWO)).kind).toBe('arc');
    expect(missionBoardView(found, ctx)!.arcs[0]?.act).toBe('Act 2 of 2: Brothers');

    const settled = play(found, ACT_TWO);
    expect(settled.board.completed).toEqual(expect.arrayContaining([ACT_ONE, ACT_TWO]));
    expect(settled.village.marks).toContain('kaname-bell-settled');
    expect(settled.village.memories.map((m) => m.text)).toContain('the night the bell rang');
    expect(missionBoardView(settled, ctx)!.arcs.map((a) => a.id)).not.toContain('the-temple-bell');
  });
});
