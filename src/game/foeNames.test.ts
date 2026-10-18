import type { EnemyDef } from '@/content';
import { ctx, newGame } from '@/test/gameFixtures';

import { enemyParty, playerCombatant } from './combatants';
import { foeCalled, foeGrammar, foeList } from './foeNames';

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

  it('calls creatures and spirits it, and people he or she the same way every time', () => {
    expect(foeGrammar(foe('storehouse-wraith'), 'storehouse-wraith#0')).toBe('it');
    const human = foeGrammar(foe('bandit-thug'), 'bandit-thug#0');
    expect(['he', 'she']).toContain(human);
    expect(foeGrammar(foe('bandit-thug'), 'bandit-thug#0')).toBe(human);
  });

  it('tells the player as you, and foes as the story calls them', () => {
    expect(playerCombatant(newGame(), ctx)).toMatchObject({ called: 'you', grammar: 'you' });
    const [wraith] = enemyParty(foe('storehouse-wraith'), 0, ctx);
    expect(wraith).toMatchObject({ called: 'the storehouse wraith', grammar: 'it' });
  });
});
