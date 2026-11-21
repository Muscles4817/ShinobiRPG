import { CONTENT_PACKS, type EnemyDef } from '@/content';
import { ctx, newGame } from '@/test/gameFixtures';

import { enemyParty, playerCombatant } from './combatants';
import { debriefStory } from './debriefStory';
import { contextForPack } from './context';
import { beatenLine, foeCalled, foeGrammar, foeList, isCreature } from './foeNames';

const foe = (id: string): EnemyDef => ctx.content.enemies.require(id);

describe('naming foes for the story', () => {
  it('calls a common foe by its kind, and a named one by name', () => {
    expect(foeCalled(foe('storehouse-wraith'))).toBe('the storehouse wraith');
    const named = { ...foe('bandit-thug'), name: 'Ren', proper: true };
    expect(foeCalled(named)).toBe('Ren');
  });

  it('counts several of a kind and lists the rest with articles', () => {
    const thug = foe('bandit-thug');
    expect(foeList([thug])).toBe('the bandit thug');
    expect(foeList([thug, thug])).toBe('two bandit thugs');
    expect(foeList([thug, thug, foe('bandit-archer')])).toBe(
      'two bandit thugs and a bandit archer',
    );
  });

  it('notes a won fight as a short fact that reads in the debrief', () => {
    const thug = foe('bandit-thug');
    const tell = (defs: EnemyDef[], next: string) =>
      debriefStory([
        { text: beatenLine(defs), tone: 'plain', stageIndex: 0 },
        { text: next, tone: 'plain', stageIndex: 1 },
      ])
        .map((f) => f.text)
        .join('');
    expect(tell([thug, thug], 'Found the cart.')).toBe(
      'You beat two bandit thugs and found the cart.',
    );
    expect(tell([foe('storehouse-wraith')], 'Found the cart.')).toBe(
      'You beat the storehouse wraith and found the cart.',
    );
    expect(tell([thug, foe('bandit-archer')], 'Found the cart.')).toBe(
      'You fought a bandit thug and a bandit archer, and won. Then you found the cart.',
    );
    expect(beatenLine([thug])).not.toMatch(/in a fight/);
  });

  it('calls creatures and spirits it, and people he or she the same way every time', () => {
    expect(foeGrammar(foe('storehouse-wraith'), 'storehouse-wraith#0')).toBe('it');
    const human = foeGrammar(foe('bandit-thug'), 'bandit-thug#0');
    expect(['he', 'she']).toContain(human);
    expect(foeGrammar(foe('bandit-thug'), 'bandit-thug#0')).toBe(human);
  });

  it('reads what a foe is from what it declares, never from the words on its banner', () => {
    const naruto = contextForPack('naruto');
    if (!naruto) return;
    // The banner says "Tainted beast", not "Beast": the declared form decides.
    const jackal = naruto.content.enemies.require('tainted-jackal');
    expect(foeGrammar(jackal, 'tainted-jackal#0')).toBe('it');
    expect(foeGrammar({ ...jackal, kind: 'Beast', form: 'person' }, 'x#0')).not.toBe('it');
  });

  it('gives every foe its banner calls a beast or a spirit a creature’s form or “it”', () => {
    const creatureWords = /\b(beast|spirit|animal|wraith)\b/i;
    const unmarked = CONTENT_PACKS.flatMap((pack) =>
      pack.enemies
        .filter((e) => creatureWords.test(e.kind) && !isCreature(e) && e.pronouns !== 'it')
        .map((e) => `${pack.id}: ${e.id} (${e.kind})`),
    );
    expect(unmarked).toEqual([]);
  });

  it('tells the player as you, and foes as the story calls them', () => {
    expect(playerCombatant(newGame(), ctx)).toMatchObject({ called: 'you', grammar: 'you' });
    const [wraith] = enemyParty(foe('storehouse-wraith'), 0, ctx);
    expect(wraith).toMatchObject({ called: 'the storehouse wraith', grammar: 'it' });
  });
});
