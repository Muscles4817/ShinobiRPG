import {
  buildStarted,
  builtValue,
  KEEP_LIMIT,
  keepsTooMany,
  nextPuppetId,
  renamed,
  stockTaken,
  stocked,
  workedOn,
} from './build';
import { NO_WORKSHOP, withPuppet, type BuildJob } from './workshop';

/** Building puppets: craft and materials together, days at the bench, stock and the shelf. */

const job = (over: Partial<BuildJob> = {}): BuildJob => ({
  puppetId: 'built-1',
  name: 'Kite',
  frameId: 'frame-light-doll',
  partIds: ['wrist-blades'],
  materialId: 'pine',
  daysLeft: 2,
  ...over,
});

describe('what a build comes out as', () => {
  it('reaches only so far past your craft, and only so far in a material', () => {
    expect(builtValue(40, 0, 3)).toBe(10);
    expect(builtValue(40, 30, 1)).toBe(20);
    expect(builtValue(40, 30, 3)).toBe(40);
    expect(builtValue(16, 30, 3)).toBe(16);
  });

  it('never comes out at nothing', () => {
    expect(builtValue(2, 0, 1)).toBe(5);
  });
});

describe('the bench', () => {
  it('takes materials from stock, never more than you have', () => {
    const stock = stocked(NO_WORKSHOP, 'pine', 3);
    expect(stockTaken(stock, 'pine', 2)?.stock.pine).toBe(1);
    expect(stockTaken(stock, 'pine', 4)).toBeNull();
  });

  it('turns a build into a puppet after its days of work, teaching craft each day', () => {
    const started = buildStarted(NO_WORKSHOP, job());
    expect(started.nextId).toBe(2);
    const day1 = workedOn(started, 1);
    expect(day1.build?.daysLeft).toBe(1);
    expect(day1.craft).toBeGreaterThan(0);
    const done = workedOn(day1, 2);
    expect(done.build).toBeNull();
    expect(done.puppets[0]).toMatchObject({ id: 'built-1', name: 'Kite', condition: 1 });
    expect(done.puppets[0]?.built?.craftAt).toBe(done.craft);
  });

  it('rebuilds a puppet in its place, whole, with its new sheet', () => {
    const first = workedOn(workedOn(buildStarted(NO_WORKSHOP, job()), 1), 2);
    const second = buildStarted(first, job({ partIds: ['ram-fists'], daysLeft: 1 }));
    expect(second.nextId).toBe(first.nextId);
    const rebuilt = workedOn(second, 3);
    expect(rebuilt.puppets).toHaveLength(1);
    expect(rebuilt.puppets[0]?.built?.partIds).toEqual(['ram-fists']);
  });

  it('keeps only so many puppets, though a rebuild is never one too many', () => {
    let shelf = NO_WORKSHOP;
    for (let i = 0; i < KEEP_LIMIT; i += 1) shelf = withPuppet(shelf, `p${i}`, 'Doll');
    expect(keepsTooMany(shelf, nextPuppetId(shelf))).toBe(true);
    expect(keepsTooMany(shelf, 'p0')).toBe(false);
  });

  it('renames a puppet', () => {
    expect(renamed(withPuppet(NO_WORKSHOP, 'doll', 'Doll'), 'doll', 'Ash').puppets[0]?.name).toBe(
      'Ash',
    );
  });
});
