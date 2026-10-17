// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { FaceParts, Look } from '@/game';

import { Portrait } from './Portrait';

const BASE: Look = {
  hairStyle: 'spiky',
  hairColour: '#4a2f1d',
  eyeColour: '#3b6fb6',
  skinTone: '#e2b48c',
  outfitColour: '#2f4f7a',
  headband: 'forehead',
  face: {
    shape: 'oval',
    figure: 'average',
    eyes: 'almond',
    brows: 'straight',
    nose: 'button',
    ears: 'small',
    expression: 'calm',
    age: 'young',
    facialHair: 'none',
    mark: 'none',
  },
};

const VARIANTS: readonly Partial<FaceParts>[] = [
  { shape: 'square', eyes: 'hooded', nose: 'hooked', ears: 'pointed', expression: 'grin' },
  { shape: 'long', figure: 'broad', brows: 'bushy', age: 'old', facialHair: 'beard', mark: 'scar' },
  { shape: 'heart', figure: 'slight', eyes: 'upturned', expression: 'smirk', mark: 'earrings' },
];

/** Every `url(#…)` a drawing points at. */
function references(root: Element): string[] {
  return [...root.querySelectorAll('[fill], [clip-path]')].flatMap((el) =>
    ['fill', 'clip-path']
      .map((attr) => /^url\(#(.+)\)$/.exec(el.getAttribute(attr) ?? '')?.[1])
      .filter((id): id is string => id !== undefined),
  );
}

describe('Portrait', () => {
  it.each(VARIANTS)('draws a face of parts, every reference defined (%o)', (parts) => {
    const { container } = render(
      <Portrait appearance={{ ...BASE, face: { ...BASE.face, ...parts } }} />,
    );
    for (const id of references(container)) {
      expect(container.querySelector(`[id="${id}"]`)).not.toBeNull();
    }
  });

  it('gives two faces on one page their own ids', () => {
    const { container } = render(
      <>
        <Portrait appearance={BASE} />
        <Portrait appearance={BASE} framing="face" size={24} />
      </>,
    );
    const ids = [...container.querySelectorAll('[id]')].map((el) => el.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
