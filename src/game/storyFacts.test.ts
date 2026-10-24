import { arcPlayer } from '@/test/arcPlay';
import {
  act,
  ctx,
  newGame,
  pastTheRoad,
  postEverything,
  veteran,
  withAllStats,
} from '@/test/gameFixtures';

import type { GameState } from './state';
import { encounterScene } from './views/encounter';
import { missionScene } from './views/missionScene';

/**
 * What a job shows agrees with what it says: the story's light keeps to the hour, a check is
 * told for the way it was tried (and the next stage reads how it went), and an encounter's
 * facts are worded and known when the scene has already said them.
 */

function escortAt(slot: number): GameState {
  const s = postEverything(veteran(newGame(), 3));
  return act(
    { ...s, time: { ...s.time, slot } },
    { type: 'startMission', missionId: 'brides-chest' },
  );
}

describe('the story’s light keeps to the hour', () => {
  it('sets out in the light of the hour it is', () => {
    const late = escortAt(1);
    const levels = ['Dark', 'Dusk', 'Afternoon', 'Morning'];
    expect(levels[late.mission?.threads.daylight ?? -1]).toBe(levels[3 - late.time.slot]);
    expect(late.mission?.threads.daylight).toBeLessThan(3);
  });

  it('is morning again after a day on the road', () => {
    const greeted = act(escortAt(2), { type: 'missionDecide', optionIndex: 0 });
    const walked = act(greeted, { type: 'missionContinue' });
    const onward = walked.mission?.roadEvent
      ? act(walked, { type: 'missionDecide', optionIndex: 1 })
      : walked;
    expect(onward.time.slot).toBe(0);
    expect(onward.mission?.threads.daylight).toBe(3);
  });
});

describe('a check told for the way it was tried', () => {
  it('fails patience in its own words, and the dusk reads it', () => {
    const greeted = act(withAllStats(escortAt(0), -100), {
      type: 'missionDecide',
      optionIndex: 0,
    });
    const walked = act(greeted, { type: 'missionContinue' });
    const atFuss = walked.mission?.roadEvent
      ? act(walked, { type: 'missionDecide', optionIndex: 1 })
      : walked;
    const failed = act(atFuss, { type: 'missionChoose', approachIndex: 0 });
    const story = failed.mission?.notes.filter((n) => n.kind === 'story').map((n) => n.text);
    expect(story?.some((t) => t.includes('bride will be an old woman'))).toBe(true);
    expect(failed.mission?.marks).toContain('short-words');
    expect(missionScene(failed, ctx)?.prompt).toContain('walks ahead without a word');
  });
});

describe('an encounter’s facts', () => {
  it('knows what the scene already said, in words', () => {
    let s = pastTheRoad(
      act(arcPlayer(ctx).ready(), { type: 'startMission', missionId: 'arc-ford-pilot-home' }),
    );
    for (let i = 0; i < 3 && !s.mission?.encounter; i++) s = act(s, { type: 'missionContinue' });
    const count = encounterScene(s, ctx)?.facts.find((f) => f.fact === 'count');
    expect(count?.value).toBe('Two of them');
    const unknown = encounterScene(s, ctx)?.facts.find((f) => f.fact === 'identity');
    expect(unknown?.hint).toMatch(/^Not yet known\. .+ to find out\.$/);
  });
});
