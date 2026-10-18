import { reactionTo, recordTalk, stageName, stageOf, talkedToday } from '@/systems/bonds';

import { busyReason, chip, firstBlocker, log } from '../ops';
import { bondOf, findPerson, requirePerson, tastesOf, whereNow } from '../people/cast';
import { behindGate } from '../compounds';
import { warmed } from '../people/warmth';
import { pickConversation } from '../people/talk';
import { heardId, talkPick } from '../people/topics';
import { festivalBondBonus } from '../village';
import type { GameState } from '../state';
import type { ActionHandler, ActionOf } from './types';

/** A reply that does a teacher's favour marks it done, once. */
function withFavour(done: readonly string[], favour: string | undefined): readonly string[] {
  return favour === undefined || done.includes(favour) ? done : [...done, favour];
}

export const talk: ActionHandler<ActionOf<'talk'>> = {
  check(state, action, ctx) {
    const person = findPerson(state, ctx, action.personId);
    if (!person) return 'You don’t know anyone by that name.';
    return firstBlocker(
      busyReason(state),
      whereNow(state, ctx, person) === null && `${person.name} isn’t around right now.`,
      behindGate(state, ctx, person),
      talkedToday(bondOf(state, person.id), state.time.day) &&
        `You’ve already talked with ${person.name} today. Try tomorrow.`,
    );
  },
  perform(state, action, ctx, rng) {
    const person = requirePerson(state, ctx, action.personId);
    const { def, topicKey } = pickConversation(state, ctx, person, rng);
    return {
      ...state,
      people: {
        ...state.people,
        conversation: { personId: person.id, conversationId: def.id, topicKey, answer: null },
      },
    };
  },
};

/** The village remembers what a reply leaves behind, once. */
function remembering(village: GameState['village'], mark: string | undefined) {
  if (!mark || village.marks.includes(mark)) return village;
  return { ...village, marks: [...village.marks, mark] };
}

export const reply: ActionHandler<ActionOf<'reply'>> = {
  check(state, action, ctx) {
    const talking = state.people.conversation;
    if (!talking) return 'You aren’t talking to anyone.';
    if (talking.answer) return 'You have already answered.';
    const def = ctx.content.conversations.require(talking.conversationId);
    return def.choices[action.choiceIndex] ? null : 'That isn’t one of your options.';
  },
  perform(state, action, ctx) {
    const talking = state.people.conversation;
    const choice = talking
      ? ctx.content.conversations.require(talking.conversationId).choices[action.choiceIndex]
      : undefined;
    if (!talking || !choice) return state;
    const person = requirePerson(state, ctx, talking.personId);
    const before = bondOf(state, person.id);
    const delta = warmed(
      state,
      ctx,
      reactionTo(tastesOf(person, ctx), choice.tone) + festivalBondBonus(state, ctx),
      person,
    );
    const heard = heardId(talkPick(ctx, person, talking));
    const after = recordTalk(before, { day: state.time.day, delta, heard });
    const stage = stageOf(after.points);
    const newStage = stage > stageOf(before.points) ? stage : null;
    const next = {
      ...state,
      people: {
        ...state.people,
        bonds: { ...state.people.bonds, [person.id]: after },
        favours: withFavour(state.people.favours, choice.favour),
        conversation: { ...talking, answer: { choiceIndex: action.choiceIndex, delta, newStage } },
      },
      village: remembering(state.village, choice.worldMark),
    };
    if (newStage === null) return next;
    return log(next, {
      heading: person.name,
      text: `You and ${person.name} have grown closer.`,
      tone: 'success',
      chips: [chip(stageName(newStage), 'gain')],
    });
  },
};

export const endConversation: ActionHandler<ActionOf<'endConversation'>> = {
  check(state) {
    return state.people.conversation?.answer ? null : 'Answer first.';
  },
  perform(state) {
    return { ...state, people: { ...state.people, conversation: null } };
  },
};
