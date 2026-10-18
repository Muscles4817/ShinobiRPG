import { validateContent } from '@/content';
import { act, newGame, withAllStats } from '@/test/gameFixtures';
import { STORY_JOB, storyCtx, storyPack } from '@/test/storyFixtures';

import { blockerFor } from './dispatch';
import type { GameState } from './state';
import { decide } from './story/decide';
import { FIRESIDE_BOND, SENSEI_FIRESIDE } from './story/fireside';
import { missionScene } from './views/missionScene';

const ctx = storyCtx;

function onJob(): GameState {
  return act(
    withAllStats(newGame({}, ctx), 20),
    { type: 'startMission', missionId: STORY_JOB.id },
    ctx,
  );
}

function choose(state: GameState, label: string): GameState {
  const choice = missionScene(state, ctx)!.choices.find((c) => c.label === label);
  if (!choice) throw new Error(`No choice "${label}"`);
  return act(state, choice.action, ctx);
}

/** Past whatever the road brings: the first thing offered, if anything comes up. */
function pastTheRoad(state: GameState): GameState {
  const s = choose(state, 'Travel on');
  return s.mission?.roadEvent ? act(s, { type: 'missionDecide', optionIndex: 0 }, ctx) : s;
}

describe('a mission’s story', () => {
  it('passes validation, and rolls its twist when the job begins', () => {
    expect(validateContent(storyPack)).toEqual([]);
    expect(onJob().mission?.marks).toEqual(['desperate-men']);
  });

  it('shows its threads in words and dots', () => {
    expect(missionScene(onJob(), ctx)?.threads).toEqual([
      { label: 'Ume’s trust', word: 'Polite', level: 1, of: 3 },
      { label: 'Daylight', word: 'Morning', level: 3, of: 3 },
    ]);
  });

  it('a decision lands with the charge by its tone', () => {
    const kind = choose(onJob(), '“Not yet, actually.”');
    expect(kind.mission?.threads.trust).toBe(2);
    expect(kind.mission?.notes.slice(-2)).toEqual([
      { kind: 'choice', text: '“Not yet, actually.”' },
      { kind: 'story', text: 'She presses a rice ball on you.' },
    ]);
    const rude = choose(onJob(), '“That isn’t part of the job.”');
    expect(rude.mission?.threads.trust).toBe(0);
  });

  it('a failure moves the story on instead of docking the pay, and the ledger says why', () => {
    const s = choose(choose(onJob(), '“Not yet, actually.”'), 'Hurry her along');
    expect(s.mission?.rewardMultiplier).toBe(1);
    expect(s.mission?.marks).toContain('lost-light');
    expect(s.mission?.threads.daylight).toBe(0);
    expect(s.mission?.ledger).toEqual([
      { stageIndex: 1, text: 'Tried to hurry the blessing and lost the light.', tone: 'cost' },
    ]);
    // The stage for a lost light plays; the one for light to spare is passed over.
    expect(missionScene(s, ctx)?.prompt).toBe('Dusk falls before the pass.');
    const on = choose(s, 'Continue');
    expect(missionScene(on, ctx)?.prompt).toBe('A day on the hill road.');
  });

  it('a camp offers what fits, burns down after its picks, and the charge opens up once trusted', () => {
    let s = choose(choose(choose(onJob(), '“Not yet, actually.”'), 'Hurry her along'), 'Continue');
    s = pastTheRoad(s);
    const labels = missionScene(s, ctx)!.choices.map((c) => c.label);
    expect(labels).toEqual([
      // Your sensei leads a road job, and has an evening of their own by the fire.
      'Sit with Gōran',
      'Sit with Sister Ume',
      'Take first watch',
      'Drill by the fire',
      'Sleep properly',
      // A road job: your team and sensei are out here with you.
      'Sit with the others',
      'Turn in',
    ]);
    s = choose(s, 'Sit with Sister Ume');
    expect(s.mission?.marks).toContain('knows-why');
    expect(missionScene(s, ctx)!.choices.map((c) => c.label)).not.toContain('Sit with Sister Ume');
    s = choose(s, 'Take first watch');
    expect(s.mission?.marks).toContain('saw-scouts');
    // The fire burns down, told one of a few ways.
    expect(s.mission?.notes.at(-1)?.kind).toBe('story');
    expect(s.mission?.camp).toBeUndefined();

    // The ending that fits: she trusts you and you know why she walks.
    const done = choose(s, 'See it through');
    expect(done.mission).toBeNull();
    const report = done.reports.find((r) => r.kind === 'mission-complete');
    expect(report).toMatchObject({
      ryo: 500,
      ending: 'She hands you the taper and asks you to light her brother’s lantern.',
    });
  });

  it('your sensei, leading the job, has an evening of their own by the fire', () => {
    let s = choose(choose(choose(onJob(), '“Not yet, actually.”'), 'Hurry her along'), 'Continue');
    s = pastTheRoad(s);
    const before = s.people.bonds.goran?.points ?? 0;
    s = choose(s, 'Sit with Gōran');
    expect(s.people.bonds.goran?.points).toBe(before + FIRESIDE_BOND);
    // They talk, and then tell you what they saw of you.
    expect(s.mission?.notes.at(-1)).toMatchObject({ kind: 'voice', speaker: 'Gōran' });
    const labels = missionScene(s, ctx)!.choices.map((c) => c.label);
    expect(labels).not.toContain('Sit with Gōran');
    expect(s.mission?.camp?.done).toEqual([String(SENSEI_FIRESIDE)]);
  });

  it('a guarded charge says something else, and the plain ending plays', () => {
    let s = choose(
      choose(choose(onJob(), '“That isn’t part of the job.”'), 'Hurry her along'),
      'Continue',
    );
    s = pastTheRoad(s);
    s = choose(s, 'Sit with Sister Ume');
    expect(s.mission?.notes.at(-1)).toEqual({
      kind: 'story',
      text: 'She asks about your family instead.',
    });
    s = choose(s, 'Turn in');
    const done = choose(s, 'See it through');
    expect(done.reports.find((r) => r.kind === 'mission-complete')).toMatchObject({
      ryo: 400,
      ending: 'She thanks you at the shrine gate.',
    });
  });

  it('won’t let you skip a decision', () => {
    expect(blockerFor(onJob(), { type: 'missionContinue' }, ctx)).toBe('Decide first.');
  });
});

describe('the crew on a job', () => {
  it('feels a decision by their tastes, and the one who felt it most says so', () => {
    const start = onJob();
    const team = start.people.team!;
    const crewed: GameState = {
      ...start,
      mission: {
        ...start.mission!,
        crew: { kind: 'old-team', leaderId: null, memberIds: team.teammateIds },
      },
    };
    const option =
      STORY_JOB.stages[0]!.kind === 'decision' ? STORY_JOB.stages[0]!.options[1]! : null;
    const after = decide(crewed, ctx, STORY_JOB, option!);
    const moved = team.teammateIds.some(
      (id) => (after.people.bonds[id]?.points ?? 0) !== (start.people.bonds[id]?.points ?? 0),
    );
    const voiced = after.mission!.notes.some((n) => n.kind === 'voice');
    expect(moved).toBe(voiced);
  });
});
