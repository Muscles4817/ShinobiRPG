import type { PersonDef } from '@/content';
import { ctx, newGame } from '@/test/gameFixtures';

import { phrasingFor, phrasingsOf } from './register';
import { conversationValues, fillLine } from './talk';

/** Talk written for anyone agrees with whoever says it: he, she or they. */
describe('templated talk and pronouns', () => {
  const state = newGame();
  const weight = ctx.content.conversations.require('talk-role-3-weight');
  const said = (person: PersonDef) =>
    fillLine(
      phrasingFor(weight.opener, 'warm', person.id),
      conversationValues(state, ctx, person, { def: weight, topicKey: null }),
    );
  const kaen = ctx.content.people.require('kaen');
  const shiori = ctx.content.people.require('shiori');
  const sora: PersonDef = { ...kaen, id: 'sora', name: 'Sora', pronouns: 'they' };

  it('speaks of a he as he, in the template and in the topic’s words', () => {
    expect(said(kaen)).toBe(
      'Kaen looks tired in a way sleep won’t fix. You ask, gently, and for once he answers. Everyone calls him a child with a headband. Nobody sees how often he comes home bruised from jobs that were meant to be easy.',
    );
  });

  it('speaks of a she as she', () => {
    expect(said(shiori)).toContain('for once she answers. Everyone calls her a child');
    expect(said(shiori)).toContain('how often she comes home');
  });

  it('speaks of a they as they, with verbs that agree', () => {
    expect(said(sora)).toContain('Sora looks tired');
    expect(said(sora)).toContain('for once they answer. Everyone calls them a child');
    expect(said(sora)).toContain('how often they come home');
  });

  it('leaves no slot unfilled in any template, for anyone', () => {
    const templated = ctx.content.conversations.all.filter((c) => c.about !== undefined);
    for (const person of [kaen, shiori, sora]) {
      for (const def of templated) {
        const values = conversationValues(state, ctx, person, { def, topicKey: null });
        const lines = [
          def.opener,
          ...def.choices.flatMap((c) => [c.label, c.reply, c.warm ?? '', c.cool ?? '']),
        ].flatMap(phrasingsOf);
        for (const line of lines) expect(fillLine(line, values)).not.toMatch(/\{them/);
      }
    }
  });
});
