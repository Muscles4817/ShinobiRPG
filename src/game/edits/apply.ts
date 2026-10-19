import type { ContentPack, EnemyDef, PersonDef } from '@/content';
import { STAT_IDS, type Stats } from '@/systems/stats';
import { maxChakra } from '@/systems/vitals';

import { enemyStatLine } from '../enemyStats';
import { enemyKey, personKey, type ContentEdits, type FighterEdit } from './state';

/**
 * A pack with its edits laid over it: each edited fighter's stats and techniques replace the
 * pack's, everything else stays as written. Edits naming someone the pack no longer has are
 * passed over.
 */

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
  if (Object.keys(fighters).length === 0) return pack;
  const person = (p: PersonDef) => editedPerson(p, fighters[personKey(p.id)]);
  return {
    ...pack,
    people: pack.people.map(person),
    ...(pack.duelists ? { duelists: pack.duelists.map(person) } : {}),
    enemies: pack.enemies.map((e) => editedEnemy(e, fighters[enemyKey(e.id)])),
  };
}
