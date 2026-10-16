import {
  SENSEI_ARCHETYPES,
  senseiWaysProblems,
  type ContentPack,
  type ConversationDef,
  type EnemyDef,
  type PersonDef,
  type SenseiPast,
  type SenseiTemperament,
  type SenseiWays,
} from '@/content';
import { createRng, hashString } from '@/core';
import { STAT_INFO } from '@/systems/stats';
import type { ArcDef, MissionDef } from '@/systems/missions';

import { waysFor } from '../generate';
import { frameFor, freshName, type Frame } from './frame';
import { arcFor, beatsFor, fill, foeFor, foeName, type Slots, type StoryIds } from './story';

/**
 * One generated sensei, composed from a temperament and a past (`senseiParts.ts`) in a pack:
 * a frame (name, look, art, stats, signatures), ways that follow from the temperament and are
 * bent by the past, a voice, a story of four conversations, and the arc that closes it. All of
 * it is drawn from the pack and the sensei's id alone, so the same pack always makes the same
 * person, and every part is ordinary content every system already reads.
 */

export interface Composed {
  readonly person: PersonDef;
  readonly conversations: readonly ConversationDef[];
  readonly enemy: EnemyDef;
  readonly missions: readonly MissionDef[];
  readonly arc: ArcDef;
}

/** A generated sensei's id: what they are made of, so adding parts never renames anyone. */
export function poolId(past: SenseiPast, temperament: SenseiTemperament): string {
  return `pool-${past.id}-${temperament.id}`;
}

function slotsFor(
  frame: Frame,
  extra: { lost: string; foe: string; keepsake: string; place: string },
): Slots {
  return {
    name: frame.name,
    art: STAT_INFO[frame.specialty].label.toLowerCase(),
    ...extra,
  };
}

/**
 * Their ways: their temperament's kind, bent by their past as far as it can bend and still
 * hang together (a loose grip can't shield you on jobs, `senseiWaysProblems`), telling their
 * story.
 */
function waysOf(
  person: PersonDef,
  parts: Parts,
  story: { beats: string[]; arcId: string; wound: string },
): SenseiWays {
  const kind = SENSEI_ARCHETYPES.find((a) => a.id === parts.temperament.archetype);
  if (!kind) throw new Error(`Unknown archetype "${parts.temperament.archetype}"`);
  const { grip, onMissions } = parts.past.nudge ?? {};
  const bends = [
    { ...(grip ? { grip } : {}), ...(onMissions ? { onMissions } : {}) },
    grip ? { grip } : {},
    onMissions ? { onMissions } : {},
    {},
  ];
  const told = { wound: story.wound, beats: story.beats, arcId: story.arcId };
  const tries = bends.map((bend) => ({ ...waysFor(person, { ...kind, ...bend }), story: told }));
  const plain = { ...waysFor(person, kind), story: told };
  return tries.find((ways) => senseiWaysProblems(person, ways).length === 0) ?? plain;
}

interface Parts {
  readonly temperament: SenseiTemperament;
  readonly past: SenseiPast;
}

export function composeSensei(pack: ContentPack, parts: Parts): Composed | null {
  const { temperament, past } = parts;
  const grounds = pack.senseiParts.grounds.filter((g) => past.regions.includes(g.region));
  const id = poolId(past, temperament);
  const rng = createRng(hashString(`${pack.id}|${id}`));
  const frame = frameFor(pack, parts, rng);
  const ground = grounds.length > 0 ? rng.pick(grounds) : null;
  if (!ground) return null;
  const lost = freshName(pack, rng, [frame.name]);
  const given = past.foe.isLost ? lost : freshName(pack, rng, [frame.name, lost]);
  const enemyName = foeName(past.foe, given);
  const slots = slotsFor(frame, {
    lost,
    foe: past.foe.nameless ? past.foe.epithet : given,
    keepsake: fill(rng.pick(past.keepsakes), { lost }),
    place: ground.place,
  });
  const ids: StoryIds = {
    personId: id,
    opens: `${id}-opens`,
    found: `${id}-found`,
    settled: `${id}-settled`,
  };
  const conversations = beatsFor(past, slots, ids);
  const art = past.foe.art === 'theirs' ? frame.specialty : past.foe.art;
  const enemy = foeFor(pack, { id: `${id}-foe`, name: enemyName, art, slots }, past, rng);
  const client = `${frame.name} ${frame.familyName}`;
  const story = arcFor(past, {
    personId: id,
    client,
    foeId: enemy.id,
    region: ground.region,
    days: ground.days,
    slots,
    ids,
  });
  const person = personFor({ id, frame, parts, slots });
  const ways = waysOf(person, parts, {
    beats: conversations.map((c) => c.id),
    arcId: story.arc.id,
    wound: fill(past.wound, slots),
  });
  const sensei = person.sensei ? { ...person.sensei, ways } : undefined;
  return {
    person: sensei ? { ...person, sensei } : person,
    conversations,
    enemy,
    missions: story.jobs,
    arc: story.arc,
  };
}

function personFor(input: { id: string; frame: Frame; parts: Parts; slots: Slots }): PersonDef {
  const { id, frame, parts, slots } = input;
  const t = parts.temperament;
  const voice = {
    praise: fill(t.voice.praise, slots),
    scold: fill(t.voice.scold, slots),
    catchphrase: fill(t.voice.catchphrase, slots),
    fireside: t.voice.fireside.map((line) => fill(line, slots)),
  };
  return {
    id,
    name: frame.name,
    familyName: frame.familyName,
    role: 'sensei',
    rank: 'jonin',
    stats: frame.stats,
    title: 'Jōnin',
    traitIds: t.traits,
    appearance: frame.look,
    specialty: frame.specialty,
    bio: fill(t.bio, slots),
    schedule: frame.schedule,
    ...(frame.favouriteRecipeId ? { favouriteRecipeId: frame.favouriteRecipeId } : {}),
    sensei: {
      specialty: frame.specialty,
      favouredTraits: t.favouredTraits,
      ...(frame.nature ? { nature: frame.nature } : {}),
      style: fill(t.style, slots),
      lesson: fill(t.lesson, slots),
      voice,
      pooled: { temperament: t.id, past: parts.past.id },
    },
    teacher: { ...(t.quirk ? { quirk: t.quirk } : {}), teaches: frame.teaches },
  };
}
