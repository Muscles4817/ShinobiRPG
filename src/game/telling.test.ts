import { NOTHING_TOLD } from '@/systems/telling';

import { tellFresh } from './telling';

describe('tellFresh', () => {
  const bank = { name: 'nap', lines: ['a', 'b', 'c', 'd'] };

  it('never repeats a line until the bank has turned over', () => {
    let told = NOTHING_TOLD;
    const said: string[] = [];
    for (let day = 0; day < 8; day++) {
      const telling = tellFresh(told, bank, `day ${day}`);
      said.push(telling.line);
      told = telling.told;
    }
    for (let i = 1; i < said.length; i++) {
      expect(said.slice(Math.max(0, i - 3), i)).not.toContain(said[i]);
    }
  });

  it('is the same pick for the same key and memory', () => {
    expect(tellFresh(NOTHING_TOLD, bank, 'k').line).toBe(tellFresh(NOTHING_TOLD, bank, 'k').line);
  });
});
