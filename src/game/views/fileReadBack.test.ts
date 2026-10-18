import { STAT_IDS, STAT_INFO } from '@/systems/stats';
import { ctx, draft } from '@/test/gameFixtures';

import { fileReadBack } from './fileReadBack';

const labels = STAT_IDS.map((id) => STAT_INFO[id].label);

/** How many lines of a list name this stat or art as their subject. */
function mentions(lines: readonly string[], label: string): number {
  return lines.filter((line) => line.startsWith(`${label} `)).length;
}

describe('the file read back, stat by stat', () => {
  const talents = ctx.content.talents.all.map((t) => t.id);

  it.each(talents)('never lists an art twice with the note %s', (talentId) => {
    const file = draft({ talentIds: [talentId] });
    const gifted = { ...file, file: { ...file.file, gifts: { taijutsu: 'gifted' as const } } };
    const read = fileReadBack(gifted, ctx);
    for (const label of labels) {
      expect(mentions([...read.easy, ...read.hard], label), label).toBeLessThanOrEqual(1);
      expect(mentions(read.limits, label), label).toBeLessThanOrEqual(1);
    }
  });

  it('says a gift once for its pace and once for its reach', () => {
    const file = draft();
    const read = fileReadBack(
      { ...file, file: { ...file.file, gifts: { taijutsu: 'gifted' } } },
      ctx,
    );
    expect(read.easy.filter((l) => l.startsWith('Taijutsu'))).toHaveLength(1);
    expect(read.limits).toContain('Taijutsu can go further than most.');
  });

  it('reads a flaw that a quick note pulls against as one line, or none', () => {
    const file = draft({ talentIds: ['prodigy'] });
    const read = fileReadBack({ ...file, file: { ...file.file, gifts: { speed: 'flawed' } } }, ctx);
    const speed = [...read.easy, ...read.hard].filter((l) => l.startsWith('Speed'));
    expect(speed.length).toBeLessThanOrEqual(1);
    expect(read.limits).toContain('Speed tops out early.');
  });

  it('joins no thoughts with a colon', () => {
    const read = fileReadBack(draft({ talentIds: ['prodigy', 'sensor'] }), ctx);
    expect([...read.easy, ...read.hard, ...read.people].filter((l) => l.includes(':'))).toEqual([]);
  });
});
