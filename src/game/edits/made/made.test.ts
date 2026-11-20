import { combatScene } from '@/game';
import { deserialize, serialize } from '@/game/persistence/save';
import { createVersus } from '@/game/versus/match';
import { contenderOf } from '@/game/versus/roster';
import { playerSetup } from '@/game/versus/sides';
import { draft as creationDraft, fightOut } from '@/test/gameFixtures';

import { contextForPack } from '../../context';
import { createNewGame } from '../../creation';
import { packEdits, readEditBook, withPackEdits, writeEditBook, EMPTY_BOOK } from '../book';
import { editTechniques } from '../edit';
import { NO_EDITS, type ContentEdits } from '../state';
import { fighterEditor } from '../view';
import { BLANK_DRAFT, draftOf, draftProblems, madeTechnique, type TechniqueDraft } from './draft';
import { dropTechnique, keepTechnique, resetFighters } from './edit';
import { madeFrom } from './read';
import { forgeView, madeShelf } from './view';

/** Techniques made in the editor: kept as new content, given to fighters, fought with. */

const naruto = contextForPack('naruto')!;
const KAKASHI = 'person:kakashi';

const COMET: TechniqueDraft = {
  ...BLANK_DRAFT,
  name: 'Lantern Comet',
  description: 'A ball of fire flung high, falling like a lantern cut loose.',
  element: 'fire',
  rank: 'C',
  effects: [
    { verb: 'damage', power: 18, options: { hits: 2 } },
    { verb: 'afflict', power: 4, options: { harm: 'burn' } },
  ],
};

function edited(edits: ContentEdits) {
  return contextForPack('naruto', edits)!;
}

function kept(draft: TechniqueDraft = COMET) {
  const result = keepTechnique(naruto, draft, null);
  if (!result) throw new Error('the draft should be ready');
  return result;
}

describe('a made technique', () => {
  it('becomes a technique of the world, under an id of its own', () => {
    const { edits, id } = kept();
    expect(id).toBe('made-lantern-comet');
    const def = edited(edits).content.techniques.require(id);
    expect(def).toMatchObject({ name: 'Lantern Comet', element: 'fire', rank: 'C', chakraCost: 0 });
    expect(def.effects).toEqual([
      { verb: 'damage', power: 18, hits: 2 },
      { verb: 'afflict', power: 4, harm: 'burn' },
    ]);
  });

  it('comes back to its form as it was made', () => {
    expect(draftOf(madeTechnique(COMET, 'made-x'))).toEqual(COMET);
  });

  it('keeps its id when changed, and takes a fresh one when another has its name', () => {
    const first = kept();
    const ctx = edited(first.edits);
    const renamed = keepTechnique(ctx, { ...COMET, name: 'Falling Lantern' }, first.id)!;
    expect(edited(renamed.edits).content.techniques.require(first.id).name).toBe('Falling Lantern');
    expect(keepTechnique(ctx, COMET, null)?.id).toBe('made-lantern-comet-2');
  });

  it('says what stands in the way of keeping it, and isn’t kept until it is whole', () => {
    const unfinished: TechniqueDraft = {
      ...BLANK_DRAFT,
      lethal: true,
      effects: [
        { verb: 'knock', power: 5, options: {} },
        { verb: 'empower', power: 60, options: {} },
      ],
    };
    expect(draftProblems(unfinished)).toEqual([
      'Give it a name.',
      'Effect 1: choose what it leaves them.',
      'Effect 2: power runs from 1 to 40.',
      'Effect 2: choose at least one stat it raises.',
      'Effect 2: set health it costs each exchange.',
      'Only a technique that wounds can kill in one strike.',
    ]);
    expect(keepTechnique(naruto, unfinished, null)).toBeNull();
  });

  it('is offered to every fighter, marked as made', () => {
    const { edits, id } = kept();
    const offered = fighterEditor(edited(edits), KAKASHI)!.choices.find((t) => t.id === id);
    expect(offered).toMatchObject({ name: 'Lantern Comet', made: true });
  });

  it('is fought with in versus by a fighter given it', () => {
    const { edits, id } = kept();
    const ctx = edited(editTechniques(edited(edits), KAKASHI, [id]));
    const made = createVersus(ctx, { side: [KAKASHI], foes: ['person:guy'], seed: 7, watch: true });
    if (!made.ok) throw new Error(made.error);
    const setup = playerSetup(contenderOf(ctx, KAKASHI)!, made.value, ctx);
    expect(setup.techniques.find((t) => t.id === id)).toMatchObject({ element: 'fire' });
    expect(combatScene(made.value, ctx)?.combatants.length).toBe(2);
    expect(fightOut(made.value, ctx).combat).toBeNull();
  });

  it('is taken from every fighter when dropped, a fighter left with none back to the pack', () => {
    const { edits, id } = kept();
    const given = editTechniques(edited(edits), KAKASHI, [id]);
    const dropped = dropTechnique(given, id);
    expect(dropped).toEqual({ fighters: {}, techniques: {} });
    expect(edited(dropped).content.techniques.get(id)).toBeUndefined();
  });

  it('outlasts resetting every fighter', () => {
    const { edits, id } = kept();
    const reset = resetFighters(editTechniques(edited(edits), KAKASHI, [id]));
    expect(reset.fighters).toEqual({});
    expect(reset.techniques?.[id]?.name).toBe('Lantern Comet');
  });
});

