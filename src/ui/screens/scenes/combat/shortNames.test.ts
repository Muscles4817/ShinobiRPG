import { shortName } from './shortNames';

const field = (...names: string[]) => names.map((name) => ({ name }));

describe('short names on the stage', () => {
  it('reads a name by its last word, or a tally by the word before it', () => {
    expect(shortName('Bandit Archer')).toEqual({ label: 'Archer', mark: 'A' });
    expect(shortName('Hungry Ghost 2')).toEqual({ label: 'Ghost 2', mark: 'G2' });
    expect(shortName('Kaen')).toEqual({ label: 'Kaen', mark: 'K' });
  });

  it('tells apart two fighters whose names end alike', () => {
    const all = field('Hiruzen', 'Reanimated First Hokage', 'Reanimated Second Hokage');
    expect(shortName('Reanimated First Hokage', all)).toEqual({
      label: 'First Hokage',
      mark: 'FH',
    });
    expect(shortName('Reanimated Second Hokage', all).mark).toBe('SH');
    expect(shortName('Hiruzen', all).mark).toBe('H');
  });

  it('gives a seal another letter when two names start alike', () => {
    const all = field('Kaen', 'Kiba');
    expect(shortName('Kaen', all).mark).toBe('Ka');
    expect(shortName('Kiba', all).mark).toBe('Ki');
  });

  it('numbers fighters who share a whole name', () => {
    const all = [
      { id: 'a', name: 'Hiruzen' },
      { id: 'b', name: 'Hiruzen’s shadow clone' },
      { id: 'c', name: 'Hiruzen’s shadow clone' },
    ];
    expect(shortName('Hiruzen’s shadow clone', all, 'b')).toEqual({ label: 'clone 1', mark: 'C1' });
    expect(shortName('Hiruzen’s shadow clone', all, 'c').mark).toBe('C2');
    expect(shortName('Hiruzen', all, 'a').mark).toBe('H');
  });

  it('keeps every seal in a crowded fight apart', () => {
    const all = field('Bandit Archer', 'Ronin Archer', 'Aoi', 'Hungry Ghost 1', 'Hungry Ghost 2');
    const marks = all.map((f) => shortName(f.name, all).mark);
    expect(new Set(marks).size).toBe(marks.length);
  });
});
