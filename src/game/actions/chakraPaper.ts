import { describeSpec } from '@/systems/modifiers';

import { NATURE_LINES } from '../nature';
import { chip, log } from '../ops';
import { requirePerson } from '../people/cast';
import { natureModifiers } from '../profile';
import { addReport } from '../reports';
import type { ActionHandler, ActionOf } from './types';

/**
 * The chakra paper test: once your team is formed, your sensei hands you the paper and your
 * nature shows itself. From then on it is yours to train: the study bonus applies, techniques
 * that need it open, and people can see it.
 */

function capitalised(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export const testChakraPaper: ActionHandler<ActionOf<'testChakraPaper'>> = {
  check(state) {
    if (!state.people.team?.senseiId) return 'Your sensei has not been assigned yet.';
    return state.character.natureKnown ? 'You already know your nature.' : null;
  },
  perform(state, _action, ctx) {
    const { character } = state;
    const text = ctx.content.text.chakraPaper;
    const sensei = requirePerson(state, ctx, state.people.team?.senseiId ?? '');
    const clan = ctx.content.clans.get(character.clanId);
    const name = `${capitalised(character.nature)} nature`;
    const effects = describeSpec(natureModifiers(character.nature, clan?.nature))
      .filter((e) => e.tone === 'gain')
      .map((e) => e.label);
    const verdict = text.verdict.replaceAll('{sensei}', sensei.name);
    const result = `${text.results[character.nature]} ${verdict}`;
    const revealed = { ...state, character: { ...character, natureKnown: true } };
    const logged = log(revealed, {
      heading: text.heading,
      text: result,
      tone: 'success',
      chips: [chip(name, 'gain')],
    });
    return addReport(logged, {
      kind: 'nature',
      nature: character.nature,
      name,
      text: result,
      line: NATURE_LINES[character.nature],
      effects,
    });
  },
};
