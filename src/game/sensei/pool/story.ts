import type { ContentPack, ConversationDef, EnemyDef, SenseiPast, SenseiPastFoe } from '@/content';
import { fillSlots, type Rng } from '@/core';
import type { ArcDef, MissionDef, MissionStage } from '@/systems/missions';
import type { Discipline } from '@/systems/techniques';

import { rolledPronouns } from '../../people/pronouns';

/**
 * A generated sensei's story, made from their past (`compose.ts`): the four conversations at
 * bond stages one to four, the last opening their arc; the foe it ends against; and the two
 * jobs of the arc, on their ground. Every line is the past's own, filled with this sensei's
 * names and places, so the talk and the jobs always agree.
 */

/** The record and pay of the arc's jobs: C-rank team work, well paid for every day away. */
const ARC_RECORD = 4;
const FIND_ENERGY = 25;
const SETTLE_ENERGY = 30;
const FIND_PAY_A_DAY = 130;
const SETTLE_PAY_A_DAY = 150;
const FIND_REPUTATION = 5;
const SETTLE_REPUTATION = 8;
/** How hard the find is: the same as an authored arc's. */
const FIND_DIFFICULTY = 9;
/** The foe: a dangerous rogue a jōnin leads a team against (as authored arcs' are). */
const FOE_BASE = 11;
const FOE_ART = 4;
const FOE_SPEED = 2;
const FOE_PERCEPTION = 1;
const FOE_CHAKRA = 70;
const FOE_TECHNIQUES = 2;
/** The foe's techniques: what a chūnin-grade rogue of their art would know. */
const FOE_RANKS = ['D', 'C'];

/** What a sensei's lines are filled with. */
export type Slots = Readonly<Record<string, string>>;

/** Fills a part's slots; `{you}` and `{them}` stay for conversations to fill. */
export function fill(text: string, slots: Slots): string {
  return fillSlots(text, slots);
}

export interface StoryIds {
  readonly personId: string;
  readonly opens: string;
  readonly found: string;
  readonly settled: string;
}

/** The four story conversations; every reply of the last opens the arc. */
export function beatsFor(past: SenseiPast, slots: Slots, ids: StoryIds): ConversationDef[] {
  return past.beats.map((beat, i) => {
    const last = i === past.beats.length - 1;
    return {
      id: `${ids.personId}-story-${i + 1}`,
      personId: ids.personId,
      minStage: i + 1,
      opener: fill(beat.opener, slots),
      choices: beat.choices.map((c) => ({
        label: fill(c.label, slots),
        tone: c.tone,
        reply: fill(c.reply, slots),
        ...(last ? { worldMark: ids.opens } : {}),
      })),
    };
  });
}

/** The name the foe goes by in a fight. */
export function foeName(foe: SenseiPastFoe, given: string): string {
  if (foe.nameless) return foe.epithet.charAt(0).toUpperCase() + foe.epithet.slice(1);
  return foe.epithet.startsWith('who ') ? `${given}, ${foe.epithet}` : `${given} ${foe.epithet}`;
}

function foeTechniques(pack: ContentPack, art: Discipline, rng: Rng): string[] {
  const fits = pack.techniques.filter(
    (t) => t.discipline === art && FOE_RANKS.includes(t.rank) && !t.clan && !t.combo,
  );
  const left = [...fits];
  const picked: string[] = [];
  while (picked.length < FOE_TECHNIQUES && left.length > 0) {
    const [taken] = left.splice(rng.int(0, left.length - 1), 1);
    if (taken) picked.push(taken.id);
  }
  return picked;
}

export function foeFor(
  pack: ContentPack,
  input: {
    readonly id: string;
    readonly name: string;
    readonly art: Discipline;
    readonly slots: Slots;
  },
  past: SenseiPast,
  rng: Rng,
): EnemyDef {
  return {
    id: input.id,
    kind: past.foe.kind,
    danger: 'deadly',
    name: input.name,
    // A past's foe has a name (or an epithet) of their own; a spirit is "it".
    proper: true,
    pronouns: past.foe.kind === 'Spirit' ? 'it' : rolledPronouns(input.id),
    description: fill(past.foe.description, input.slots),
    baseStat: FOE_BASE,
    statBonuses: { [input.art]: FOE_ART, speed: FOE_SPEED, perception: FOE_PERCEPTION },
    maxChakra: FOE_CHAKRA,
    techniqueIds: foeTechniques(pack, input.art, rng),
  };
}

interface ArcInput {
  readonly personId: string;
  readonly client: string;
  readonly foeId: string;
  readonly region: string;
  readonly days: number;
  readonly slots: Slots;
  readonly ids: StoryIds;
}

