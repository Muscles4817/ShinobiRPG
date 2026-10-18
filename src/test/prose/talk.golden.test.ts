import { createRng } from '@/core';
import type { PersonDef } from '@/content';
import type { GameState } from '@/game';
import { DRINK_WAYS, drinkStory } from '@/game/bar';
import { findPerson } from '@/game/people/cast';
import { registerOf } from '@/game/people/register';
import { pickConversation, topicFor } from '@/game/people/talk';
import { toneReaction } from '@/game/people/together';
import { coachAfterLesson } from '@/game/sensei/coaching';
import { mentorOf } from '@/game/sensei/plan';
import { voiceOf } from '@/game/story/voices';
import { conversationScene } from '@/game/views/peopleScenes';
import { VOICE_MOMENTS } from '@/content';
import { bondWith, landingOf } from '@/systems/bonds';
import { act, ctx, lastEntry, newGame } from '@/test/gameFixtures';

import { recorder, type Recorder } from './recorder';

/**
 * What people say, side by side: the same templates in different mouths, each reply to each
 * tone, a sensei's coaching (met and missed), crew voices for every moment, and a drink.
 */

function talkThrough(r: Recorder, state: GameState, person: PersonDef, convId: string) {
  const def = ctx.content.conversations.require(convId);
  const facets = [person.role, person.specialty ?? 'no art', ...person.traitIds].join(', ');
  const register = registerOf(ctx, person);
  r.say(`\n=== ${convId} with ${person.name} (${facets}; ${register}) ===`);
  def.choices.forEach((_, choiceIndex) => {
    const conversation = {
      personId: person.id,
      conversationId: convId,
      topicKey: null,
      answer: null,
    };
    const s: GameState = { ...state, people: { ...state.people, conversation } };
    if (choiceIndex === 0) r.say(`opener: ${conversationScene(s, ctx)?.opener ?? ''}`);
    const answered = conversationScene(act(s, { type: 'reply', choiceIndex }), ctx)?.answer;
    r.say(`  you: ${answered?.said ?? ''}`);
    r.say(`    (${landingOf(answered?.delta ?? 0)}) ${answered?.reply ?? ''}`);
  });
}

function templates(r: Recorder, state: GameState, people: readonly PersonDef[]) {
  for (const def of ctx.content.conversations.all.filter((c) => c.about)) {
    const about = def.about;
    if (!about) continue;
    const speakers = people.filter((p) => topicFor(ctx, p, about)).slice(0, 2);
    for (const p of speakers) talkThrough(r, state, p, def.id);
  }
}

/** A week of talks with one friend: what they turn to each day, and what you hear. */
function rotation(r: Recorder, start: GameState, person: PersonDef) {
  r.say(`\n=== a week of talk with ${person.name} ===`);
  const bonds = { ...start.people.bonds, [person.id]: bondWith(12) };
  let state: GameState = { ...start, people: { ...start.people, bonds } };
  for (let day = 1; day <= 7; day++) {
    const { def, topicKey } = pickConversation(state, ctx, person, createRng(day));
    const conversation = { personId: person.id, conversationId: def.id, topicKey, answer: null };
    const talking: GameState = { ...state, people: { ...state.people, conversation } };
    r.say(
      `day ${day}, ${def.id} (${topicKey ?? 'own'}): ${conversationScene(talking, ctx)?.opener ?? ''}`,
    );
    state = act(act(talking, { type: 'reply', choiceIndex: 0 }), { type: 'endConversation' });
  }
}

function coaching(r: Recorder, state: GameState, sensei: PersonDef) {
  for (const missed of [false, true]) {
    const assignment = { stat: 'speed' as const, from: 0, target: missed ? 999 : 0 };
    const s = { ...state, character: { ...state.character, assignment } };
    const entry = lastEntry(coachAfterLesson(s, ctx, sensei));
    const chips = (entry?.chips ?? []).map((c) => `[${c.label}]`).join(' ');
    r.say(
      `\ncoaching by ${sensei.name}, ${missed ? 'missed' : 'met'}: ${entry?.text ?? ''} ${chips}`,
    );
  }
}

function voices(r: Recorder, state: GameState, people: readonly PersonDef[]) {
  r.say('\n=== crew voices ===');
  for (const person of people) {
    for (const moment of VOICE_MOMENTS) {
      const note = voiceOf(state, ctx, { person, moment });
      r.say(`${person.name}, ${moment}: ${note && 'text' in note ? note.text : ''}`);
    }
  }
}

function drinks(r: Recorder, people: readonly PersonDef[]) {
  r.say('\n=== drinks ===');
  for (const person of people) {
    for (const way of DRINK_WAYS) {
      r.say(
        `${person.name}, ${way.label}: ${drinkStory(way, person, toneReaction(ctx, person, way.tone))}`,
      );
    }
  }
}

it('reads what people say', async () => {
  const r = recorder(ctx);
  const state = newGame();
  const mates = (state.people.team?.teammateIds ?? []).flatMap((id) => {
    const p = findPerson(state, ctx, id);
    return p ? [p] : [];
  });
  const sensei = mentorOf(state, ctx);
  const villagers = ctx.content.people.all.filter((p) => p.role === 'villager').slice(0, 2);
  const people = [...mates, ...(sensei ? [sensei] : []), ...villagers];
  templates(r, state, people);
  for (const mate of mates) rotation(r, state, mate);
  if (sensei) coaching(r, state, sensei);
  voices(r, state, mates);
  drinks(r, people.slice(0, 3));
  await expect(r.text()).toMatchFileSnapshot('./goldens/talk.txt');
});
