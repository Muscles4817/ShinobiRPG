import { createRng } from '@/core';
import { STANDING_INFO, withGifts } from '@/systems/profile';
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

  it('refuses a file that spends more training than the standing gives', () => {
    const file = {
      development: { taijutsu: 3, speed: 3, stamina: 3 },
      gifts: {},
      bloom: 'on-time' as const,
    };
    expect(draftProblems(draft({ file }), ctx)).toEqual([
      'That training costs 12 points; you have 10.',
    ]);
  });

  it('raises a clan child in the clan, and holds the training to its arts', () => {
    const heir = draft({ clanId: 'kurogane' });
    expect(heir.upbringingId).toBe('clan-branch');
    expect(draftProblems(heir, ctx)).toEqual([]);
    const file = { development: { speed: 3 }, gifts: {}, bloom: 'on-time' as const };
    expect(draftProblems(draft({ clanId: 'kurogane', file }), ctx)).toEqual([
      'Your upbringing put at least 2 points of training into its arts.',
    ]);
    // Revising a draft keeps them in step; a draft written another way is still checked.
    expect(draftProblems({ ...draft(), upbringingId: 'clan-main' }, ctx)).toContain(
      'Only clan children are raised by a clan.',
    );
  });

  it('starts with academy techniques plus a starter for each A grade', () => {
    expect(freshGame().techniques.known).toEqual(['palm-strike', 'shadow-feint', 'gale-heel']);
  });

  it('the file, the frame and the special note shape starting stats', () => {
    // A steady taijutsu student: three steps in taijutsu and speed, two in stamina; a sensor.
    const s = newGame().character.stats;
    expect([s.taijutsu, s.speed, s.stamina, s.perception, s.strength]).toEqual([11, 11, 9, 8, 4]);
    expect(newGame().character.grades.taijutsu).toBe('B');
    const heavy = createNewGame({ draft: draft({ buildId: 'heavy' }), seed: 1 }, ctx);
    expect(heavy.character.stats.strength).toBe(6);
  });

  it('a gift on the file is known from the first day', () => {
    const { character } = newGame();
    expect(character.aptitude.taijutsu).toBeGreaterThanOrEqual(1.3);
    expect(character.aptitudeKnown.taijutsu).toBe('sense');
    expect(character.aptitudeKnown.ninjutsu).toBe('unknown');
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
    const notes = state.character.talentIds.map((id) => ctx.content.talents.require(id));
    const shape = { band: STANDING_INFO.middle.talent, specialties: ['taijutsu' as const] };
    const rolled = rollCharacterAptitude(dice, clan, notes, shape);
    expect(state.character.aptitude).toEqual(withGifts(rolled, { taijutsu: 'gifted' }));
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
    const born = leafGame({ clanId: 'uchiha' });
    const uchiha = { ...born, character: { ...born.character, nature: 'fire' as const } };
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
    // Sasuke teaches his own lightning and snakes to anyone, but nothing of the clan's.
    const offered = next(strong(plain));
    expect(offered && naruto.content.techniques.require(offered).clan).toBeFalsy();
    const fireball = naruto.content.techniques.require('great-fireball');
    const blocker = learnBlockerFor(strong(plain), fireball, naruto);
    expect(blocker && learnBlockerText(blocker, fireball)).toBe('Only taught within its clan.');
  });
});
