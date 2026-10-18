import { REGISTERS, type PersonDef, type Register } from '@/content';
import { ctx, newGame } from '@/test/gameFixtures';

import { findPerson } from './cast';
import { DEFAULT_REGISTER, phrasingFor, phrasingsOf, registerOf } from './register';

/** Two people never say the same sentence: a templated line reads in the speaker’s register. */
describe('registers', () => {
  const state = newGame();
  const mate = findPerson(state, ctx, state.people.team!.teammateIds[0]!)!;

  it('reads a person’s register from their first trait', () => {
    const first = ctx.content.traits.require(mate.traitIds[0]!);
    expect(registerOf(ctx, mate)).toBe(first.register);
    const traitless: PersonDef = { ...mate, traitIds: [] };
    expect(registerOf(ctx, traitless)).toBe(DEFAULT_REGISTER);
  });

  it('phrases a line in the speaker’s register, else its pair’s, else by hash', () => {
    const line = { blunt: 'Move.', warm: 'Would you mind moving?' };
    expect(phrasingFor(line, 'blunt', 'a')).toBe('Move.');
    expect(phrasingFor(line, 'wry', 'a')).toBe('Move.');
    expect(phrasingFor(line, 'formal', 'a')).toBe('Would you mind moving?');
    expect(phrasingFor('Same for all.', 'wry', 'a')).toBe('Same for all.');
    const lone = { formal: 'Kindly move.', warm: 'Please move.' };
    expect(phrasingFor(lone, 'blunt', 'key')).toBe(phrasingFor(lone, 'blunt', 'key'));
    expect(phrasingsOf(lone)).toContain(phrasingFor(lone, 'blunt', 'key'));
  });

  it('gives every template a different opener in every register', () => {
    const templates = ctx.content.conversations.all.filter((c) => c.about);
    for (const def of templates) {
      const said = REGISTERS.map((r: Register) => phrasingFor(def.opener, r, def.id));
      expect(new Set(said).size, def.id).toBe(REGISTERS.length);
    }
  });

  it('gives a template’s plain answers different words in each pair of registers', () => {
    const templates = ctx.content.conversations.all.filter((c) => c.about);
    for (const choice of templates.flatMap((c) => c.choices)) {
      expect(phrasingFor(choice.reply, 'blunt', '')).not.toBe(
        phrasingFor(choice.reply, 'warm', ''),
      );
    }
  });
});
