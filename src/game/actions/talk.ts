import { reactionTo, recordTalk, stageName, stageOf, talkedToday } from '@/systems/bonds';

import { busyReason, chip, firstBlocker, log } from '../ops';
import { bondOf, findPerson, requirePerson, tastesOf, whereNow } from '../people/cast';
import { pickConversation } from '../people/talk';
import type { ActionHandler, ActionOf } from './types';

export const talk: ActionHandler<ActionOf<'talk'>> = {
  check(state, action, ctx) {
    const person = findPerson(state, ctx, action.personId);
    if (!person) return 'You don’t know anyone by that name.';
    return firstBlocker(
      busyReason(state),
      whereNow(state, ctx, person) === null && `${person.name} isn’t around right now.`,
      talkedToday(bondOf(state, person.id), state.time.day) &&
        `You’ve already talked with ${person.name} today. Try tomorrow.`,
    );
  },
  perform(state, action, ctx, rng) {
    const person = requirePerson(state, ctx, action.personId);
    const conversation = pickConversation(state, ctx, person, rng);
    return {
      ...state,
      people: {
        ...state.people,
        conversation: { personId: person.id, conversationId: conversation.id, answer: null },
      },
    };
  },
};

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
    const delta = reactionTo(tastesOf(person, ctx), choice.tone);
    const after = recordTalk(before, { day: state.time.day, delta, heard: talking.conversationId });
    const stage = stageOf(after.points);
    const newStage = stage > stageOf(before.points) ? stage : null;
    const next = {
      ...state,
      people: {
        ...state.people,
        bonds: { ...state.people.bonds, [person.id]: after },
        conversation: { ...talking, answer: { choiceIndex: action.choiceIndex, delta, newStage } },
      },
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
