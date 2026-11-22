// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react';
import { StrictMode, type ReactElement } from 'react';

import { KeyLayer, KeyLayers } from './KeyLayer';
import { useKeys } from './useKeys';

/** The key-layer stack: only the top-most open layer hears keys, and the page only with none. */

function Listener({ name, heard }: { readonly name: string; readonly heard: string[] }) {
  useKeys({ k: () => heard.push(name) }, true);
  return null;
}

interface Open {
  readonly a?: boolean;
  readonly b?: boolean;
  readonly nested?: boolean;
}

function Screen({ open, heard }: { readonly open: Open; readonly heard: string[] }) {
  return (
    <KeyLayers>
      <Listener name="page" heard={heard} />
      {open.a && (
        <KeyLayer onEscape={() => heard.push('esc a')}>
          <Listener name="a" heard={heard} />
          {open.nested && (
            <KeyLayer onEscape={() => heard.push('esc nested')}>
              <Listener name="nested" heard={heard} />
            </KeyLayer>
          )}
        </KeyLayer>
      )}
      {open.b && (
        <KeyLayer onEscape={() => heard.push('esc b')}>
          <Listener name="b" heard={heard} />
        </KeyLayer>
      )}
    </KeyLayers>
  );
}

function press(key: string): void {
  fireEvent.keyDown(window, { key });
}

/** Who hears `k` and Esc with these layers open. */
function hearers(rerender: (ui: ReactElement) => void, open: Open, heard: string[]) {
  const from = heard.length;
  rerender(<Screen open={open} heard={heard} />);
  press('k');
  press('Escape');
  return heard.slice(from);
}

describe('the key-layer stack', () => {
  it('gives keys to the layer opened last, and back down as layers close out of order', () => {
    const heard: string[] = [];
    const { rerender } = render(<Screen open={{}} heard={heard} />);
    expect(hearers(rerender, {}, heard)).toEqual(['page']);
    expect(hearers(rerender, { a: true }, heard)).toEqual(['a', 'esc a']);
    expect(hearers(rerender, { a: true, b: true }, heard)).toEqual(['b', 'esc b']);
    // The one underneath closes first: the one on top keeps the keys, the page stays dead.
    expect(hearers(rerender, { b: true }, heard)).toEqual(['b', 'esc b']);
    expect(hearers(rerender, {}, heard)).toEqual(['page']);
  });

  it('puts a layer opened inside another above it', () => {
    const heard: string[] = [];
    const { rerender } = render(<Screen open={{ a: true }} heard={heard} />);
    expect(hearers(rerender, { a: true, nested: true }, heard)).toEqual(['nested', 'esc nested']);
    expect(hearers(rerender, { a: true }, heard)).toEqual(['a', 'esc a']);
  });

  it('lists a layer once under StrictMode’s double mount, and frees the page when it goes', () => {
    const heard: string[] = [];
    const strict = (open: Open) => (
      <StrictMode>
        <Screen open={open} heard={heard} />
      </StrictMode>
    );
    const { rerender } = render(strict({ a: true }));
    press('k');
    expect(heard).toEqual(['a']);
    rerender(strict({}));
    press('k');
    expect(heard).toEqual(['a', 'page']);
  });
});
