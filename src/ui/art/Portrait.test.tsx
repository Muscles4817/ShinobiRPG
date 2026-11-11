// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { FaceParts, HairStyle, Look } from '@/game';

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

const HAIR_STYLES: readonly HairStyle[] = [
  'spiky',
  'short',
  'long',
  'ponytail',
  'buns',
  'shaved',
  'bob',
  'topknot',
  'shaggy',
];

describe('Portrait', () => {
  it.each(VARIANTS)('draws a bust of parts, every reference defined (%o)', (parts) => {
    const { container } = render(
      <Portrait appearance={{ ...BASE, face: { ...BASE.face, ...parts } }} />,
    );
    expect(references(container).length).toBeGreaterThan(0);
    for (const id of references(container)) {
      expect(container.querySelector(`[id="${id}"]`)).not.toBeNull();
    }
  });

  it('gives two portraits on one page their own ids', () => {
    const { container } = render(
      <>
        <Portrait appearance={BASE} />
        <Portrait appearance={BASE} size={120} />
        <Portrait appearance={BASE} framing="face" size={24} />
      </>,
    );
    const ids = [...container.querySelectorAll('[id]')].map((el) => el.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('draws an ink bust where there is room and a lantern shadow where there isn’t', () => {
    const { container } = render(
      <>
        <Portrait appearance={BASE} size={120} />
        <Portrait appearance={BASE} size={48} />
        <Portrait appearance={BASE} size={120} framing="face" />
      </>,
    );
    const drawn = [...container.querySelectorAll('svg')].map((svg) =>
      svg.classList.contains('shadow'),
    );
    expect(drawn).toEqual([false, true, true]);
  });

  it.each(HAIR_STYLES)('draws %s hair as a bust and as a shadow', (hairStyle) => {
    const { container } = render(
      <>
        <Portrait appearance={{ ...BASE, hairStyle }} size={120} />
        <Portrait appearance={{ ...BASE, hairStyle }} size={40} />
      </>,
    );
    expect(container.querySelectorAll('svg')).toHaveLength(2);
    expect(container.innerHTML).not.toContain('NaN');
  });

  it('hangs a name tag with their character only when the look carries one', () => {
    const tagged = { ...BASE, bearing: { dress: 'flak', seal: '剛', art: 'taijutsu' } } as const;
    const { container } = render(
      <>
        <Portrait appearance={BASE} size={120} />
        <Portrait appearance={tagged} size={120} />
      </>,
    );
    const tags = container.querySelectorAll('.portrait-seal');
    expect(tags).toHaveLength(1);
    expect(tags[0]).toHaveTextContent('剛');
  });
});
