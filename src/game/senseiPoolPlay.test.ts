import { bondWith } from '@/systems/bonds';
import { act, ctx, freshGame, newGame, veteran } from '@/test/gameFixtures';

import { availability, crewFor } from './board';
import { everyone } from './people/cast';
import { drawnSenseis, POOL_IN_VILLAGE } from './people/pooled';
import { offerSenseis } from './people/senseis';
import type { GameState } from './state';
import { farewellDue } from './sensei/farewell';
import { personCard } from './views/people';
import { personSheet } from './views/personSheet';

/** Generated senseis in play: who a save meets, being offered and chosen, and their story. */

function withSeed(state: GameState, seed: number): GameState {
  return { ...state, board: { ...state.board, seed } };
}

function under(senseiId: string, state: GameState): GameState {
  const team = { ...state.people.team!, senseiId };
  return { ...state, people: { ...state.people, team } };
}

function hearing(state: GameState, personId: string, conversationId: string): GameState {
  const conversation = { personId, conversationId, answer: null };
  return { ...state, people: { ...state.people, conversation } };
}

describe('the generated senseis a save meets', () => {
  it('are a few, drawn from the seed, all different from each other', () => {
    const state = newGame();
    const ids = drawnSenseis(state, ctx);
    expect(ids).toHaveLength(POOL_IN_VILLAGE);
    expect(drawnSenseis(state, ctx)).toEqual(ids);
    const people = ids.map((id) => ctx.content.people.require(id));
    for (const key of ['past', 'temperament'] as const) {
      expect(new Set(people.map((p) => p.sensei?.pooled?.[key])).size).toBe(ids.length);
    }
    expect(new Set(people.map((p) => p.specialty)).size).toBe(ids.length);
    expect(drawnSenseis(withSeed(state, 99), ctx)).not.toEqual(ids);
  });

  it('live in the village; the rest of the pool is elsewhere', () => {
    const state = newGame();
    const pooled = everyone(state, ctx).filter((p) => p.sensei?.pooled);
    expect(pooled.map((p) => p.id).sort()).toEqual([...drawnSenseis(state, ctx)].sort());
  });

  it('are offered alongside the pack’s own, and some save meets one as its sensei', () => {
    const offered = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].flatMap((seed) => {
      const state = withSeed(freshGame(), seed);
      return offerSenseis(state.character, everyone(state, ctx));
    });
    expect(offered.some((id) => id.startsWith('pool-'))).toBe(true);
  });

  it('a chosen one stays in the world whatever the draw', () => {
    const state = newGame();
    const stranger = ctx.content.people.all.find(
      (p) => p.sensei?.pooled && !drawnSenseis(state, ctx).includes(p.id),
    )!;
    const theirs = under(stranger.id, state);
    expect(everyone(theirs, ctx).some((p) => p.id === stranger.id)).toBe(true);
  });
});

describe('a generated sensei’s story', () => {
  it('tells their past over four talks, and the last opens the arc they lead', () => {
    const state = newGame();
    const [id] = drawnSenseis(state, ctx);
    const sensei = ctx.content.people.require(id!);
    const ways = sensei.sensei!.ways!;
    const start = under(sensei.id, veteran(state, 5));
    const close = {
      ...start,
      people: { ...start.people, bonds: { ...start.people.bonds, [sensei.id]: bondWith(120) } },
    };
    const [first, , third, last] = ways.story.beats;
    expect(personSheet(close, ctx, sensei.id)?.carries).toBeNull();
    const told = act(act(hearing(close, sensei.id, third!), { type: 'reply', choiceIndex: 0 }), {
      type: 'endConversation',
    });
    expect(personSheet(told, ctx, sensei.id)?.carries).toBe(ways.story.wound);
    const arc = ctx.content.arcs.require(ways.story.arcId!);
    const job = ctx.content.missions.require(arc.acts[0]!.jobs[0]!);
    expect(availability(told, ctx, job).kind).toBe('absent');
    const asked = act(hearing(told, sensei.id, last!), { type: 'reply', choiceIndex: 0 });
    const after = act(asked, { type: 'endConversation' });
    expect(availability(after, ctx, job).kind).toBe('arc');
    expect(crewFor(after, ctx, job)).toMatchObject({ kind: 'old-team', leaderId: sensei.id });
    expect(first).toBeDefined();
  });
});

describe('a generated sensei’s voice', () => {
  it('is theirs when the work they set isn’t done, and at the farewell', () => {
    const state = newGame();
    const [id] = drawnSenseis(state, ctx);
    const sensei = ctx.content.people.require(id!);
    const voice = sensei.sensei!.voice!;
    const theirs = under(sensei.id, state);
    const assignment = { stat: 'strength' as const, from: 0, target: 999 };
    const set = { ...theirs, character: { ...theirs.character, assignment } };
    const taught = act(set, {
      type: 'trainWith',
      personId: sensei.id,
      statId: sensei.sensei!.specialty,
    });
    const word = taught.journal.entries.find((e) => e.heading === `${sensei.name}’s word`);
    expect(word?.text).toContain(voice.scold);
    const ceremony = {
      ...theirs,
      exams: { ...theirs.exams, ceremony: { rank: 'chunin' as const, route: 'exam' as const } },
    };
    expect(farewellDue(ceremony, ctx)?.words).toContain(voice.catchphrase);
  });
});

describe('where a generated sensei spends the evening', () => {
  it('is where their temperament goes, named without a doubled article', () => {
    const state = newGame();
    const regular = ctx.content.people.all.find(
      (p) => p.sensei?.pooled?.temperament === 'showboat',
    )!;
    const evening = { ...under(regular.id, state), time: { ...state.time, slot: 2 } };
    expect(personCard(evening, ctx, regular).where).toBe('At The Paper Lantern');
  });
});
