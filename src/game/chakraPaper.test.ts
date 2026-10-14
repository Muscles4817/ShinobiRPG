import { createNewGame } from '@/game';
import { ctx, draft, freshGame, act } from '@/test/gameFixtures';

import { blockerFor } from './dispatch';
import { bornNature, CLAN_NATURE_CHANCE } from './nature';
import { characterModifiers } from './profile';
import { shinobiView } from './views/shinobi';
import { chakraPaperScene } from './views/chakraPaper';
import { activeScene } from './views/peopleScenes';

/** Natures are found with chakra paper, not picked: hidden from creation until the sensei's test. */

function withSensei() {
  const assigned = act(freshGame(), { type: 'assignTeam' });
  const senseiId = assigned.people.team?.senseiOptions[0] ?? '';
  return act(assigned, { type: 'chooseSensei', senseiId });
}

describe('chakra paper', () => {
  it('a new character is born with a nature, and doesn’t know it yet', () => {
    const { character } = freshGame();
    expect(character.natureKnown).toBe(false);
    expect(createNewGame({ draft: draft(), seed: 1234 }, ctx).character.nature).toBe(
      character.nature,
    );
    expect(shinobiView(freshGame(), ctx).nature).toBe('Not yet tested');
    const study = characterModifiers(character, ctx).studyElement;
    expect(new Set(Object.values(study))).toEqual(new Set([1]));
  });

  it('a clan with a nature passes it on most of the time', () => {
    const hibana = ctx.content.clans.require('hibana');
    let fire = 0;
    for (let seed = 1; seed <= 1000; seed++) if (bornNature(seed, hibana) === 'fire') fire++;
    const expected = CLAN_NATURE_CHANCE + (1 - CLAN_NATURE_CHANCE) / 5;
    expect(fire / 1000).toBeCloseTo(expected, 1);
  });

  it('is the scene once your team is formed, and nothing else waits on you until it’s done', () => {
    const state = withSensei();
    expect(activeScene(state)).toBe('chakra-paper');
    expect(chakraPaperScene(state, ctx)?.speech).toMatch(/paper/);
    expect(blockerFor(state, { type: 'rest' }, ctx)).toBe(
      'Your sensei is waiting with the chakra paper.',
    );
  });

  it('shows your nature, and from then on it counts', () => {
    const before = withSensei();
    const after = act(before, { type: 'testChakraPaper' });
    const nature = after.character.nature;
    expect(after.character.natureKnown).toBe(true);
    expect(activeScene(after)).toBeNull();
    expect(after.reports.at(-1)).toMatchObject({ kind: 'nature', nature });
    expect(after.journal.entries.at(-1)?.text).toContain(
      ctx.content.text.chakraPaper.results[nature],
    );
    expect(characterModifiers(after.character, ctx).studyElement[nature]).toBeGreaterThan(1);
    expect(blockerFor(after, { type: 'testChakraPaper' }, ctx)).toBe(
      'You already know your nature.',
    );
  });
});
