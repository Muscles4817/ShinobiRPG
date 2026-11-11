import { sealFor } from './seal';

describe('the character on a name tag', () => {
  it.each([
    ['Emi', 'え'],
    ['Gōran', 'ご'],
    ['Kazu', 'か'],
    ['Shun', 'し'],
    ['Shizuka', 'し'],
    ['Chiyo', 'ち'],
    ['Tsubaki', 'つ'],
    ['Ryū', 'り'],
    ['Kyōko', 'き'],
    ['Fumi', 'ふ'],
    ['Jin', 'じ'],
    ['Yuki', 'ゆ'],
    ['Wataru', 'わ'],
    ['Ōta', 'お'],
    ['  ren ', 'れ'],
  ])('reads the first sound of %s as %s', (name, kana) => {
    expect(sealFor(name)).toBe(kana);
  });

  it('keeps the first letter of a name that begins with no Japanese sound', () => {
    expect(sealFor('Xan')).toBe('X');
    expect(sealFor('quill')).toBe('Q');
    expect(sealFor('Vex')).toBe('V');
  });

  it('gives nothing for an empty name', () => {
    expect(sealFor('')).toBe('');
  });
});
