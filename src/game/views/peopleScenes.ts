import { stageName } from '@/systems/bonds';

import type { GameAction } from '../actions/types';
import type { GameContext } from '../context';
import { findPerson, requirePerson } from '../people/cast';
import { fitReasons } from '../people/senseis';
import { fillNames } from '../people/talk';
import type { GameState } from '../state';
import { capitalise } from './common';
import { personCard, toneLabel, type PersonCard } from './people';

/** The full-screen scenes for people: a conversation, and team assignment. */

export type SceneKind = 'combat' | 'mission' | 'conversation' | 'team';

/** Which scene takes over the screen, if any. Fights win over missions win over talk. */
export function activeScene(state: GameState): SceneKind | null {
  if (state.combat) return 'combat';
  if (state.mission) return 'mission';
  if (state.people.conversation) return 'conversation';
  if (!state.people.team?.senseiId) return 'team';
  return null;
}

export interface ConversationScene {
  readonly person: PersonCard;
  readonly opener: string;
  readonly choices: readonly {
    readonly label: string;
    readonly tone: string;
    readonly action: GameAction;
  }[];
  /** Your reply and how it landed, once you've answered. */
  readonly answer: {
    readonly said: string;
    readonly reply: string;
    readonly delta: number;
    readonly newStage: string | null;
  } | null;
  readonly leave: GameAction;
}

export function conversationScene(state: GameState, ctx: GameContext): ConversationScene | null {
  const talking = state.people.conversation;
  const person = talking && findPerson(state, ctx, talking.personId);
  if (!talking || !person) return null;
  const def = ctx.content.conversations.require(talking.conversationId);
  const fill = (text: string) => fillNames(text, { you: state.character.name, them: person.name });
  const picked = talking.answer && def.choices[talking.answer.choiceIndex];
  return {
    person: personCard(state, ctx, person),
    opener: fill(def.opener),
    choices: def.choices.map((c, choiceIndex) => ({
      label: fill(c.label),
      tone: toneLabel(c.tone),
      action: { type: 'reply', choiceIndex },
    })),
    answer:
      talking.answer && picked
        ? {
            said: fill(picked.label),
            reply: fill(picked.reply),
            delta: talking.answer.delta,
            newStage: talking.answer.newStage === null ? null : stageName(talking.answer.newStage),
          }
        : null,
    leave: { type: 'endConversation' },
  };
}

export interface SenseiOffer extends PersonCard {
  readonly style: string;
  readonly nature: string | null;
  /** Why they asked for you. */
  readonly reasons: readonly string[];
  readonly choose: GameAction;
}

export interface TeamScene {
  /** Teams not yet read out: show the intro and a button to hear them. */
  readonly intro: string;
  readonly assign: GameAction | null;
  readonly choose: string;
  readonly teammates: readonly PersonCard[];
  readonly senseis: readonly SenseiOffer[];
}

export function teamScene(state: GameState, ctx: GameContext): TeamScene | null {
  const team = state.people.team;
  if (team?.senseiId) return null;
  const { intro, choose } = ctx.content.team;
  if (!team) return { intro, choose, assign: { type: 'assignTeam' }, teammates: [], senseis: [] };
  const card = (id: string) => personCard(state, ctx, requirePerson(state, ctx, id));
  return {
    intro,
    choose,
    assign: null,
    teammates: team.teammateIds.map(card),
    senseis: team.senseiOptions.map((id) => {
      const sensei = requirePerson(state, ctx, id);
      const profile = sensei.sensei;
      return {
        ...card(id),
        style: profile?.style ?? '',
        nature: profile?.nature ? capitalise(profile.nature) : null,
        reasons: fitReasons(state.character, sensei, ctx),
        choose: { type: 'chooseSensei', senseiId: id },
      };
    }),
  };
}
