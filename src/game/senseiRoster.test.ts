import { CONTENT_PACKS } from '@/content';
import { act, freshGame } from '@/test/gameFixtures';

import { contextForPack } from './context';
import { offerSenseis } from './people/senseis';
import { mentorOf } from './sensei/plan';
import type { GameState } from './state';

/** Who takes a team in each pack, and that each of them has a whole story and an arc. */

const CANON_TEAMS = ['kakashi', 'guy', 'kurenai', 'asuma'];

describe.each(CONTENT_PACKS.map((p) => [p.id, p] as const))('senseis of "%s"', (_id, pack) => {
  const offered = pack.people.filter((p) => p.sensei && p.sensei.offered !== false);

  it('every sensei taking a team has four story beats and an arc their last beat opens', () => {
    expect(offered.length).toBeGreaterThanOrEqual(5);
    for (const sensei of offered) {
      const story = sensei.sensei?.ways?.story;
      expect(story?.beats).toHaveLength(4);
      const arc = pack.arcs.find((a) => a.id === story?.arcId);
      expect(arc, sensei.id).toBeDefined();
      const last = pack.conversations.find((c) => c.id === story?.beats[3]);
      const marks = new Set(last?.choices.map((c) => c.worldMark));
      const first = pack.missions.find((m) => m.id === arc?.acts[0]?.jobs[0]);
      expect(marks.has(first?.needsWorldMark), sensei.id).toBe(true);
    }
  });

  it('covers every art among those who take a team', () => {
    const arts = new Set(offered.map((p) => p.sensei?.specialty));
    expect(arts.size).toBe(5);
  });
});

describe('the fan pack’s famous senseis', () => {
  const naruto = contextForPack('naruto')!;

  it('are never offered a new team: they have theirs', () => {
    const offers = offerSenseis(freshGame(naruto).character, naruto.content.people.all);
    expect(offers).toHaveLength(2);
    expect(offers.filter((id) => CANON_TEAMS.includes(id))).toEqual([]);
    const all = naruto.content.people.all.filter((p) => p.sensei?.offered !== false);
    expect(all.map((p) => p.id).filter((id) => CANON_TEAMS.includes(id))).toEqual([]);
  });

  it('still lead a save that already chose them', () => {
    const assigned = act(freshGame(naruto), { type: 'assignTeam' }, naruto);
    const team = { ...assigned.people.team!, senseiId: 'kakashi' };
    const old: GameState = { ...assigned, people: { ...assigned.people, team } };
    expect(mentorOf(old, naruto)?.id).toBe('kakashi');
  });
});
