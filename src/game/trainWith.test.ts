import { bondWith } from '@/systems/bonds';
import { act, ctx, newGame, withAllStats } from '@/test/gameFixtures';

import { blockerFor } from './dispatch';
import { personStats } from './people/progress';
import { teachingFactor } from './people/teachingFactor';
import { requirePerson } from './people/cast';
import { deserialize, serialize } from './persistence/save';
import type { GameState } from './state';
import { hubView } from './views/hub';
import { trainingView } from './views/training';

const MORNING = 0;
const EVENING = 2;
const NIGHT = 3;

function at(state: GameState, slot: number, day = state.time.day): GameState {
  return { ...state, time: { day, slot } };
}

function withBond(state: GameState, personId: string, points: number): GameState {
  return {
    ...state,
    people: { ...state.people, bonds: { ...state.people.bonds, [personId]: bondWith(points) } },
  };
}

function withSensei(state: GameState, senseiId: string): GameState {
  const team = state.people.team!;
  return { ...state, people: { ...state.people, team: { ...team, senseiId } } };
}

const goranTaijutsu = { type: 'trainWith', personId: 'goran', statId: 'taijutsu' } as const;

describe('training with your sensei (the weekly lesson)', () => {
  it('grows the stat they steer you to, builds a little bond and shows the lesson card', () => {
    const state = newGame();
    const after = act(state, goranTaijutsu);
    expect(after.character.stats.taijutsu).toBeGreaterThan(state.character.stats.taijutsu);
    // A harsh teacher: half the usual six.
    expect(after.people.bonds.goran?.points).toBe((state.people.bonds.goran?.points ?? 0) + 3);
    expect(after.reports.at(-1)).toMatchObject({
      kind: 'lesson',
      sensei: 'Gōran',
      technique: null,
    });
    expect(after.wallet.ryo).toBe(state.wallet.ryo);
  });

  it('is once a week, and says when the next one is', () => {
    const after = act(newGame(), goranTaijutsu);
    expect(blockerFor(after, goranTaijutsu, ctx)).toBe('You’ve already trained with Gōran today.');
    expect(blockerFor(at(after, MORNING, 2), goranTaijutsu, ctx)).toBe(
      'Your next lesson is in six days.',
    );
    expect(blockerFor(at(after, MORNING, 8), goranTaijutsu, ctx)).toBeNull();
  });

  it('beats drilling alone: a better teacher is worth more than solo practice', () => {
    const state = newGame();
    const lesson = act(state, goranTaijutsu).character.stats.taijutsu;
    const drill = act(state, { type: 'train', trainingId: 'post-kicks' }).character.stats.taijutsu;
    expect(lesson - state.character.stats.taijutsu).toBeGreaterThan(
      drill - state.character.stats.taijutsu,
    );
  });

  it('chooses what you train until you are close, then lets you pick', () => {
    const strength = { ...goranTaijutsu, statId: 'strength' } as const;
    expect(blockerFor(newGame(), strength, ctx)).toBe(
      'Gōran decides what you work on: taijutsu today.',
    );
    expect(blockerFor(withBond(newGame(), 'goran', 55), strength, ctx)).toBeNull();
    const offer = trainingView(newGame(), ctx)!.teachers[0]!;
    expect(offer.isSensei).toBe(true);
    expect(offer.open.map((s) => s.id)).toEqual(['taijutsu']);
    expect(offer.locked.find((s) => s.id === 'strength')?.blocker).toMatch(/decides/);
    expect(offer.steering).toBe('Gōran decides what you work on until you are close friends.');
  });

  it('signs a library permit at a lesson once you are friends and an art is at C', () => {
    const friends = withBond(newGame(), 'goran', 30);
    expect(act(friends, goranTaijutsu).people.permits).toEqual([]);
    const after = act(withAllStats(friends, 14), goranTaijutsu);
    expect(after.people.permits).toEqual(['library']);
    expect(after.journal.entries.map((e) => e.heading)).toContain('A library permit');
  });

  it('teaches friends their signature technique', () => {
    const after = act(withBond(newGame(), 'goran', 30), goranTaijutsu);
    expect(after.techniques.progress['iron-gate-palm']).toBeGreaterThan(0);
    expect(trainingView(after, ctx)?.teachers[0]?.signature).toMatchObject({
      name: 'Iron Gate Palm',
      locked: null,
    });
    expect(trainingView(newGame(), ctx)?.teachers[0]?.signature?.locked).toBe(
      'Taught once you and Gōran are friends.',
    );
  });

  it('says when a teacher’s technique is also on the academy rack', () => {
    const koun = trainingView(newGame(), ctx)?.teachers.find((t) => t.person.id === 'koun');
    expect(koun?.signature).toMatchObject({
      name: 'Temple-Bell Palm',
      locked: 'Taught once you and Kōun are friends, or study the scroll at the Academy.',
    });
  });

  it('comes to the training ground for you by day, but not at night', () => {
    expect(blockerFor(at(newGame(), EVENING), goranTaijutsu, ctx)).toBeNull();
    expect(blockerFor(at(newGame(), NIGHT), goranTaijutsu, ctx)).toBe(
      'Gōran is at the Paper Lantern right now.',
    );
  });

  it('flags a lesson ready on the village screen', () => {
    const card = hubView(newGame(), ctx).places.find((p) => p.kind === 'training');
    expect(card?.badge).toBe('Lesson ready');
  });

  it('needs energy, and someone ahead of you', () => {
    const tired = newGame();
    const drained = {
      ...tired,
      character: { ...tired.character, vitals: { ...tired.character.vitals, energy: 10 } },
    };
    expect(blockerFor(drained, goranTaijutsu, ctx)).toBe('Needs 30 energy. Nap or eat first.');
    expect(blockerFor(withAllStats(newGame(), 40), goranTaijutsu, ctx)).toBe(
      'Gōran isn’t ahead of you in taijutsu.',
    );
  });
});

