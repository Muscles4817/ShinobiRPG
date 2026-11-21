import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { CONTENT_PACKS } from '@/content';
import { contextForPack, editorRoster, fighterEditor } from '@/game';

/**
 * The fan pack as the Narutopedia scripts need it (`README.md`): every versus fighter with their
 * grades, clan, whether they live in the world and teach, and what they fight with; and every
 * technique the pack has. Writes `out/roster2.json` and `out/techfull.json`.
 */

const OUT = fileURLToPath(new URL('./out', import.meta.url));

it('dumps the fan pack for the Narutopedia scripts', () => {
  mkdirSync(OUT, { recursive: true });
  const pack = CONTENT_PACKS.find((p) => p.id === 'naruto')!;
  const ctx = contextForPack('naruto')!;
  const inWorld = new Set(pack.people.map((p) => p.id));
  const roster = editorRoster(ctx)
    .filter((f) => f.group !== 'Foes')
    .map((f) => {
      const editor = fighterEditor(ctx, f.id)!;
      const pid = f.id.slice('person:'.length);
      const def = pack.people.find((p) => p.id === pid) ?? pack.duelists?.find((p) => p.id === pid);
      return {
        id: f.id,
        pid,
        name: f.name,
        group: f.group,
        inWorld: inWorld.has(pid),
        hasArsenal: def?.arsenal !== undefined,
        teacher: def?.teacher !== undefined,
        clan: def?.clanId ?? null,
        grades: Object.fromEntries(editor.stats.map((s) => [s.id, s.grade])),
        techniqueIds: editor.techniques.map((t) => t.id),
        techniques: editor.techniques.map((t) => t.name),
      };
    });
  writeFileSync(`${OUT}/roster2.json`, JSON.stringify(roster, null, 1));
  writeFileSync(`${OUT}/techfull.json`, JSON.stringify(ctx.content.techniques.all));
});
