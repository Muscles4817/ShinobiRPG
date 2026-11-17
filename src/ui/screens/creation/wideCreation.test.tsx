// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { SaveStore } from '@/game';

import { App } from '../../App';

/** The academy file on a desk: the student and the pages on a rail, Enter and Esc to turn. */

const EMPTY: SaveStore = { load: () => null, save: () => undefined, clear: () => undefined };

/** Makes every `min-width` query match: a wide window. */
function windowWide() {
  window.matchMedia = (query: string) =>
    ({
      matches: query.includes('min-width'),
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList; // a stand-in: jsdom has no matchMedia of its own
}

describe('the academy file on a desk (smoke test)', () => {
  afterEach(() => {
    Reflect.deleteProperty(window, 'matchMedia');
  });

  it('keeps the student beside the page, turns pages with Enter and Esc, and opens turned ones', async () => {
    windowWide();
    const user = userEvent.setup();
    render(<App store={EMPTY} />);
    await user.click(screen.getByRole('button', { name: /^New game/ }));
    // Enter on the world just picked turns the page: the pick is made, the press means "on".
    await user.click(screen.getByRole('button', { name: /Land of Embers/ }));
    await user.keyboard('{Enter}');
    // Nothing of the student shows before their file is read.
    expect(screen.getByText('A file not yet read')).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: /%/ })[0]!);
    await user.click(screen.getByRole('button', { name: 'Find your file' }));
    await user.type(screen.getByLabelText('Given name'), 'Aoi');
    const student = screen.getByRole('region', { name: 'The student on the file' });
    expect(within(student).getByText('Aoi')).toBeInTheDocument();

    // Enter turns the page once focus has left the name field; Esc goes back.
    await user.click(screen.getByRole('heading', { name: 'Student record' }));
    await user.keyboard('{Enter}');
    expect(screen.getByRole('heading', { name: 'Class standing' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.getByRole('heading', { name: 'Student record' })).toBeInTheDocument();

    // A page already turned to opens again from the rail.
    const pages = within(screen.getByRole('navigation', { name: 'The file’s pages' }));
    await user.click(pages.getByRole('button', { name: /Class standing/ }));
    expect(screen.getByRole('heading', { name: 'Class standing' })).toBeInTheDocument();
    expect(pages.getByRole('button', { name: /Medical record/ })).toBeDisabled();
  });
});
