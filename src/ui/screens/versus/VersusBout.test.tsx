// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';

import { contextForPack, versusRoster } from '@/game';

import { VersusBout } from './VersusBout';
import type { VersusChoice } from './VersusSetup';

/** A versus bout: the fight scene with every fighter's bars, laid out for the desk on one. */

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

function choice(watch: boolean): VersusChoice {
  const ctx = contextForPack('naruto')!;
  const [first, second] = versusRoster(ctx);
  return { ctx, side: [first!.id], foes: [second!.id], ground: 'arena', watch };
}

function renderBout(watch: boolean) {
  const bout = choice(watch);
  return render(
    <VersusBout
      choice={bout}
      onRematch={() => undefined}
      onChangeFighters={() => undefined}
      onMenu={() => undefined}
    />,
  );
}

describe('a versus bout', () => {
  it('shows both fighters’ health, chakra and breath while you watch', () => {
    asDesk(false);
    renderBout(true);
    const bars = screen.getByRole('region', { name: 'Every fighter’s bars' });
    const cards = within(bars).getAllByRole('article');
    expect(cards).toHaveLength(2);
    for (const card of cards) {
      expect(within(card).getByText('Health')).toBeInTheDocument();
      expect(within(card).getByText('Chakra')).toBeInTheDocument();
      expect(within(card).getByText('Breath')).toBeInTheDocument();
    }
  });

  it('shows every fighter’s bars on the plan screen too', () => {
    asDesk(false);
    renderBout(false);
    const bars = screen.getByRole('region', { name: 'Every fighter’s bars' });
    expect(within(bars).getAllByRole('article')).toHaveLength(2);
  });

  it('takes the fight’s desktop arrangement on a desk', () => {
    asDesk(true);
    const { container } = renderBout(false);
    expect(container.querySelector('.app.wide.scene-combat .wide-scene')).not.toBeNull();
  });
});
