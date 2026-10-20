// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { VersusSetup } from './VersusSetup';

/** The versus setup on a desk: the bout, the roster and a profile side by side. */

function asDesk(wide: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
      matches: wide,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }),
  });
}

afterEach(() => {
  Reflect.deleteProperty(window, 'matchMedia');
});

describe('versus setup on a desk', () => {
  it('reads a fighter from the roster and puts them in the chosen slot', async () => {
    asDesk(true);
    const user = userEvent.setup();
    const onFight = vi.fn();
    render(<VersusSetup initial={null} onFight={onFight} onBack={() => undefined} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    const roster = screen.getByRole('region', { name: 'Fighters' });
    await user.click(screen.getByRole('button', { name: /^Opponent 1:/ }));
    await user.click(within(roster).getByRole('button', { name: /^Foes/ }));
    await user.selectOptions(within(roster).getByLabelText('Kind'), 'Missing-nin');
    await user.click(within(roster).getByRole('button', { name: /^Zabuza Momochi,/ }));
    expect(screen.getByRole('article', { name: 'Zabuza Momochi’s profile' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Face Zabuza Momochi as opponent 1' }));
    expect(screen.getByRole('button', { name: 'Opponent 1: Zabuza Momochi' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Fight' }));
    expect(onFight).toHaveBeenCalledWith(
      expect.objectContaining({ foes: ['enemy:zabuza'], watch: false }),
    );
  });

  it('opens on the fighter you fight as, and previews whoever is pointed at', async () => {
    asDesk(true);
    const user = userEvent.setup();
    render(<VersusSetup initial={null} onFight={() => undefined} onBack={() => undefined} />);
    const opening = screen.getByRole('article', { name: /’s profile$/ });
    const roster = screen.getByRole('region', { name: 'Fighters' });
    const row = within(roster).getByRole('button', { name: /^Zabuza Momochi,/ });
    await user.hover(row);
    expect(screen.getByRole('article', { name: 'Zabuza Momochi’s profile' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Fight as Zabuza/ })).toBeNull();
    await user.unhover(row);
    expect(
      screen.getByRole('article', { name: opening.getAttribute('aria-label')! }),
    ).toBeVisible();
  });

  it('fights with Enter', async () => {
    asDesk(true);
    const user = userEvent.setup();
    const onFight = vi.fn();
    render(<VersusSetup initial={null} onFight={onFight} onBack={() => undefined} />);
    await user.keyboard('{Enter}');
    expect(onFight).toHaveBeenCalledWith(expect.objectContaining({ watch: false }));
  });

  it('opens the roster over the page on a phone instead', async () => {
    asDesk(false);
    const user = userEvent.setup();
    render(<VersusSetup initial={null} onFight={() => undefined} onBack={() => undefined} />);
    expect(screen.queryByRole('region', { name: 'Fighters' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Add an opponent' }));
    expect(screen.getByRole('dialog', { name: 'Opponent 2' })).toBeInTheDocument();
  });

  it('sorts the roster, and keeps the order when filters are cleared', async () => {
    asDesk(true);
    const user = userEvent.setup();
    render(<VersusSetup initial={null} onFight={() => undefined} onBack={() => undefined} />);
    const roster = screen.getByRole('region', { name: 'Fighters' });
    const firstRow = () => within(within(roster).getByRole('list')).getAllByRole('button')[0]!;
    await user.click(within(roster).getByRole('button', { name: /^Genin/ }));
    await user.selectOptions(within(roster).getByLabelText('Sort'), 'Weakest first');
    const weakest = firstRow().getAttribute('aria-label');
    await user.click(within(roster).getByRole('button', { name: 'Clear filters' }));
    expect(within(roster).getByLabelText('Sort')).toHaveValue('weakest');
    expect(firstRow().getAttribute('aria-label')).not.toBe(weakest);
    expect(firstRow()).toHaveAccessibleName(/fighting power E/);
  });
});
