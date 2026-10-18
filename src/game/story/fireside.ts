import type { PersonDef, SenseiPhilosophy } from '@/content';
import { fillSlots, hashUnit } from '@/core';
import type { MissionNote } from '@/systems/missions';

import type { GameContext } from '../context';
import { chip, log } from '../ops';
import { personSlots } from '../people/pronouns';
import { waysOf } from '../sensei/generate';
import { mentorOf } from '../sensei/plan';
import { senseiRead } from '../sensei/read';
import type { GameState } from '../state';
import { bondWithOne, crewPeople } from './personal';

/**
 * Your sensei by the fire, on a job they lead: the one evening in the week they are only
 * company. They talk about themselves the way their philosophy talks, then tell you what they
 * saw of you on the road (the hole in your defence, what beat you). It is a camp choice of its
 * own, offered whenever they are along, beside the camp's authored activities.
 */

/** The camp choice's index: it is not one of the stage's activities. */
export const SENSEI_FIRESIDE = -1;
/** Bond for an evening by the fire with your sensei: more than with the crew, it's rarer. */
export const FIRESIDE_BOND = 6;

/** What they talk about when it is only the fire, by what they believe in. No numbers. */
const FIRESIDE_TALK: Readonly<Record<SenseiPhilosophy, readonly string[]>> = {
  body: [
    '“When I was your age I couldn’t do a single push-up,” {sensei} says. “My sensei made me do them in the snow until I could. I hated that for a year.”',
    '{sensei} rubs an old scar across one knuckle. “Broke it on a door I was sure would give. It didn’t. Neither did I.”',
  ],
  teamwork: [
    '“My old team argued about everything,” {sensei} says. “Who cooked, who kept watch. We never argued once on a job. That’s what a team is.”',
    '{sensei} watches your teammates bicker over the pot and smiles at something a long way off.',
  ],
  fundamentals: [
    '“Everyone wants the flashy technique,” {sensei} says. “The ones who live are the ones who never miss the plain one.”',
    '{sensei} shows you a hand seal you thought you knew, slower. It isn’t the one you’ve been making.',
  ],
  edge: [
    '“I was the best in my year,” {sensei} says, “and it nearly killed me. Being good makes you careless.”',
    '{sensei} flicks a pebble into the fire without looking. It lands dead in the middle.',
  ],
  survival: [
    '“The road kills more shinobi than enemies do,” {sensei} says. “Cold, bad water, a twisted ankle a day from anywhere.”',
    '{sensei} checks everyone’s feet before anyone may sleep. Nobody argues.',
  ],
  control: [
    '{sensei} holds a leaf to the forehead with nothing but chakra and talks the whole time as if it were nothing.',
    '“Control is patience you can feel,” {sensei} says. “You’ll hate it until the day it saves you.”',
  ],
  shadow: [
    '“Never sit with your back to the dark,” {sensei} says, and moves you round the fire.',
    '{sensei} names three people who watched your camp tonight. You never saw one of them.',
  ],
};

/** Your sensei, when they are along on this job. */
export function senseiAlong(state: GameState, ctx: GameContext): PersonDef | null {
  const sensei = mentorOf(state, ctx);
  if (!sensei || !state.mission) return null;
  return crewPeople(state, ctx).some((p) => p.id === sensei.id) ? sensei : null;
}

function talkOf(state: GameState, sensei: PersonDef): string | null {
  const philosophy = waysOf(sensei)?.philosophy;
  if (!philosophy) return null;
  // Their own fireside talk, when they have a voice; else what their philosophy talks about.
  const lines = sensei.sensei?.voice?.fireside ?? FIRESIDE_TALK[philosophy];
  const pick = Math.floor(hashUnit(state.board.seed, state.time.day, sensei.id) * lines.length);
  const line = lines[pick];
  return line === undefined ? null : fillSlots(line, personSlots('sensei', sensei));
}

/** An evening with your sensei: bond, a little of who they are, and what they saw of you. */
export function sitWithSensei(state: GameState, sensei: PersonDef): GameState {
  const read = senseiRead(state, sensei);
  const talk = talkOf(state, sensei);
  const notes: MissionNote[] = [
    { kind: 'story', text: `You sit with ${sensei.name} by the fire.` },
    ...(talk ? [{ kind: 'story' as const, text: talk }] : []),
    { kind: 'voice', speaker: sensei.name, text: read.beaten ?? read.danger },
  ];
  const closer = bondWithOne(state, sensei.id, FIRESIDE_BOND);
  const logged = log(closer, {
    text: `You sit with ${sensei.name} by the fire.`,
    tone: 'success',
    chips: [chip(`+${FIRESIDE_BOND} bond with ${sensei.name}`, 'gain')],
  });
  const run = logged.mission;
  return run ? { ...logged, mission: { ...run, notes: [...run.notes, ...notes] } } : logged;
}
