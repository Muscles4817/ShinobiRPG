import { writeFileSync } from 'node:fs';

import { contextForPack } from '@/game';
import { readingOf } from '@/systems/combat';

/**
 * The techniques whose way of reaching their target was guessed from their art rather than read
 * from what they say, for a person to settle (`docs/design/technique-tags.md`). Writes
 * `REVIEW.md` beside this file:
 * `npx vitest run --config prototypes/technique-tags/vitest.config.ts`.
 */

const OUT = new URL('./REVIEW.md', import.meta.url);

function rows(packId: string): string[] {
  const ctx = contextForPack(packId);
  if (!ctx) return [];
  return ctx.content.techniques.all
    .map((t) => ({ t, reading: readingOf(t) }))
    .filter(({ reading }) => !reading.sure)
    .sort((a, b) => a.t.discipline.localeCompare(b.t.discipline) || a.t.id.localeCompare(b.t.id))
    .map(({ t, reading }) => {
      const tags = reading.tags;
      const text = t.description.replace(/\|/g, '/');
      return `| ${t.name} (\`${t.id}\`) | ${t.discipline} | ${tags.delivery.join(', ')} | ${tags.lands.join(', ') || 'nothing'} | ${text} |`;
    });
}

it('lists the guesses', () => {
  const sections = ['naruto', 'original'].map((pack) => {
    const lines = rows(pack);
    return [
      `## ${pack} (${lines.length} guessed)`,
      '',
      '| Technique | Art | Read as | Lands as | Description |',
      '| --- | --- | --- | --- | --- |',
      ...lines,
    ].join('\n');
  });
  const head = [
    '# Technique tags: the guesses to settle',
    '',
    'Each technique below had its delivery guessed from its art, not read from what it says.',
    'Correct the "Read as" column (or say it is right) and the tags are written by hand.',
    '',
  ].join('\n');
  writeFileSync(OUT, `${head}\n${sections.join('\n\n')}\n`);
  expect(sections.length).toBe(2);
});
