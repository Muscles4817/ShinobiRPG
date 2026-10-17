import { act, ctx, freshGame } from '@/test/gameFixtures';

import { blockerFor } from './dispatch';
import { CURRICULUM_ORDER, HEEDED_REGARD, beatDue } from './sensei/curriculum';
import { approachRegard, PREFERRED_REGARD, TOGETHER_REGARD } from './sensei/opening';
import type { GameState } from './state';
import { activeScene } from './views/peopleScenes';
import { senseiTestScene } from './views/senseiTest';
import { senseiWeekView } from './views/senseiWeek';

/** The first meeting with your sensei, and what they show you after. */

/** Teams read out, `senseiId` chosen (whether or not they were offered), the paper done. */
function metBy(senseiId: string): GameState {
  const assigned = act(freshGame(), { type: 'assignTeam' });
  const team = { ...assigned.people.team!, senseiOptions: [senseiId] };
  const offered = { ...assigned, people: { ...assigned.people, team } };
  const formed = act(offered, { type: 'chooseSensei', senseiId });
  return act(formed, { type: 'testChakraPaper' });
}

const PICK = (optionIndex: number) => ({ type: 'senseiTest', optionIndex }) as const;

describe('the first meeting', () => {
  it('follows the chakra paper, and nothing else happens until it is over', () => {
    const state = metBy('ito');
    expect(activeScene(state)).toBe('sensei-test');
    const scene = senseiTestScene(state, ctx)!;
    expect(scene.heading).toBe('The bells');
    expect(scene.lines[0]).toMatch(/^Ito ties two bells/);
    expect(scene.choices).toHaveLength(3);
    expect(blockerFor(state, { type: 'rest' }, ctx)).toMatch(/waiting to see what you can do/);
  });

  it('rates the way you go at it by their philosophy, and never fails you', () => {
    expect(approachRegard('teamwork', 'together')).toBe(PREFERRED_REGARD);
    expect(approachRegard('body', 'together')).toBe(TOGETHER_REGARD);
    expect(approachRegard('teamwork', 'alone')).toBeLessThan(0);
    const start = metBy('ito');
    // Ito teaches control: watching from the trees is their way.
    const patient = act(start, PICK(2));
    expect(patient.mentor.regard).toBe(start.mentor.regard + PREFERRED_REGARD);
    expect(senseiTestScene(patient, ctx)!.lines[0]).toMatch(/An hour of watching/);
  });

  it('ends by asking how much you want shown, and the day becomes a memory', () => {
    let state = metBy('ito');
    while (senseiTestScene(state, ctx)!.choices.length !== 2) state = act(state, PICK(0));
    const shown = act(state, PICK(0));
    // The sensei's day is done; next, word gets round and your rival comes to find you.
    expect(activeScene(shown)).toBe('rival');
    expect(shown.mentor.curriculum).toBe('on');
    const ids = [...shown.people.team!.teammateIds, 'ito'];
    expect(shown.village.memories.map((m) => m.personId).sort()).toEqual([...ids].sort());
    expect(shown.village.memories[0]?.text).toBe('the bells');
    expect(act(state, PICK(1)).mentor.curriculum).toBe('skipped');
  });

  it('a sensei who sets no test just asks', () => {
    const state = metBy('tetsu');
    const scene = senseiTestScene(state, ctx)!;
    expect(scene.heading).toBe('Meeting Tetsu');
    expect(scene.choices.map((c) => c.label)).toEqual([
      'Show me everything',
      'I paid attention at the academy',
    ]);
  });
});

describe('the curriculum', () => {
  function shown(senseiId: string): GameState {
    let state = metBy(senseiId);
    while (state.mentor.opening) state = act(state, PICK(0));
    return state.rival?.beat ? act(state, { type: 'answerRival', choiceIndex: 1 }) : state;
  }

  it('shows one thing a day, in the order their philosophy puts first', () => {
    const state = shown('goran');
    // Every sensei starts with the slip itself.
    expect(beatDue(state, ctx)?.id).toBe('week');
    const heard = act(state, { type: 'heedSensei' });
    expect(heard.mentor.beats).toEqual(['week']);
    expect(heard.mentor.regard).toBe(state.mentor.regard + HEEDED_REGARD);
    expect(heard.journal.entries.at(-1)?.heading).toBe('Your week');
    expect(beatDue(heard, ctx)).toBeNull();
    const tomorrow = act(heard, { type: 'sleep' });
    expect(beatDue(tomorrow, ctx)?.id).toBe(CURRICULUM_ORDER.body[0]);
    expect(senseiWeekView(tomorrow, ctx)?.lesson?.title).toBe('Sparring');
  });

  it('puts food first once you go hungry, whatever their order', () => {
    const heard = act(shown('goran'), { type: 'heedSensei' });
    const tomorrow = act(heard, { type: 'sleep' });
    const vitals = { ...tomorrow.character.vitals, satiety: 30 };
    const hungry = { ...tomorrow, character: { ...tomorrow.character, vitals } };
    expect(beatDue(hungry, ctx)?.id).toBe('eat');
  });

  it('waits until a thing makes sense: job preparation after the first job', () => {
    let state = shown('goran');
    for (const _ of ['week', 'spar', 'drills', 'eat', 'board']) {
      state = act(act(state, { type: 'heedSensei' }), { type: 'sleep' });
    }
    expect(beatDue(state, ctx)?.id).toBe('cooking');
    const worked = { ...state, standing: { ...state.standing, missionsCompleted: 1 } };
    expect(beatDue(worked, ctx)?.id).toBe('prep');
  });

  it('shows nothing to someone who said they know it', () => {
    let state = metBy('goran');
    while (state.mentor.opening) {
      state = act(state, PICK(senseiTestScene(state, ctx)!.choices.length === 2 ? 1 : 0));
    }
    expect(beatDue(state, ctx)).toBeNull();
    expect(blockerFor(state, { type: 'heedSensei' }, ctx)).toMatch(/nothing to show you/);
  });
});
