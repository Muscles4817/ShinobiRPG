import { brushPath, splinePoints } from './brush';

describe('brush lines', () => {
  it('passes through the points it is given', () => {
    const line = splinePoints([
      [0, 0],
      [10, 5],
      [20, 0],
    ]);
    expect(line[0]).toEqual([0, 0]);
    expect(line[line.length - 1]).toEqual([20, 0]);
    expect(line.some(([x, y]) => Math.abs(x - 10) < 0.01 && Math.abs(y - 5) < 0.01)).toBe(true);
  });

  it('draws a closed shape, thin at the tips and full in the middle', () => {
    const d = brushPath(
      [
        [0, 0],
        [50, 0],
        [100, 0],
      ],
      { w: 10 },
    );
    expect(d.startsWith('M')).toBe(true);
    expect(d.endsWith('Z')).toBe(true);
    const ys = [...d.matchAll(/-?\d+(\.\d+)? (-?\d+(\.\d+)?)/g)].map((m) => Number(m[2]));
    expect(Math.max(...ys)).toBeCloseTo(5, 0);
    expect(Math.abs(ys[0] ?? 9)).toBeLessThan(1);
  });

  it('makes nothing of no points', () => {
    expect(splinePoints([])).toEqual([]);
  });
});
