// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { IconId } from '@/game';

import { Icon } from './Icon';

const IDS: readonly IconId[] = [
  'post',
  'bowl',
  'board',
  'scroll',
  'stacks',
  'house',
  'heal',
  'torii',
  'lantern',
  'fish',
  'rice',
  'pill',
  'tea',
  'wind',
  'cart',
  'fist',
  'wave',
  'eye',
  'leaf',
  'tree',
  'dango',
  'grill',
  'sword',
  'seal',
  'anvil',
  'vest',
  'charm',
  'pot',
  'veg',
  'sake',
  'spring',
];

describe('Icon', () => {
  it.each(IDS)('draws %s with an outline in the surrounding ink and a fill of its own', (id) => {
    const { container } = render(<Icon id={id} size={18} />);
    const svg = container.querySelector('svg.icon');
    expect(svg?.getAttribute('stroke')).toBe('currentColor');
    expect(svg?.getAttribute('width')).toBe('18');
    const fills = [...container.querySelectorAll('[fill]')]
      .map((el) => el.getAttribute('fill'))
      .filter((fill) => fill !== 'none');
    expect(fills.length).toBeGreaterThan(0);
  });
});
