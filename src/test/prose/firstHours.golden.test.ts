import {
  classHonoursView,
  contextForPack,
  createNewGame,
  creationView,
  dayEndView,
  fileReadBack,
  marketView,
  rollBreakIn,
  senseiWeekView,
  trainingView,
  villageView,
  type GameContext,
  type GameState,
} from '@/game';
import { draft } from '@/test/gameFixtures';

import { recorder, type Recorder } from './recorder';

/**
 * The first hours of a new game as the player reads them: the academy file read back, the
 * break-in, graduation, the team, the chakra paper, the sensei's first meeting and three days
 * of training, talk, food and sleep, each ending on its sheet.
 */

const SEED = 1234;
const DAYS = 3;

function creation(r: Recorder, ctx: GameContext) {
  const view = creationView(ctx);
  const d = draft({ name: 'Kaito' }, ctx);
  r.say(`intro: ${view.intro}`);
  const roll = rollBreakIn(ctx, d.breakInApproachId, SEED);
  r.say(`break-in: ${roll.text}`);
  r.dump('file read back', fileReadBack(d, ctx));
  r.say(`instructor: ${view.instructor}`);
  r.say(`caught: ${view.caught}`);
  return d;
}

function opening(r: Recorder, ctx: GameContext, start: GameState): GameState {
  r.dump('class honours', classHonoursView(start, ctx));
  r.scene(start);
  let s = r.play(start, { type: 'assignTeam' });
  s = r.play(s, { type: 'chooseSensei', senseiId: s.people.team?.senseiOptions[0] ?? '' });
  s = r.play(s, { type: 'testChakraPaper' });
  while (s.reports.length > 0) s = r.play(s, { type: 'dismissReport' });
  while (s.mentor.opening) s = r.play(s, { type: 'senseiTest', optionIndex: 0 });
  while (s.reports.length > 0) s = r.play(s, { type: 'dismissReport' });
  if (s.rival?.beat) s = r.play(s, { type: 'answerRival', choiceIndex: 1 });
  return s;
}

function talkToTeammate(r: Recorder, start: GameState, day: number): GameState {
  const mate = start.people.team?.teammateIds[day % 2];
  if (!mate) return start;
  let s = r.play(start, { type: 'talk', personId: mate });
  if (!s.people.conversation) return s;
  s = r.play(s, { type: 'reply', choiceIndex: day % 2 });
  return r.play(s, { type: 'endConversation' });
}

function oneDay(r: Recorder, ctx: GameContext, start: GameState, day: number): GameState {
  r.say(`\n########## day ${day + 1} ##########`);
  r.dump('sensei’s slip', senseiWeekView(start, ctx));
  r.dump('village', villageView(start, ctx));
  let s = r.play(start, { type: 'senseiSession' });
  const drill = trainingView(s, ctx)?.drills[day];
  if (drill) s = r.play(s, { type: 'train', trainingId: drill.id });
  s = talkToTeammate(r, s, day);
  const food = marketView(s, ctx)?.stalls[0]?.items[0];
  if (food) s = r.play(s, { type: 'eat', foodId: food.id });
  while (s.reports.length > 0) s = r.play(s, { type: 'dismissReport' });
  s = r.play(s, { type: 'sleep' });
  r.dump('day end', dayEndView(s, ctx));
  return s.daybook.ended ? r.play(s, { type: 'dismissDay' }) : s;
}

it.each(['original', 'naruto'])('reads the first hours of a new game (%s)', async (pack) => {
  const ctx = contextForPack(pack);
  if (!ctx) return;
  const r = recorder(ctx);
  const d = creation(r, ctx);
  let s = opening(r, ctx, createNewGame({ draft: d, seed: SEED }, ctx));
  for (let day = 0; day < DAYS; day++) s = oneDay(r, ctx, s, day);
  await expect(r.text()).toMatchFileSnapshot(`./goldens/first-hours-${pack}.txt`);
});