describe('made techniques on the device and in saves', () => {
  it('are kept in the edit book and read back the same', () => {
    const { edits } = kept();
    const book = readEditBook(writeEditBook(withPackEdits(EMPTY_BOOK, 'naruto', edits)));
    expect(packEdits(book, 'naruto')).toEqual(edits);
  });

  it('are read back only as the editor would make them', () => {
    const def = madeTechnique(COMET, 'made-comet');
    expect(madeFrom('made-comet', JSON.parse(JSON.stringify(def)))).toEqual(def);
    expect(madeFrom('comet', def)).toBeNull();
    expect(madeFrom('made-comet', { ...def, rank: 'Z' })).toBeNull();
    expect(madeFrom('made-comet', { ...def, effects: [{ verb: 'summon', power: 1 }] })).toBeNull();
    expect(madeFrom('made-comet', { ...def, effects: [{ verb: 'knock', power: 3 }] })).toBeNull();
    expect(madeFrom('made-comet', { ...def, chakraCost: 1, difficulty: 1 })).toEqual(def);
  });

  it('are copied into a new game and fought with after loading it', () => {
    const { edits, id } = kept();
    const ctx = edited(edits);
    const game = createNewGame({ draft: creationDraft({}, ctx), seed: 3 }, ctx);
    const loaded = deserialize(serialize(game));
    if (!loaded.ok) throw new Error(loaded.error);
    const again = contextForPack(loaded.value.packId, loaded.value.edits)!;
    expect(again.content.techniques.require(id).name).toBe('Lantern Comet');
  });
});

describe('the forge', () => {
  it('reads a draft as a fight would, in the hands of a fighter of its rank', () => {
    const view = forgeView(naruto, COMET);
    expect(view.hands).toBe('In the hands of a C-grade fighter');
    expect(view.sheet.strikes).toMatch(/two/i);
    expect(view.sheet.cost.pool).toBe('chakra');
    expect(view.sheet.cost.amount).toBeGreaterThan(0);
    expect(view.problems).toEqual([]);
  });

  it('reads an unfinished draft without the parts still missing', () => {
    const half = { ...COMET, effects: [{ verb: 'knock' as const, power: 5, options: {} }] };
    const view = forgeView(naruto, half);
    expect(view.sheet.effects).toEqual([]);
    expect(view.problems).toContain('Effect 1: choose what it leaves them.');
  });

  it('warns of a blast no fighter of its rank could cast, without refusing it', () => {
    const blast: TechniqueDraft = {
      ...COMET,
      rank: 'E',
      effects: [{ verb: 'area', power: 40, options: { size: 'vast' } }],
    };
    const view = forgeView(naruto, blast);
    expect(view.problems).toEqual([]);
    expect(view.notes[0]).toMatch(/more chakra than a fighter of its rank holds/);
  });

  it('shelves the techniques made, with who has been given each', () => {
    const { edits, id } = kept();
    const ctx = edited(editTechniques(edited(edits), KAKASHI, [id]));
    expect(madeShelf(ctx)).toEqual([
      expect.objectContaining({ id, name: 'Lantern Comet', givenTo: ['Kakashi Hatake'] }),
    ]);
    expect(madeShelf(naruto)).toEqual([]);
    expect(NO_EDITS.techniques).toBeUndefined();
  });
});
