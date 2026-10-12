import { createRng } from '@/core';
import { gradesFromQuickPick } from '@/systems/profile';
import { act, ctx, draft, formTeam, freshGame, newGame } from '@/test/gameFixtures';

import { rollCharacterAptitude } from './aptitude';
import { contextForPack } from './context';
import { createNewGame, draftProblems, rollBreakIn, type CreationDraft } from './creation';
import { learnBlockerFor, learnBlockerText } from './learning';
import { nextSignature } from './people/signatures';
import { teachingOf } from './people/teachers';
import { characterModifiers } from './profile';
import { creationView } from './views/creation';
import { homeView } from './views/home';
import { hubView } from './views/hub';

const naruto = contextForPack('naruto')!;

/** A ready-to-play Hidden Leaf game. */
const leafGame = (overrides: Partial<CreationDraft> = {}) =>
  formTeam(createNewGame({ draft: draft(overrides, naruto), seed: 1 }, naruto), naruto);

describe('character creation', () => {
  it('a default draft with a name is valid', () => {
    expect(draftProblems(draft(), ctx)).toEqual([]);
  });

  it('reports what is missing or contradictory', () => {
    const problems = draftProblems(
      draft({ name: ' ', traitIds: ['brash', 'calm'], clanId: 'nope' }),
      ctx,
    );
    expect(problems).toEqual([
      'Write your name.',
      'Choose your family.',
      'Those two traits contradict each other.',
    ]);
  });

  it('refuses point buys over budget', () => {
    const grades = {
      ...gradesFromQuickPick({ specialty: 'taijutsu', strength: 'ninjutsu', weakness: 'genjutsu' }),
      kenjutsu: 'A',
    } as const;
    expect(draftProblems(draft({ grades }), ctx)).toEqual(['That costs 6 points; you have 3.']);
  });

  it('starts with academy techniques plus a starter for each A grade', () => {
    expect(freshGame().techniques.known).toEqual(['palm-strike', 'shadow-feint', 'gale-heel']);
  });

  it('grades shape starting stats', () => {
    const s = newGame().character.stats;
    expect(s.taijutsu).toBe(8);
    expect(s.ninjutsu).toBe(6.5);
    expect(s.genjutsu).toBe(4);
  });

  it('clans give their name, stats, techniques and a rent-free home', () => {
    const state = leafGame({ clanId: 'uchiha' });
    expect(state.character.familyName).toBe('Uchiha');
    expect(state.techniques.known).toContain('phoenix-flower');
    expect(state.housing).toMatchObject({
      rentPerWeek: 0,
      lodging: 'Your room in the Uchiha compound',
    });
    expect(state.character.stats.willpower).toBe(3);
  });

  it('family homes show as rent-free and refuse rent', () => {
    const state = leafGame({ clanId: 'hyuga' });
    const home = homeView(state, naruto)!;
    expect(home).toMatchObject({ name: 'Home', rentFree: true, rentStatus: 'Rent-free' });
    expect(hubView(state, naruto).places.find((p) => p.kind === 'home')?.line).toBe(
      'Your room in the Hyūga compound',
    );
    expect(home.payRent.blocker).toBe('You live here rent-free.');
  });

  it('the break-in roll is the same in the scene and in the game', () => {
    const roll = rollBreakIn(ctx, 'roof', 99);
    const state = createNewGame({ draft: draft({ breakInApproachId: 'roof' }), seed: 99 }, ctx);
    expect(state.character.breakIn.succeeded).toBe(roll.succeeded);
    // The same dice go on to roll aptitude, and the game carries on from there.
    const dice = createRng(roll.rngState);
    const clan = ctx.content.clans.require(state.character.clanId);
    const talent = ctx.content.talents.require(state.character.talentId ?? '');
    expect(state.character.aptitude).toEqual(rollCharacterAptitude(dice, clan, talent));
    expect(state.rngState).toBe(dice.state());
  });

  it('records the break-in and graduation', () => {
    const headings = freshGame().journal.entries.map((e) => e.heading);
    expect(headings).toContain('The night before graduation');
    expect(headings.at(-1)).toBe('Graduation');
  });

  it('describes every option with its effects', () => {
    const view = creationView(naruto);
    const akimichi = view.clans.find((c) => c.id === 'akimichi')!;
    expect(akimichi.effects.map((e) => e.label)).toContain('Get hungry 60% faster');
    expect(view.clans.find((c) => c.id === 'uchiha')?.kekkeiGenkai?.name).toBe('Sharingan');
    expect(view.disciplines).toHaveLength(5);
  });
});

describe('identity shapes play', () => {
  it('a clan with a big appetite gets hungry faster', () => {
    const plain = leafGame();
    const akimichi = leafGame({ clanId: 'akimichi' });
    const after = (s: typeof plain) => act(s, { type: 'rest' }, naruto);
    const tired = (s: typeof plain) => ({
      ...s,
      character: { ...s.character, vitals: { ...s.character.vitals, energy: 10 } },
    });
    expect(after(tired(akimichi)).character.vitals.satiety).toBeLessThan(
      after(tired(plain)).character.vitals.satiety,
    );
  });

  it('nature and clan speed up matching study', () => {
    const uchiha = leafGame({ clanId: 'uchiha', nature: 'fire' });
    const mods = characterModifiers(uchiha.character, naruto);
    expect(mods.studyElement.fire).toBeCloseTo(1.3 * 1.5 * 1.2);
    expect(mods.studyElement.water).toBeCloseTo(0.85);
  });

  it('clan techniques are only taught to the clan, by its own people', () => {
    const uchiha = leafGame({ clanId: 'uchiha' });
    const plain = leafGame();
    const strong = (s: typeof plain) => ({
      ...s,
      character: { ...s.character, stats: { ...s.character.stats, ninjutsu: 20 } },
    });
    const sasuke = naruto.content.people.require('sasuke');
    const next = (s: typeof plain) => nextSignature(s, teachingOf(s, sasuke)!, naruto);
    expect(next(strong(uchiha))).toBe('great-fireball');
    expect(next(strong(plain))).toBeNull();
    const fireball = naruto.content.techniques.require('great-fireball');
    const blocker = learnBlockerFor(strong(plain), fireball, naruto);
    expect(blocker && learnBlockerText(blocker, fireball)).toBe('Only taught within its clan.');
  });
});
