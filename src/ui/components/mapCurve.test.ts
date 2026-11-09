import { alongCurve, curvePath } from './mapCurve';

const road = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 30 },
];

describe('alongCurve', () => {
  it('starts on the first point and ends on the last', () => {
    expect(alongCurve(road, 0).point).toEqual({ x: 0, y: 0 });
    expect(alongCurve(road, 1).point).toEqual({ x: 10, y: 30 });
    expect(alongCurve(road, 1).path).toBe(curvePath(road, false));
  });

  it('reaches a bend at its share of the straight line, as the game measures legs', () => {
    // The first stretch is 10 of 40 units.
    expect(alongCurve(road, 0.25).point).toEqual({ x: 10, y: 0 });
  });
});
