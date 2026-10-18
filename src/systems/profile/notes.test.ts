import { notesLeft, notesProblem } from './notes';

describe('room for special notes', () => {
  const room = { major: 1, minor: 1 };

  it('fills major and minor slots, and an empty major slot takes a minor note', () => {
    expect(notesLeft([], room)).toEqual({ major: 1, minor: 2 });
    expect(notesLeft(['major', 'minor'], room)).toEqual({ major: 0, minor: 0 });
    expect(notesProblem(['minor', 'minor'], room)).toBeNull();
  });

  it('makes room for one more minor note for every flaw', () => {
    expect(notesProblem(['major', 'minor', 'minor'], room)).toMatch(/a flaw would make some/);
    expect(notesProblem(['major', 'minor', 'minor', 'flaw'], room)).toBeNull();
  });

  it('never lets a flaw buy a major note', () => {
    expect(notesProblem(['major', 'major', 'flaw', 'flaw'], room)).toMatch(/major notes/);
  });
});
