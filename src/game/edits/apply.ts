import type { ContentPack, EnemyDef, PersonDef } from '@/content';
import { STAT_IDS, type Stats } from '@/systems/stats';
import { maxChakra } from '@/systems/vitals';

import { enemyStatLine } from '../enemyStats';
import { withTaught } from './made/shelving';
import { enemyKey, madeTechniques, personKey, type ContentEdits, type FighterEdit } from './state';

/**
 * A pack with its edits laid over it: techniques made in the editor join the pack's (those
 * taught on the home village's shelves), each edited
 * fighter's stats and techniques replace the pack's, everything else stays as written. Edits
 * naming someone the pack no longer has are passed over, as are techniques no one has any more
 * (a fighter left with none of theirs keeps the pack's list).
 */

/** A fighter's edit with only the techniques the edited world has. */
function known(
  edit: FighterEdit | undefined,
  has: (id: string) => boolean,
): FighterEdit | undefined {
  if (!edit?.techniqueIds) return edit;
  const techniqueIds = edit.techniqueIds.filter(has);
  if (techniqueIds.length === edit.techniqueIds.length) return edit;
  const { techniqueIds: _was, ...rest } = edit;
  return techniqueIds.length > 0 ? { ...rest, techniqueIds } : rest;
}

function editedPerson(person: PersonDef, edit: FighterEdit | undefined): PersonDef {
  if (!edit) return person;
  const stats: Stats = { ...person.stats, ...edit.stats };
  if (!edit.techniqueIds) return { ...person, stats };
  return { ...person, stats, arsenal: { ...person.arsenal, techniqueIds: edit.techniqueIds } };
}

/**
 * A foe's stats are a base and bonuses, its chakra authored: an edited line is written back as
 * bonuses over the same base, and its chakra as what the edited reserves give.
 */
function editedEnemy(def: EnemyDef, edit: FighterEdit | undefined): EnemyDef {
  if (!edit) return def;
  const techniques = edit.techniqueIds ? { techniqueIds: edit.techniqueIds } : {};
  if (!edit.stats) return { ...def, ...techniques };
  const stats: Stats = { ...enemyStatLine(def), ...edit.stats };
  const bonuses = Object.fromEntries(STAT_IDS.map((id) => [id, stats[id] - def.baseStat]));
  const chakra = edit.stats.reserves === undefined ? def.maxChakra : maxChakra(stats);
  return { ...def, ...techniques, statBonuses: bonuses, maxChakra: chakra };
}

export function withEdits(pack: ContentPack, edits: ContentEdits): ContentPack {
  const { fighters } = edits;
  const made = madeTechniques(edits).filter((t) => !pack.techniques.some((p) => p.id === t.id));
  if (Object.keys(fighters).length === 0 && made.length === 0) return pack;
  const taught = made.filter((t) => edits.taught?.includes(t.id));
  const shelved = withTaught(pack, taught);
  const techniques = [...pack.techniques, ...made];
  const ids = new Set(techniques.map((t) => t.id));
  const has = (id: string) => ids.has(id);
  const person = (p: PersonDef) => editedPerson(p, known(fighters[personKey(p.id)], has));
  return {
    ...shelved,
    techniques,
    people: pack.people.map(person),
    ...(pack.duelists ? { duelists: pack.duelists.map(person) } : {}),
    enemies: pack.enemies.map((e) => editedEnemy(e, known(fighters[enemyKey(e.id)], has))),
  };
}
