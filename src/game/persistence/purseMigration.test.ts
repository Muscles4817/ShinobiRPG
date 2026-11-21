import { newGame } from '@/test/gameFixtures';

import { deserialize } from './save';

describe('the purse migration', () => {
  it('gives the ryo chips of an older record their amounts, and leaves other chips be', () => {
    const game = newGame();
    const entry = (id: number, label: string) => ({
      id,
      day: 1,
      slot: 0,
      heading: 'Old',
      text: '',
      tone: 'info',
      chips: [{ label, tone: 'cost' }],
    });
    const older = {
      ...game,
      journal: {
        entries: [
          entry(1, '−12 ryo'),
          entry(2, '+240 ryo'),
          entry(3, '−30 ryo passage'),
          entry(4, '40 ryo / week'),
        ],
        nextId: 5,
      },
    };
    const loaded = deserialize(JSON.stringify({ version: 72, state: older }));
    if (!loaded.ok) throw new Error(loaded.error);
    const amounts = loaded.value.journal.entries.map((e) => e.chips?.[0]?.ryo);
    expect(amounts).toEqual([-12, 240, -30, undefined]);
  });
});
