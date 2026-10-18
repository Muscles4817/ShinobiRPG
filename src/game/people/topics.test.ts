import { createRng } from '@/core';
import type { PersonDef } from '@/content';
import { bondWith, recordTalk } from '@/systems/bonds';
import { ctx, newGame } from '@/test/gameFixtures';

import type { GameState } from '../state';
import { findPerson } from './cast';
import { pickConversation } from './talk';
import { hasHeard, heardId, picksOf, type TalkPick } from './topics';

/** Talk that turns through everything a person is, and never tells the same story twice running. */

const facet = (p: TalkPick) => (p.def.about ? `${p.def.about}:${p.topicKey ?? ''}` : null);

function talks(start: GameState, person: PersonDef, count: number): TalkPick[] {
  let state = start;
  const said: TalkPick[] = [];
  for (let day = 1; day <= count; day++) {
    const pick = pickConversation(state, ctx, person, createRng(day));
    said.push(pick);
    const bond = recordTalk(state.people.bonds[person.id] ?? bondWith(0), {
      day,
      delta: 0,
      heard: heardId(pick),
    });
    state = {
      ...state,
      people: { ...state.people, bonds: { ...state.people.bonds, [person.id]: bond } },
    };
  }
  return said;
}

describe('rotating topics', () => {
  const base = newGame();
  const person = findPerson(base, ctx, base.people.team!.teammateIds[0]!)!;
  const at = (points: number): GameState => ({
    ...base,
    people: { ...base.people, bonds: { ...base.people.bonds, [person.id]: bondWith(points) } },
  });

  it('fills a template once for each facet it fits: every trait, not only the first', () => {
    const traitTalk = ctx.content.conversations.all.find((c) => c.about === 'trait')!;
    const keys = picksOf(ctx, person, traitTalk).map((p) => p.topicKey);
    expect(keys).toEqual(
      person.traitIds.filter((t) => ctx.content.conversationTopics.some((x) => x.key === t)),
    );
    expect(keys.length).toBeGreaterThan(1);
  });

  it('turns to a facet not talked about lately', () => {
    const said = talks(at(12), person, 8).map(facet);
    const facets = new Set(said.filter((f) => f !== null));
    expect(facets.size).toBeGreaterThanOrEqual(3);
    said.forEach((f, i) => {
      if (i > 0 && f !== null) expect(f).not.toBe(said[i - 1]);
    });
  });

  it('never tells the same story twice running, even once everything has been said', () => {
    const said = talks(at(12), person, 60).map(heardId);
    said.forEach((id, i) => {
      if (i > 0) expect(id).not.toBe(said[i - 1]);
    });
  });

  it('reads a bare template id from an older save as said about the first facet', () => {
    const traitTalk = ctx.content.conversations.all.find((c) => c.about === 'trait')!;
    const [first, second] = picksOf(ctx, person, traitTalk);
    const heard = [traitTalk.id];
    expect(hasHeard(heard, first!, first!.topicKey)).toBe(true);
    expect(hasHeard(heard, second!, first!.topicKey)).toBe(false);
  });
});
