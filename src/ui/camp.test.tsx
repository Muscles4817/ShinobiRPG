// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { GameAction } from '@/game';
import { inTheDeep, wildCtx } from '@/test/wildCountry';

import { CampPage } from './screens/places/CampPage';

/** A camp in wild country (smoke test): what's in your pack, and making camp. */

describe('the camp page', () => {
  it('says what you carry and makes camp for the night', async () => {
    const user = userEvent.setup();
    const done: GameAction[] = [];
    render(
      <CampPage
        ctx={wildCtx}
        state={inTheDeep()}
        perform={(a) => done.push(a)}
        onBack={() => undefined}
      />,
    );
    expect(screen.getByText('2 days of food in your pack')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Make camp and sleep till dawn' }));
    expect(done).toEqual([{ type: 'makeCamp' }]);
  });
});
