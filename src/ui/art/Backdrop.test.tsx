// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { BackdropId } from '@/game';

import { Backdrop } from './Backdrop';

const IDS: readonly BackdropId[] = [
  'leaf-village',
  'lantern-rooftops',
  'dunes',
  'sand-village',
  'barge-landing',
  'coast',
  'mist',
  'mist-village',
  'mountain',
  'cedar-forest',
  'post-town',
  'waterfall',
  'tide-shrine',
  'salt-flats',
  'battlefield',
  'castle-town',
  'highway-town',
  'pleasure-quarter',
  'bridge-coast',
  'temple-hill',
  'toad-mountain',
  'broadleaf-forest',
  'river-plain',
  'outer-dunes',
  'mountain-stair',
  'gorge-bridge',
  'twin-statues',
];

/** Every `url(#…)` a drawing points at. */
function referencedIds(root: Element): string[] {
  const refs: string[] = [];
  for (const el of root.querySelectorAll('[fill], [stroke]')) {
    for (const attr of ['fill', 'stroke']) {
      const match = /^url\(#(.+)\)$/.exec(el.getAttribute(attr) ?? '');
      if (match?.[1]) refs.push(match[1]);
    }
  }
  return refs;
}

describe('Backdrop', () => {
  it.each(IDS)('paints %s with every gradient it uses defined', (id) => {
    const { container } = render(<Backdrop id={id} />);
    const svg = container.querySelector('svg.backdrop');
    expect(svg).not.toBeNull();
    const refs = referencedIds(container);
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) expect(container.querySelector(`[id="${ref}"]`)).not.toBeNull();
  });

  it('gives two drawings of one scene their own gradient ids', () => {
    const { container } = render(
      <>
        <Backdrop id="lantern-rooftops" />
        <Backdrop id="lantern-rooftops" />
      </>,
    );
    const ids = [...container.querySelectorAll('[id]')].map((el) => el.id);
    expect(new Set(ids).size).toBe(ids.length);
    const [first, second] = container.querySelectorAll('svg.backdrop');
    expect(first && referencedIds(first)).not.toEqual(second && referencedIds(second));
  });
});