describe('training with other teachers', () => {
  const akariNinjutsu = { type: 'trainWith', personId: 'akari', statId: 'ninjutsu' } as const;

  it('charges their price each session and keeps to their weekly time', () => {
    const evening = at(newGame(), EVENING);
    const broke = { ...evening, wallet: { ryo: 10 } };
    expect(blockerFor(broke, akariNinjutsu, ctx)).toBe('Akari asks 40 ryo a session.');
    const flush = { ...evening, wallet: { ryo: 100 } };
    const after = act(flush, akariNinjutsu);
    expect(after.wallet.ryo).toBe(60);
    expect(after.character.stats.ninjutsu).toBeGreaterThan(flush.character.stats.ninjutsu);
    expect(after.reports.some((r) => r.kind === 'lesson')).toBe(false);
    expect(blockerFor(at(after, EVENING, 2), akariNinjutsu, ctx)).toBe(
      'Akari has no more time for you until next week, in six days.',
    );
  });

  it('asks for a bond and a finished job before teaching someone else’s genin', () => {
    const state = withBond(withSensei(newGame(), 'akari'), 'goran', 0);
    expect(blockerFor(state, goranTaijutsu, ctx)).toBe(
      'Gōran only trains acquaintances. You are strangers.',
    );
    const known = withBond(state, 'goran', 10);
    expect(blockerFor(known, goranTaijutsu, ctx)).toBe(
      'Gōran wants you to finish “Medicine for Kuroda Farm” first.',
    );
    const done = { ...known, board: { ...known.board, completed: ['kuroda-medicine'] } };
    expect(blockerFor(done, goranTaijutsu, ctx)).toBeNull();
    const price = trainingView(known, ctx)!.teachers.find((t) => t.person.id === 'goran')!.price;
    expect(price.map((p) => p.met)).toEqual([true, false]);
  });

  it('a favour is done by saying yes in conversation', () => {
    const afternoon = at(newGame(), 1);
    const talking = act(afternoon, { type: 'talk', personId: 'yomi' });
    expect(talking.people.conversation?.conversationId).toBe('yomi-grave');
    const done = act(talking, { type: 'reply', choiceIndex: 0 });
    expect(done.people.favours).toEqual(['yomi-grave-lantern']);
  });

  it('a genin ahead of you practises with you, and you both grow', () => {
    const weak = withBond(withAllStats(newGame(), 2), 'kaen', 10);
    const kaenNinjutsu = { type: 'trainWith', personId: 'kaen', statId: 'ninjutsu' } as const;
    const kaen = requirePerson(weak, ctx, 'kaen');
    const after = act(weak, kaenNinjutsu);
    expect(after.character.stats.ninjutsu).toBeGreaterThan(2);
    expect(personStats(kaen, after).ninjutsu).toBeGreaterThan(personStats(kaen, weak).ninjutsu);
    expect(blockerFor(at(after, MORNING, 2), kaenNinjutsu, ctx)).toBeNull();
    const seer = {
      ...weak,
      character: { ...weak.character, stats: { ...weak.character.stats, genjutsu: 9 } },
    };
    expect(blockerFor(seer, { ...kaenNinjutsu, statId: 'genjutsu' }, ctx)).toBe(
      'Kaen isn’t ahead of you in genjutsu.',
    );
    expect(blockerFor(weak, { ...kaenNinjutsu, statId: 'reserves' }, ctx)).toBe(
      'Nobody drills chakra reserves. It grows with stamina.',
    );
  });

  it('a clan head teaches the clan’s own techniques only to its members', () => {
    const daigoKenjutsu = { type: 'trainWith', personId: 'daigo', statId: 'kenjutsu' } as const;
    const evening = withBond({ ...at(newGame(), EVENING), wallet: { ryo: 100 } }, 'daigo', 30);
    // Forge Cut is kenjutsu, so it needs a blade in hand (4.3) whoever teaches it.
    const blade = 'lantern-steel-tanto';
    const as = (clanId: string): GameState => ({
      ...evening,
      character: { ...evening.character, clanId },
      inventory: { ...evening.inventory, gear: [blade], equipped: { weapon: blade } },
    });
    const offer = (state: GameState) =>
      trainingView(state, ctx)?.teachers.find((t) => t.person.id === 'daigo');
    expect(offer(as('none'))?.signature).toBeNull();
    expect(act(as('none'), daigoKenjutsu).techniques.progress['forge-cut']).toBeUndefined();
    expect(offer(as('kurogane'))?.signature?.name).toBe('Forge Cut');
    // A quick study may take the whole technique in one session.
    const taught = act(as('kurogane'), daigoKenjutsu).techniques;
    expect(taught.known.includes('forge-cut') || (taught.progress['forge-cut'] ?? 0) > 0).toBe(
      true,
    );
  });

  it('a jōnin teaches better than a genin, and civilians don’t teach', () => {
    const state = newGame();
    expect(teachingFactor(requirePerson(state, ctx, 'goran'))).toBeGreaterThan(
      teachingFactor(requirePerson(state, ctx, 'kaen')),
    );
    expect(
      blockerFor(state, { type: 'trainWith', personId: 'tsune', statId: 'perception' }, ctx),
    ).toBe('Tsune doesn’t train shinobi.');
  });
});

describe('saves', () => {
  it('a version 19 save turns the last lesson into the sensei’s session that week', () => {
    const state = newGame();
    const { taught: _t, favours: _f, ...people } = state.people;
    const { completed: _c, ...board } = state.board;
    const team = { ...state.people.team!, lastLessonDay: 3 };
    const v19 = { version: 19, state: { ...state, board, people: { ...people, team } } };
    const loaded = deserialize(JSON.stringify(v19));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.people.taught).toEqual({ goran: { week: 0, used: 1, lastDay: 3 } });
    expect(loaded.value.people.team).not.toHaveProperty('lastLessonDay');
    expect(loaded.value.people.favours).toEqual([]);
    expect(loaded.value.board.completed).toEqual([]);
    expect(deserialize(serialize(loaded.value)).ok).toBe(true);
  });
});
