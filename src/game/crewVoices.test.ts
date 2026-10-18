import { CONTENT_PACKS, TONES } from '@/content';
import { reactionTo } from '@/systems/bonds';
import { PRONOUN_FORMS } from '@/core';
import { arcPlayer } from '@/test/arcPlay';
import { act, ctx, fightOut, newGame, postEverything, veteran } from '@/test/gameFixtures';

import { activeMission } from './missionFlow';
import { campLine } from './story/campLines';
import { decide } from './story/decide';
import { tastesOf } from './people/cast';
import { crewPeople } from './story/personal';
import { stungBy } from './story/voices';
import type { GameState } from './state';

/**
 * The crew answer what happened: a word after a fight, a grudge by the fire for a choice that
 * sat badly, camp told with whoever is along, and a job's text agreeing with its leader.
 */

function arcJob(): GameState {
  return act(arcPlayer(ctx).ready(), { type: 'startMission', missionId: 'arc-ford-pilot-home' });
}

/** Plays on until the job's first fight is over. */
function pastTheFight(start: GameState): GameState {
  let s = start;
  for (let i = 0; i < 12 && !s.mission?.marks.includes('fought-past'); i++) {
    if (s.combat) s = fightOut(s);
    else if (s.mission?.encounter) s = act(s, { type: 'encounterApproach', approach: 'head-on' });
    else s = act(s, { type: 'missionContinue' });
  }
  return s.combatFinale ? act(s, { type: 'leaveFight' }) : s;
}

describe('the crew after a fight', () => {
  it('says something once the fight is won, once a job', () => {
    const s = pastTheFight(arcJob());
    const notes = s.mission?.notes ?? [];
    const won = notes.findIndex((n) => n.kind === 'outcome');
    expect(won).toBeGreaterThan(-1);
    expect(notes[won + 1]?.kind).toBe('voice');
    const after = ctx.content.voices
      .filter((v) => v.moment === 'after-fight')
      .flatMap((v) => v.lines);
    const said = notes[won + 1];
    expect(after).toContain(said?.kind === 'voice' ? said.text : '');
    expect(notes.filter((n) => n.kind === 'voice' && after.includes(n.text))).toHaveLength(1);
  });
});

describe('a grudge by the fire', () => {
  it('marks whoever a choice sat badly with', () => {
    const s = postEverything(veteran(newGame(), 3));
    const going = act(s, { type: 'startMission', missionId: 'brides-chest' });
    const [mate] = crewPeople(going, ctx);
    const def = activeMission(going, ctx);
    if (!mate || !def) throw new Error('the escort goes with a crew');
    const sour = TONES.find((t) => reactionTo(tastesOf(mate, ctx), t) < 0);
    if (!sour) throw new Error(`${mate.name} minds nothing`);
    const after = decide(going, ctx, def, { label: 'Say it', tone: sour, reply: 'You say it.' });
    expect(after.mission?.marks).toContain(stungBy(mate.id));
  });
});

describe('camp, told with whoever is along', () => {
  it('names someone from the crew, with their own pronouns', () => {
    const s = act(postEverything(veteran(newGame(), 3)), {
      type: 'startMission',
      missionId: 'brides-chest',
    });
    const names = crewPeople(s, ctx).map((p) => p.name);
    const line = campLine(s, ctx, 'drill');
    expect(names.some((n) => line.text.includes(n))).toBe(true);
    expect(line.text).not.toMatch(/\{/);
    expect(campLine({ ...s, told: line.told }, ctx, 'drill').text).not.toBe(line.text);
  });
});

describe('a job’s words about its leader', () => {
  it('uses only forms the leader has', () => {
    const forms = new Set(['name', ...PRONOUN_FORMS]);
    for (const pack of CONTENT_PACKS) {
      const used = JSON.stringify(pack.missions).match(/\{leader\.([^}]+)\}/g) ?? [];
      for (const slot of used) expect(forms).toContain(slot.slice('{leader.'.length, -1));
    }
  });

  it('fills them from whoever leads the crew', () => {
    const s = arcJob();
    const def = activeMission(s, ctx);
    expect(JSON.stringify(def?.stages)).not.toContain('{leader.');
  });
});
