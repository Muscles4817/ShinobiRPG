import { describe, expect, it } from 'vitest';

import { DEFAULT_APPEARANCE, lookOf } from './appearance';
import { FACE_SHAPES, faceFromKey } from './face';

const KEYS = Array.from({ length: 200 }, (_, i) => `person-${i}`);

describe('faceFromKey', () => {
  it('gives the same key the same face every time', () => {
    expect(faceFromKey('ren', 'young')).toEqual(faceFromKey('ren', 'young'));
  });

  it('gives a crowd many different faces', () => {
    const faces = new Set(KEYS.map((k) => JSON.stringify(faceFromKey(k, 'grown'))));
    expect(faces.size).toBeGreaterThan(190);
    const shapes = new Set(KEYS.map((k) => faceFromKey(k, 'grown').shape));
    expect(shapes.size).toBe(FACE_SHAPES.length);
  });

  it('never hands out facial hair or pointed ears, and no scars on the young', () => {
    for (const key of KEYS) {
      const face = faceFromKey(key, 'young');
      expect(face.facialHair).toBe('none');
      expect(face.ears).not.toBe('pointed');
      expect(face.mark).not.toBe('scar');
    }
  });

  it('keeps the age it was asked for', () => {
    expect(faceFromKey('genkuro', 'old').age).toBe('old');
  });
});

describe('lookOf', () => {
  it('keeps a face someone already has', () => {
    const look = lookOf(DEFAULT_APPEARANCE, 'anyone', 'old');
    expect(look.face).toEqual(DEFAULT_APPEARANCE.face);
  });

  it('keeps the parts an author pinned and reads the rest from the key', () => {
    const { face: _, ...faceless } = DEFAULT_APPEARANCE;
    const look = lookOf({ ...faceless, face: { nose: 'hooked' } }, 'ren', 'grown');
    expect(look.face).toEqual({ ...faceFromKey('ren', 'grown'), nose: 'hooked' });
  });

  it('reads a face from the key when there is none', () => {
    const { face: _, ...faceless } = DEFAULT_APPEARANCE;
    expect(lookOf(faceless, 'ren', 'young').face).toEqual(faceFromKey('ren', 'young'));
  });
});