function findStages(past: SenseiPast, input: ArcInput): MissionStage[] {
  const t = past.arc.find;
  const s = (text: string) => fill(text, input.slots);
  const found = { effects: [{ kind: 'world' as const, mark: input.ids.found }] };
  return [
    { kind: 'narrative', text: s(t.gate) },
    { kind: 'leg', text: s(t.road), days: input.days, region: input.region },
    {
      kind: 'check',
      text: s(t.check),
      approaches: [
        {
          label: 'Read the signs',
          stat: 'perception',
          difficulty: FIND_DIFFICULTY,
          role: 'tracker',
          onSuccess: { ...found, ledger: s(past.arc.ledger.found) },
        },
        {
          label: s('Think where {foe.they} would be'),
          stat: 'intellect',
          difficulty: FIND_DIFFICULTY,
          onSuccess: { ...found, ledger: s(past.arc.ledger.found) },
        },
      ],
      success: s(t.found),
      failure: s(t.lost),
      onFailure: 'forward',
    },
    {
      kind: 'camp',
      text: s(t.camp),
      picks: 2,
      activities: [
        { kind: 'crew', label: 'Sit with the team', when: { crew: 'team' } },
        { kind: 'drill', label: 'Drill by the fire' },
        { kind: 'rest', label: 'Sleep properly' },
      ],
    },
    { kind: 'ending', endings: [{ text: s(t.ending) }] },
    { kind: 'leg', text: s(t.home), days: input.days },
  ];
}

function settleStages(past: SenseiPast, input: ArcInput): MissionStage[] {
  const t = past.arc.settle;
  const s = (text: string) => fill(text, input.slots);
  const mercy = [{ kind: 'mark' as const, mark: 'mercy' }];
  const place = input.slots.place ?? '';
  return [
    { kind: 'leg', text: s(t.road), days: input.days, region: input.region },
    {
      kind: 'decision',
      text: s(t.question),
      options: [
        {
          label: s(t.mercy.label),
          tone: 'earnest',
          reply: s(t.mercy.reply),
          effects: mercy,
          ledger: s(past.arc.ledger.mercy),
        },
        {
          label: s(t.leave.label),
          tone: 'quiet',
          reply: s(t.leave.reply),
          effects: mercy,
          ledger: s(past.arc.ledger.leave),
        },
        {
          label: s(t.finish.label),
          tone: 'challenge',
          reply: s(t.finish.reply),
          ledger: s(past.arc.ledger.finish),
        },
      ],
    },
    {
      kind: 'encounter',
      template: past.foe.encounter,
      job: 'eliminate',
      text: s(t.appears),
      enemyIds: [input.foeId],
      canFlee: false,
      bypassable: false,
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'mercy' },
          text: s(t.spared),
          effects: [
            { kind: 'world', mark: input.ids.settled },
            { kind: 'memory', text: `the day it ended at ${place}` },
          ],
          ledger: s(past.arc.ledger.spared),
        },
        {
          text: s(t.ended),
          effects: [
            { kind: 'world', mark: input.ids.settled },
            { kind: 'memory', text: `the last night at ${place}` },
          ],
          ledger: s(past.arc.ledger.ended),
        },
      ],
    },
    { kind: 'leg', text: s(t.home), days: input.days },
  ];
}

/** The arc's two jobs, and the arc. */
export function arcFor(past: SenseiPast, input: ArcInput): { jobs: MissionDef[]; arc: ArcDef } {
  const s = (text: string) => fill(text, input.slots);
  const days = input.days * 2;
  const find: MissionDef = {
    id: `${input.personId}-find`,
    title: s(past.arc.find.title),
    rank: 'C',
    client: input.client,
    summary: s(past.arc.find.summary),
    slots: 1,
    energyCost: FIND_ENERGY,
    reward: { ryo: FIND_PAY_A_DAY * days, reputation: FIND_REPUTATION },
    minMissionsCompleted: ARC_RECORD,
    needsWorldMark: input.ids.opens,
    stages: findStages(past, input),
  };
  const settle: MissionDef = {
    id: `${input.personId}-settle`,
    title: s(past.arc.settle.title),
    rank: 'C',
    client: input.client,
    summary: s(past.arc.settle.summary),
    slots: 1,
    energyCost: SETTLE_ENERGY,
    reward: { ryo: SETTLE_PAY_A_DAY * days, reputation: SETTLE_REPUTATION },
    minMissionsCompleted: ARC_RECORD,
    needsWorldMark: input.ids.found,
    stages: settleStages(past, input),
  };
  const arc: ArcDef = {
    id: `${input.personId}-arc`,
    title: s(past.arc.title),
    summary: s(past.arc.summary),
    acts: [
      {
        beats: ['you', 'need', 'go', 'search'],
        title: find.title,
        text: s(past.arc.find.act),
        jobs: [find.id],
      },
      {
        beats: ['find', 'take', 'return', 'change'],
        title: settle.title,
        text: s(past.arc.settle.act),
        jobs: [settle.id],
      },
    ],
  };
  return { jobs: [find, settle], arc };
}
