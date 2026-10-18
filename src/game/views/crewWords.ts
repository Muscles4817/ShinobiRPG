import { listed } from '@/core';
import type { Crew } from '@/systems/missions';
import { RANK_LABELS } from '@/systems/standing';

import type { GameContext } from '../context';
import { requirePerson } from '../people/cast';
import type { GameState } from '../state';

/** Who goes with you on a job, in words: "You lead Aki and Ren", "Under Jōnin Ise, with Gen". */

export interface CrewWords {
  /** One phrase naming the crew. */
  readonly line: string;
  /** You lead it (decisions are yours, and so is everyone's safety). */
  readonly youLead: boolean;
}

function lineFor(crew: Crew, leader: string | null, members: string): string {
  switch (crew.kind) {
    case 'solo':
      return 'Alone';
    case 'old-team':
      return leader ? `With your team, ${leader} leading` : 'With your team';
    case 'exam-team':
      return 'With your exam team';
    case 'genin-squad':
      return `You lead ${members}`;
    case 'chunin-squad':
      if (!leader) return `You lead ${members}`;
      return members ? `${leader} leads, with ${members}` : `Under ${leader}`;
    case 'jonin-led':
      return `Under ${RANK_LABELS.jonin} ${leader ?? ''}, with ${members}`;
    case 'companion':
      return `With ${members}`;
  }
}

/** The crew in words, or null when you go alone. */
export function crewWords(state: GameState, ctx: GameContext, crew: Crew): CrewWords | null {
  if (crew.kind === 'solo') return null;
  const name = (id: string) => requirePerson(state, ctx, id).name;
  const leader = crew.leaderId === null ? null : name(crew.leaderId);
  const line = lineFor(crew, leader, listed(crew.memberIds.map(name)));
  return { line, youLead: leader === null };
}
