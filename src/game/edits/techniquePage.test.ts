import { contextForPack } from '../context';
import { editStat, editTechniques } from './edit';
import { editorTechniquePage } from './techniquePage';
import { fighterEditor } from './view';

/** A technique's page in the fighter editor: read in the fighter's own hands, held or not. */

const naruto = contextForPack('naruto')!;
const KAKASHI = 'person:kakashi';

describe('a technique’s page in the fighter editor', () => {
  it('reads one they could be given in their hands, with what it is', () => {
    const choice = fighterEditor(naruto, KAKASHI)!.choices.find((t) => t.ready)!;
    const page = editorTechniquePage(naruto, KAKASHI, choice.id)!;
    expect(page).toMatchObject({ id: choice.id, name: choice.name, held: false, unused: null });
    expect(page.hands).toBe('In Kakashi Hatake’s hands');
    expect(page.description.length).toBeGreaterThan(0);
    expect(page.sheet.reach).toHaveLength(3);
  });

  it('knows one they hold, and says when their grades don’t carry it yet', () => {
    const held = fighterEditor(naruto, KAKASHI)!.techniques[0]!;
    expect(editorTechniquePage(naruto, KAKASHI, held.id)?.held).toBe(true);
    const weak = contextForPack('naruto', editStat(naruto, KAKASHI, 'ninjutsu', 0))!;
    const beyond = fighterEditor(weak, KAKASHI)!.choices.find((t) => !t.ready)!;
    expect(editorTechniquePage(weak, KAKASHI, beyond.id)?.unused).toMatch(/Beyond their grades/);
  });

  it('reads it in the hands as edited', () => {
    const id = fighterEditor(naruto, KAKASHI)!.techniques[0]!.id;
    const ctx = contextForPack('naruto', editTechniques(naruto, KAKASHI, [id]))!;
    expect(editorTechniquePage(ctx, KAKASHI, id)?.held).toBe(true);
    expect(editorTechniquePage(naruto, KAKASHI, 'no-such-technique')).toBeNull();
    expect(editorTechniquePage(naruto, 'person:nobody', id)).toBeNull();
  });
});
