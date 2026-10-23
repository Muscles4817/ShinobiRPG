import { fitFrame } from './fitFrame';

const map = { width: 100, height: 70 };

describe('fitFrame', () => {
  it('widens the road’s frame to the pane’s shape around its middle', () => {
    const fitted = fitFrame({ x: 40, y: 20, width: 20, height: 20 }, 2, map);
    expect(fitted).toEqual({ x: 30, y: 20, width: 40, height: 20 });
  });

  it('keeps the frame on the map', () => {
    const fitted = fitFrame({ x: 0, y: 0, width: 20, height: 20 }, 2, map);
    expect(fitted).toEqual({ x: 0, y: 0, width: 40, height: 20 });
  });
});
