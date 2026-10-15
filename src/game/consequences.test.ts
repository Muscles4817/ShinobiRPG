import { validateContent } from '@/content';
import { CONTENT_PACKS } from '@/content';
import { stock } from '@/systems/inventory';
import {
  act,
  ctx,
  fightOut,
  newGame,
  postEverything,
  veteran,
  withAllStats,
} from '@/test/gameFixtures';

import { availability } from './board';
import { CLIENT_RETURN_SHARE } from './clients';
import type { GameState } from './state';
import { missionBoardView } from './views/boards';
import { missionScene } from './views/missionScene';
import { personSheet } from './views/people';
import { rumoursToday } from './village';

/** What a job leaves behind: what the village remembers, memories, follow-ups, clients. */

const NUN = 'pilgrim-nun-escort';
const FOLLOW_UP = 'boy-from-the-boulders';

function ready(): GameState {
  const s = withAllStats(veteran(newGame(), 5), 60);
  return { ...s, inventory: stock(s.inventory, 'travel-rations', 6) };
}

function step(s: GameState, prefer: readonly string[]): GameState {
  if (s.combat) return fightOut(s);
  if (s.mission?.encounter) return act(s, { type: 'encounterApproach', approach: 'head-on' });
  const choices = missionScene(s, ctx)?.choices ?? [];
  const pick = prefer.map((p) => choices.find((c) => c.label === p)).find(Boolean) ?? choices[0];
  if (!pick) throw new Error('Nothing to choose');
  return act(s, pick.action);
}

function walk(start: GameState, prefer: readonly string[], twist?: string): GameState {
  let s = act(start, { type: 'startMission', missionId: NUN });
  if (twist && s.mission) s = { ...s, mission: { ...s.mission, marks: [twist] } };
  for (let i = 0; i < 60 && s.mission; i++) s = step(s, prefer);
  return s;
}

const KIND = ['Answer warmly', 'Keep your patience', 'Sit with Sister Kohaku', 'Take first watch'];

describe('what a job leaves behind', () => {
  it('a trusting charge is remembered by the village, and the road by everyone who walked it', () => {
    const done = walk(ready(), KIND, 'plain-robbers');
    expect(done.village.marks).toContain('kohaku-trusted');
    const crew = done.people.team!.teammateIds;
    const road = done.village.memories.filter((m) => m.text === 'the road with Sister Kohaku');
    expect(road.map((m) => m.personId).sort()).toEqual([...crew].sort());
    expect(personSheet(done, ctx, crew[0]!)?.memories).toContain('the road with Sister Kohaku');
    expect(rumoursToday(done, ctx).map((r) => r.id)).toContain('kohaku-lantern');
  });

  it('sparing desperate men brings one of them to the village later', () => {
    const def = ctx.content.missions.require(FOLLOW_UP);
    expect(availability(ready(), ctx, def).kind).toBe('absent');
    const done = walk(ready(), [...KIND, 'Talk them out of it'], 'desperate-men');
    expect(done.village.marks).toContain('kohaku-spared');
    // Every job put back on the board: the follow-up is among them now.
    expect(availability(postEverything(done), ctx, def).kind).toBe('posted');
  });

  it('a client you have worked for asks for you by name, and pays a little more', () => {
    const once = walk(ready(), KIND, 'plain-robbers');
    expect(once.village.clients['The Mountain Temple']).toBe(1);
    const again = postEverything({
      ...once,
      character: { ...once.character, vitals: ready().character.vitals },
    });
    const notice = missionBoardView(again, ctx)!.notices.find((n) => n.id === NUN);
    expect(notice?.returning).toBe(true);
    const begun = act(again, { type: 'startMission', missionId: NUN });
    expect(begun.mission?.rewardMultiplier).toBe(1 + CLIENT_RETURN_SHARE);
    expect(begun.mission?.ledger[0]?.text).toBe('The Mountain Temple asked for you by name.');
  });

  it('by the fire, someone you share a memory with brings it up', () => {
    const start = ready();
    const [ren] = start.people.team!.teammateIds;
    const remembering: GameState = {
      ...start,
      village: {
        ...start.village,
        memories: [{ personId: ren!, text: 'the night on the ridge', day: 1 }],
      },
      people: {
        ...start.people,
        bonds: {
          ...start.people.bonds,
          [start.people.team!.teammateIds[1]!]: { points: 99, lastTalkDay: null, heard: [] },
        },
      },
    };
    let s = act(remembering, { type: 'startMission', missionId: NUN });
    for (
      let i = 0;
      i < 20 && missionScene(s, ctx)?.choices.every((c) => c.label !== 'Sit with your crew');
      i++
    ) {
      s = step(s, KIND.slice(0, 2));
    }
    s = step(s, ['Sit with your crew']);
    expect(s.mission?.notes.at(-1)).toMatchObject({
      kind: 'voice',
      text: 'Remember the night on the ridge?',
    });
  });
});

describe('world mark validation', () => {
  it('reports a follow-up or a rumour waiting for something no job leaves behind', () => {
    const original = CONTENT_PACKS.find((p) => p.id === 'original')!;
    const pack = {
      ...original,
      missions: original.missions.map((m) =>
        m.id === FOLLOW_UP ? { ...m, needsWorldMark: 'never' } : m,
      ),
      village: {
        ...original.village,
        rumours: [...original.village.rumours, { id: 'ghost', worldMark: 'nobody', text: 'Hm.' }],
      },
    };
    const problems = validateContent(pack);
    expect(problems).toContain(
      `mission "${FOLLOW_UP}" waits for "never", which no job leaves behind`,
    );
    expect(problems).toContain('rumour "ghost" waits for "nobody", which no job leaves behind');
  });
});
