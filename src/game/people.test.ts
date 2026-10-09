import { reactionTo } from '@/systems/bonds';
import { act, ctx, freshGame, newGame } from '@/test/gameFixtures';

import { blockerFor, dispatch } from './dispatch';
import { tastesOf } from './people/cast';
import { deserialize, serialize } from './persistence/save';
import type { GameState } from './state';
import { hubView } from './views/hub';
import { bondsView, personSheet } from './views/people';
import { activeScene, conversationScene, teamScene } from './views/peopleScenes';

const assigned = () => act(freshGame(), { type: 'assignTeam' });

function talkTo(state: GameState, personId: string, choiceIndex = 0): GameState {
  const talking = act(state, { type: 'talk', personId });
  return act(talking, { type: 'reply', choiceIndex });
}

describe('team assignment', () => {
  it('comes first: nothing else until your team is formed', () => {
    const state = freshGame();
    expect(activeScene(state)).toBe('team');
    expect(blockerFor(state, { type: 'rest' }, ctx)).toBe('Your team has not been assigned yet.');
    expect(teamScene(state, ctx)?.assign).toEqual({ type: 'assignTeam' });
  });

  it('generates classmates with fresh names, two of them your teammates', () => {
    const state = assigned();
    const names = state.people.generated.map((p) => p.name);
    expect(names).toHaveLength(6);
    expect(new Set(names).size).toBe(6);
    expect(names).not.toContain('Kaito');
    expect(state.people.team?.teammateIds).toEqual(['genin-1', 'genin-2']);
    expect(state.people.bonds['genin-1']?.points).toBe(10);
  });

  it('gives each generated classmate a different family', () => {
    const families = assigned().people.generated.map((p) => p.familyName);
    expect(new Set(families).size).toBe(families.length);
  });

  it('generates the same class for the same seed', () => {
    expect(assigned().people.generated).toEqual(assigned().people.generated);
  });

  it('generated genin have compatible traits and real haunts', () => {
    const places = new Set(ctx.content.locations.require('torogakure').places.map((p) => p.id));
    for (const person of assigned().people.generated) {
      const [a, b] = person.traitIds.map((id) => ctx.content.traits.require(id));
      expect(a?.opposite).not.toBe(b?.id);
      for (const placeId of Object.values(person.schedule)) {
        if (placeId !== null) expect(places.has(placeId)).toBe(true);
      }
      expect(person.schedule.night).toBeNull();
    }
  });

  it('offers the best-fitting sensei and one with a different specialty', () => {
    const scene = teamScene(assigned(), ctx)!;
    const [best, other] = scene.senseis;
    expect(best?.specialty?.id).toBe('taijutsu');
    expect(best?.reasons[0]).toBe('Your A in Taijutsu');
    expect(other?.specialty?.id).not.toBe('taijutsu');
  });

  it('forms the team with the sensei you choose', () => {
    const state = assigned();
    const senseiId = state.people.team!.senseiOptions[1]!;
    const formed = act(state, { type: 'chooseSensei', senseiId });
    expect(formed.people.team?.senseiId).toBe(senseiId);
    expect(formed.reports.at(-1)).toMatchObject({ kind: 'team-formed' });
    expect(activeScene(formed)).toBeNull();
    expect(bondsView(formed, ctx).team.map((c) => c.relation)).toEqual([
      'sensei',
      'teammate',
      'teammate',
    ]);
  });

  it('refuses a jōnin who did not ask for you', () => {
    const result = dispatch(assigned(), { type: 'chooseSensei', senseiId: 'rin' }, ctx);
    expect(result).toEqual({ ok: false, error: 'That jōnin did not ask for you.' });
  });
});

describe('talking', () => {
  it('only to people who are around', () => {
    const state = newGame();
    expect(blockerFor(state, { type: 'talk', personId: 'kenji' }, ctx)).toBe(
      'Kenji isn’t around right now.',
    );
    expect(blockerFor(state, { type: 'talk', personId: 'goran' }, ctx)).toBeNull();
  });

  it('a reply moves the bond by how the listener feels about its tone', () => {
    const state = act(newGame(), { type: 'talk', personId: 'kaen' });
    const scene = conversationScene(state, ctx)!;
    expect(scene.opener).toContain('Kaito');
    const after = act(state, { type: 'reply', choiceIndex: 0 });
    const def = ctx.content.conversations.require('kaen-fire');
    const expected = reactionTo(
      tastesOf(ctx.content.people.require('kaen'), ctx),
      def.choices[0]!.tone,
    );
    expect(after.people.bonds.kaen?.points).toBe(expected);
    expect(conversationScene(after, ctx)?.answer?.delta).toBe(expected);
  });

  it('people say their own lines first', () => {
    const state = act(newGame(), { type: 'talk', personId: 'kaen' });
    expect(state.people.conversation?.conversationId).toBe('kaen-fire');
  });

  it('once a day per person, and the conversation must end before anything else', () => {
    const replied = talkTo(newGame(), 'goran');
    expect(blockerFor(replied, { type: 'rest' }, ctx)).toBe(
      'You are in the middle of a conversation.',
    );
    const done = act(replied, { type: 'endConversation' });
    expect(blockerFor(done, { type: 'talk', personId: 'goran' }, ctx)).toMatch(/already talked/);
  });

  it('getting closer reveals what someone is like', () => {
    const state = newGame();
    expect(personSheet(state, ctx, 'tetsu')?.traits).toBeNull();
    const friendly = {
      ...state,
      people: { ...state.people, bonds: { tetsu: { points: 30, lastTalkDay: null, heard: [] } } },
    };
    const sheet = personSheet(friendly, ctx, 'tetsu')!;
    expect(sheet.traits?.map((t) => t.name)).toEqual(['Focused', 'Humble']);
    expect(sheet.likes).toContain('Quiet');
    expect(sheet.reveal).toBeNull();
  });

  it('records when a bond reaches a new stage', () => {
    const state = newGame();
    const close = {
      ...state,
      people: { ...state.people, bonds: { kaen: { points: 9, lastTalkDay: null, heard: [] } } },
    };
    const after = talkTo(close, 'kaen', 0);
    expect(after.people.conversation?.answer?.newStage).toBe(1);
    expect(after.journal.entries.at(-1)?.chips?.[0]?.label).toBe('Acquaintance');
  });

  it('shows who is at each place', () => {
    const training = hubView(newGame(), ctx).places.find((p) => p.id === 'training-grounds');
    expect(training?.people.map((f) => f.name)).toContain('Gōran');
    const traveller = { ...newGame(), locationId: 'sakyugakure' };
    expect(bondsView(traveller, ctx).team[0]?.where).toBe('Away');
  });
});

describe('saves', () => {
  it('a version 3 save gets people and is sent to team assignment', () => {
    const { people: _people, ...v3state } = newGame();
    const loaded = deserialize(JSON.stringify({ version: 3, state: v3state }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.people).toEqual({
      generated: [],
      bonds: {},
      team: null,
      conversation: null,
    });
    expect(activeScene(loaded.value)).toBe('team');
  });

  it('round-trips bonds and a conversation in progress', () => {
    const state = act(newGame(), { type: 'talk', personId: 'kaen' });
    expect(deserialize(serialize(state))).toEqual({ ok: true, value: state });
  });
});
