import { addScroll } from '@/systems/inventory';
import { SOLO } from '@/systems/missions';
import type { StudySource } from '@/systems/techniques';
import { act, ctx, newGame, withAllStats } from '@/test/gameFixtures';

import { dispatch } from './dispatch';
import { noteGradeUps } from './gradeUps';
import { studyPointsFor } from './learning';
import { afterStage } from './missionFlow';
import type { GameState } from './state';
import { hubView } from './views/hub';
import { libraryView, scrollDesk } from './views/library';

/** Where techniques come from: the library's stacks, scrolls you own, and missions' gifts. */

const LIBRARY_SCROLL = 'tide-lash';
/** The festival job hands over Kindled Pulse's scroll and the Hungry Lantern. */
const GIFT_MISSION = 'festival-haunting';

function chunin(state: GameState): GameState {
  return { ...state, standing: { ...state.standing, rank: 'chunin' } };
}

/** A grade D ninjutsu user, so a rank C scroll is learnable (one above: unstable). */
function ready(): GameState {
  return withAllStats(newGame(), 10);
}

function finished(state: GameState, missionId: string): GameState {
  const def = ctx.content.missions.require(missionId);
  const mission = {
    missionId,
    crew: SOLO,
    stageIndex: def.stages.length,
    rewardMultiplier: 1,
    notes: [],
    marks: [],
    threads: {},
    ledger: [],
  };
  return afterStage({ ...state, mission }, ctx);
}

describe('the library', () => {
  it('keeps its stacks for chūnin and above', () => {
    const study = { type: 'study', techniqueId: LIBRARY_SCROLL } as const;
    expect(dispatch(ready(), study, ctx)).toEqual({
      ok: false,
      error: 'The restricted stacks are for chūnin and above.',
    });
    const after = act(chunin(ready()), study);
    expect(after.techniques.progress[LIBRARY_SCROLL]).toBeGreaterThan(0);
  });

  it('closes at night', () => {
    const night = chunin(ready());
    const shut = { ...night, time: { ...night.time, slot: 3 } };
    const result = dispatch(shut, { type: 'study', techniqueId: LIBRARY_SCROLL }, ctx);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toMatch(/is closed/);
  });

  it('teaches a little better than a bare scroll', () => {
    const { character } = ready();
    const def = ctx.content.techniques.require(LIBRARY_SCROLL);
    const at = (source: StudySource) =>
      studyPointsFor(character, def, ctx, { aptitude: 1, source });
    expect(at('library')).toBeGreaterThan(at('scroll'));
    expect(at('teacher')).toBeGreaterThan(at('library'));
  });

  it('shows the lattice to a genin and the shelves by art to a chūnin', () => {
    const genin = libraryView(ready(), ctx)!;
    expect(genin.locked).toBe('The restricted stacks are for chūnin and above.');
    expect(genin.unread).toBeGreaterThan(0);
    const open = libraryView(chunin(ready()), ctx)!;
    expect(open.locked).toBeNull();
    const ninjutsu = open.stacks.find((s) => s.discipline === 'ninjutsu');
    expect(ninjutsu?.scrolls.map((s) => s.id)).toContain(LIBRARY_SCROLL);
    const card = hubView(ready(), ctx).places.find((p) => p.kind === 'library');
    expect(card?.line).toBe('For chūnin and above');
  });
});

describe('scrolls you own', () => {
  const read = { type: 'studyScroll', techniqueId: 'kindled-pulse' } as const;

  it('can only be read once you have one', () => {
    expect(dispatch(ready(), read, ctx)).toEqual({
      ok: false,
      error: 'You don’t have that scroll.',
    });
  });

  it('are read at home, at a bare scroll’s pace, by the same rank gate', () => {
    const owner = { ...ready(), inventory: addScroll(ready().inventory, 'kindled-pulse') };
    expect(scrollDesk(owner, ctx).scrolls.map((s) => s.id)).toEqual(['kindled-pulse']);
    const after = act(owner, read);
    expect(after.techniques.progress['kindled-pulse']).toBeGreaterThan(0);
    const novice = { ...withAllStats(newGame(), 5), inventory: owner.inventory };
    expect(dispatch(novice, read, ctx)).toEqual({
      ok: false,
      error: "Needs D taijutsu; you're E.",
    });
  });
});

describe('mission gifts', () => {
  it('hand over a scroll and a named weapon, shown on the debrief, once', () => {
    const done = finished(newGame(), GIFT_MISSION);
    expect(done.inventory.scrolls['kindled-pulse']).toBe(true);
    expect(done.inventory.gear).toContain('hungry-lantern');
    expect(done.reports.at(-1)).toMatchObject({
      kind: 'mission-complete',
      scroll: 'Kindled Pulse',
      gear: 'The Hungry Lantern',
    });
    const again = finished(done, GIFT_MISSION);
    const report = again.reports.at(-1);
    expect(report?.kind === 'mission-complete' && report.scroll).toBeFalsy();
    expect(again.inventory.gear.filter((g) => g === 'hungry-lantern')).toHaveLength(1);
  });

  it('count among what a grade opens', () => {
    const base = withAllStats(newGame(), 5);
    const owner = { ...base, inventory: addScroll(base.inventory, 'kindled-pulse') };
    const withTaijutsu = (value: number): GameState => ({
      ...owner,
      character: { ...owner.character, stats: { ...owner.character.stats, taijutsu: value } },
    });
    const noted = noteGradeUps(withTaijutsu(7.95), withTaijutsu(8.05), ctx);
    const card = noted.reports.find((r) => r.kind === 'grade');
    expect(card?.kind === 'grade' && card.opens).toContainEqual({
      name: 'Kindled Pulse',
      where: 'Your scrolls',
    });
  });
});
