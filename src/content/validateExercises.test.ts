import { ORIGINAL_PACK } from './packs/original';
import { validateContent } from './validate';

describe('exercise validation', () => {
  it('passes the shipped pack', () => {
    expect(validateContent(ORIGINAL_PACK)).toEqual([]);
  });

  it('reports an exercise nowhere to practise, a lesson with no words, and a surface twice', () => {
    const [trees, water] = ORIGINAL_PACK.exercises;
    const { start: _start, ...lines } = trees!.lines;
    const pack = {
      ...ORIGINAL_PACK,
      exercises: [{ ...trees!, lines }, water!, { ...water!, id: 'sea-walking' }],
    };
    expect(validateContent(pack)).toEqual(
      expect.arrayContaining([
        'exercise "sea-walking" is not practised at any place',
        'exercise "tree-walking" is started by the sensei but has no lesson line',
        'more than one exercise walks on water',
      ]),
    );
  });
});
