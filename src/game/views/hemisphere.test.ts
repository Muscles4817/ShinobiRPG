import { hemisphereOf } from './hemisphere';

describe('which half of the world a clock keeps', () => {
  it('reads the south from the time zone, and the north from anything else', () => {
    expect(hemisphereOf('Australia/Sydney')).toBe('south');
    expect(hemisphereOf('Pacific/Auckland')).toBe('south');
    expect(hemisphereOf('America/Argentina/Buenos_Aires')).toBe('south');
    expect(hemisphereOf('Africa/Johannesburg')).toBe('south');
    expect(hemisphereOf('America/Sao_Paulo')).toBe('south');
    expect(hemisphereOf('Europe/London')).toBe('north');
    expect(hemisphereOf('Asia/Tokyo')).toBe('north');
    expect(hemisphereOf('America/New_York')).toBe('north');
    expect(hemisphereOf(undefined)).toBe('north');
    expect(hemisphereOf('')).toBe('north');
  });
});
