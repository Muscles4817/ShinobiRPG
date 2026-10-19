import { contextForPack } from '@/game';
import { ctx, draft } from '@/test/gameFixtures';

import { createNewGame, draftProblems } from './creation';
import {
  chooseQuickPick,
  lowerStat,
  markGift,
  raiseStat,
  reviseDraft,
  setBloom,
} from './creationDraft';
import { fileView } from './views/academyFile';

const naruto = contextForPack('naruto')!;

describe('editing the academy file', () => {
  it('raises a clan child in the clan, and moves them out of it when the clan goes', () => {
    const heir = draft({ clanId: 'hibana' });
    expect(heir.upbringingId).toBe('clan-branch');
    const after = reviseDraft(heir, { clanId: 'none' }, ctx);
    expect(after.upbringingId).toBe('civilian');
  });

  it('refills a quick-picked file when what it was filled from changes', () => {
    const middle = draft();
    const genius = reviseDraft(middle, { standing: 'genius' }, ctx);
    expect(fileView(genius, ctx).balance.points).toBe(0);
    expect(genius.file.development.taijutsu).toBe(4);
    const heir = reviseDraft(middle, { clanId: 'kurogane', upbringingId: 'clan-main' }, ctx);
    expect(draftProblems(heir, ctx)).toEqual([]);
    expect(heir.file.development.kenjutsu).toBeGreaterThan(0);
  });

  it('keeps a file written by hand as it is', () => {
    const edited = lowerStat(draft(), 'speed', ctx);
    expect(edited.quickPick).toBeNull();
    expect(edited.file.development.speed).toBe(2);
    const moved = reviseDraft(edited, { standing: 'genius' }, ctx);
    expect(moved.file).toEqual(edited.file);
  });

  it('raises a stat only when the file can pay for it and the standing allows it', () => {
    const full = draft();
    expect(raiseStat(full, 'intellect', ctx)).toBe(full);
    const room = lowerStat(lowerStat(full, 'speed', ctx), 'stamina', ctx);
    const raised = raiseStat(room, 'intellect', ctx);
    expect(raised.file.development.intellect).toBe(1);
    // The middle of the class takes nothing past three steps (a solid D).
    expect(raiseStat(room, 'taijutsu', ctx)).toBe(room);
  });

  it('marks gifts and flaws, and a flaw pays back in training', () => {
    const flawed = markGift(draft(), 'intellect', 'flawed', ctx);
    expect(fileView(flawed, ctx).balance.points).toBe(2);
    const twoGifts = markGift(draft(), 'speed', 'gifted', ctx);
    expect(draftProblems(twoGifts, ctx)).toEqual(['Those gifts take 2; your file has room for 1.']);
    expect(draftProblems(setBloom(twoGifts, 'late', ctx), ctx)).toEqual([
      'That training costs 10 points; you have 7.',
    ]);
    expect(markGift(twoGifts, 'speed', null, ctx).file.gifts.speed).toBeUndefined();
  });

  it('says on each quick pick what it would give this student', () => {
    const genius = draft({ standing: 'genius' });
    const prodigy = fileView(genius, ctx).archetypes.find((a) => a.id === 'prodigy')!;
    const labels = prodigy.effects.map((e) => e.label);
    expect(labels).toContain('Taijutsu C');
    expect(labels).toContain('A prodigy in taijutsu');
    const athlete = fileView(genius, ctx).archetypes.find((a) => a.id === 'athlete')!;
    expect(athlete.effects).toContainEqual({ label: 'Weak in intellect', tone: 'cost' });
    const heir = fileView(genius, ctx).archetypes.find((a) => a.id === 'clan-heir')!;
    expect(heir.effects).toEqual([]);
  });

  it('never gifts or flaws a stat the special note already fixes', () => {
    const quickPick = { archetype: 'steady', specialty: 'ninjutsu' } as const;
    const sealed = draft({ talentIds: ['no-chakra'], quickPick });
    expect(sealed.file.gifts.ninjutsu).toBeUndefined();
    expect(draftProblems(sealed, ctx)).toEqual([]);
    const forced = markGift(sealed, 'ninjutsu', 'gifted', ctx);
    expect(draftProblems(forced, ctx)).toContain(
      'Your special note already says how far that stat goes; it can’t be a gift or a flaw too.',
    );
  });

  it('gives a deep well of chakra a reserves limit to match', () => {
    const well = createNewGame({ draft: draft({ talentIds: ['chakra-reserves'] }), seed: 3 }, ctx);
    expect(well.character.aptitude.reserves).toBe(1.5);
  });

  it('offers each kind of student only where it fits', () => {
    const offered = (d: ReturnType<typeof draft>) =>
      fileView(d, ctx)
        .archetypes.filter((a) => a.offered)
        .map((a) => a.id);
    expect(offered(draft())).not.toContain('clan-heir');
    expect(offered(draft())).not.toContain('prodigy');
    expect(offered(draft({ clanId: 'hibana', standing: 'genius' }))).toEqual(
      expect.arrayContaining(['clan-heir', 'prodigy']),
    );
  });
});

describe('the file as it graduates', () => {
  it('a genius prodigy can give a chūnin a real fight, and the file says so', () => {
    const prodigy = chooseQuickPick(
      draft({ standing: 'genius', clanId: 'uchiha', upbringingId: 'clan-main' }, naruto),
      { archetype: 'prodigy', specialty: 'ninjutsu' },
      naruto,
    );
    expect(draftProblems(prodigy, naruto)).toEqual([]);
    const view = fileView(prodigy, naruto);
    expect(view.fighting.grade).toBe('C');
    expect(view.fighting.power).toBeGreaterThanOrEqual(10.5);
    const cs = view.groups.flatMap((g) => g.stats).filter((s) => s.grade === 'C');
    expect(cs.length).toBeGreaterThanOrEqual(3);
    const { character } = createNewGame({ draft: prodigy, seed: 5 }, naruto);
    expect(character.aptitude.ninjutsu).toBeGreaterThanOrEqual(1.6);
    expect(character.grades.ninjutsu).toBe('A');
  });

  it('reads the report card, and which arts bring their starter', () => {
    const card = fileView(draft(), ctx).reportCard;
    expect(card.find((r) => r.discipline === 'taijutsu')).toEqual({
      discipline: 'taijutsu',
      grade: 'B',
      starts: true,
    });
    expect(card.find((r) => r.discipline === 'ninjutsu')?.starts).toBe(false);
  });

  it('says what an upbringing asks of the training', () => {
    expect(fileView(draft(), ctx).focusNote).toBeNull();
    expect(fileView(draft({ clanId: 'kurogane' }), ctx).focusNote).toBe(
      'Branch family: at least 2 points of your training went into Kenjutsu or Strength.',
    );
  });
});
