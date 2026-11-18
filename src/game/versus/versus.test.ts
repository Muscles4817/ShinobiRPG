import { combatScene, combatScouting, type GameState } from '@/game';
import { act, fightOut } from '@/test/gameFixtures';

import { contextForPack } from '../context';
import { createVersus } from './match';
import { contenderOf, versusRoster } from './roster';
import { playerSetup } from './sides';

/** Versus mode: any two of the pack's fighters, head to head, in a sandbox. */

const naruto = contextForPack('naruto')!;

function team(side: readonly string[], foes: readonly string[]) {
  const made = createVersus(naruto, { side, foes, seed: 7 });
  if (!made.ok) throw new Error(made.error);
  return made.value;
}

function bout(youId: string, foeId: string) {
  const made = createVersus(naruto, { side: [youId], foes: [foeId], seed: 7 });
  if (!made.ok) throw new Error(made.error);
  return made.value;
}

describe('versus roster', () => {
  it('lists the pack’s shinobi by group, strongest first, then its foes', () => {
    const roster = versusRoster(naruto);
    const ids = roster.map((f) => f.id);
    expect(roster[0]?.group).toBe('Kage');
    expect(ids).toEqual(expect.arrayContaining(['person:kakashi', 'person:naruto']));
    expect(ids).not.toContain('person:teuchi');
    expect(roster.find((f) => f.id === 'person:kakashi')?.group).toBe('Jōnin');
    expect(roster.some((f) => f.group === 'Foes')).toBe(true);
    const jonin = roster.filter((f) => f.group === 'Jōnin').map((f) => f.power);
    expect(jonin).toEqual([...jonin].sort((a, b) => b - a));
  });
});

describe('versus bouts', () => {
  it('starts the fight at once, with your fighter as the sandbox’s character', () => {
    const state = bout('person:kakashi', 'person:guy');
    const kakashi = naruto.content.people.require('kakashi');
    expect(state.combat).not.toBeNull();
    expect(state.character.stats).toEqual(kakashi.stats);
    const view = combatScene(state, naruto)!;
    const foe = view.combatants.find((c) => c.side === 'enemy');
    expect(foe?.name).toBe('Might Guy');
    expect(Object.keys(combatScouting(state, naruto))).toEqual([foe?.id]);
  });

  it('can be only watched: both sides fight on their own and the card names who won', () => {
    const made = createVersus(naruto, {
      side: ['person:kakashi'],
      foes: ['person:guy'],
      seed: 7,
      watch: true,
    });
    if (!made.ok) throw new Error(made.error);
    const view = combatScene(made.value, naruto)!;
    expect(view.log[0]).toBe('Kakashi Hatake against Might Guy.');
    expect(view.options.some((o) => o.kind === 'plan' || o.kind === 'escape')).toBe(false);
    const done = fightOut(made.value, naruto);
    const report = done.reports[0];
    expect(report?.kind === 'fight' && report.verdict).toMatch(/^(Kakashi Hatake|Might Guy) wins$/);
  });

  it('fights a team bout on after your fighter falls, until a whole side is down', () => {
    // A green genin beside a jōnin, against two jōnin: the genin falls long before the end.
    const made = createVersus(naruto, {
      side: ['person:konohamaru', 'person:kakashi'],
      foes: ['person:guy', 'person:asuma'],
      seed: 1,
      watch: true,
    });
    if (!made.ok) throw new Error(made.error);
    // Step the bout: once the genin is down, the fight must still be going while Kakashi stands.
    let state: GameState = made.value;
    let foughtOnWithoutYou = false;
    for (let i = 0; i < 300 && state.combat; i++) {
      const view = combatScene(state, naruto)!;
      const you = view.combatants.find((c) => c.id === 'player');
      const friend = view.combatants.find((c) => c.side === 'player' && c.id !== 'player');
      if (you && you.health <= 0 && friend && friend.health > 0) foughtOnWithoutYou = true;
      const next = view.options.find((o) => o.kind === 'continue')!;
      state = act(state, { type: 'combatAct', optionId: next.id }, naruto);
    }
    expect(foughtOnWithoutYou).toBe(true);
  });

  it('is fought on the ground picked, which the screen names', () => {
    const made = createVersus(naruto, {
      side: ['person:kakashi'],
      foes: ['person:guy'],
      seed: 7,
      ground: 'lake',
    });
    if (!made.ok) throw new Error(made.error);
    const view = combatScene(made.value, naruto)!;
    expect(view.prompt).toMatch(/Open water/);
    expect(view.log.join(' ')).not.toMatch(/Open water/);
  });

  it('can face a foe from the pack, or play as one', () => {
    const foe = versusRoster(naruto).find((f) => f.group === 'Foes')!;
    expect(bout('person:kakashi', foe.id).combat).not.toBeNull();
    expect(bout(foe.id, 'person:kakashi').combat).not.toBeNull();
  });

  it('ends on a result card, with nobody hurt for real and nothing learned', () => {
    const start = bout('person:kakashi', 'person:asuma');
    const end = fightOut(start, naruto);
    expect(end.combat).toBeNull();
    expect(end.combatFinale).not.toBeNull();
    expect(end.reports).toHaveLength(1);
    const [report] = end.reports;
    expect(report?.kind).toBe('fight');
    if (report?.kind !== 'fight') return;
    expect(report.enemies).toBe('Asuma Sarutobi');
    expect(report.taught).toBeUndefined();
    expect(end.character.stats).toEqual(start.character.stats);
    expect(end.character.injuries).toEqual(start.character.injuries);
  });

  it('fields a versus-only duelist in their own gear, with their pouch full', () => {
    const tengen = versusRoster(naruto).find((f) => f.id === 'person:tengen');
    expect(tengen?.group).toBe('Jōnin');
    expect(naruto.content.people.get('tengen')).toBeUndefined();
    const state = bout('person:tengen', 'person:kakashi');
    const view = combatScene(state, naruto)!;
    expect(view.combatants.find((c) => c.side === 'player')?.name).toBe('Tengen');
    const as = playerSetup(contenderOf(naruto, 'person:tengen')!, state, naruto);
    expect(as.gear?.held?.name).toBe('Chained Cleavers');
    expect(as.items?.map((i) => [i.id, i.count])).toEqual([
      ['smoke-bomb', 2],
      ['explosive-tag', 4],
    ]);
    expect(as.perks).toContain('foresight');
    expect(as.techniques.map((t) => t.id)).toContain('string-performance');
    expect(fightOut(state, naruto).reports[0]?.kind).toBe('fight');
  });

  it('fields the Water Country’s war: Yagura among the kage, the Mist’s fighters armed as written', () => {
    const roster = versusRoster(naruto);
    expect(roster.find((f) => f.id === 'person:yagura')?.group).toBe('Kage');
    for (const id of ['mei', 'kushimaru', 'mangetsu', 'kasumi-oboro', 'kaguya-sekka']) {
      const contender = contenderOf(naruto, `person:${id}`);
      expect(contender?.kind).toBe('person');
      if (contender?.kind !== 'person') continue;
      const setup = playerSetup(contender, bout(`person:${id}`, 'person:kakashi'), naruto);
      expect(setup.techniques.map((t) => t.id)).toEqual(contender.def.arsenal?.techniqueIds);
    }
    const kushimaru = contenderOf(naruto, 'person:kushimaru');
    const armed =
      kushimaru && playerSetup(kushimaru, bout('person:kushimaru', 'person:jinin'), naruto);
    expect(armed?.gear?.held?.name).toMatch(/Nuibari/);
  });

  it('says where each fighter is from: the Mist’s in Kirigakure, the Sand’s in Sunagakure', () => {
    const roster = versusRoster(naruto);
    const village = (id: string) => roster.find((f) => f.id === `person:${id}`)?.village;
    expect(village('kakashi')).toBe('Konohagakure');
    expect(village('yagura')).toBe('Kirigakure');
    expect(village('gaara')).toBe('Sunagakure');
    expect(village('sasori')).toBe('Sunagakure');
    expect(roster.find((f) => f.id === 'person:temari')?.name).toBe('Temari of the Sands');
  });

  it('fields a puppeteer with their puppets, which unfold out of a scroll and fight', () => {
    const kankuro = contenderOf(naruto, 'person:kankuro')!;
    const state = bout('person:kankuro', 'person:maki');
    const as = playerSetup(kankuro, state, naruto);
    // At the Chūnin Exams, Karasu is his only puppet.
    expect(as.calls?.map((c) => [c.id, c.puppet])).toEqual([['karasu', true]]);
    expect(as.techniques.map((t) => t.id)).toEqual(['chakra-threads', 'unseal-karasu']);
    const watched = createVersus(naruto, {
      side: ['person:kankuro'],
      foes: ['person:maki'],
      seed: 1,
      watch: true,
    });
    if (!watched.ok) throw new Error(watched.error);
    const done = fightOut(watched.value, naruto);
    expect(done.reports[0]?.kind).toBe('fight');
    // The story keeps only its last lines (`LOG_LIMIT`): by the end, Crow is out and fighting.
    expect(done.combatFinale?.log.join(' ')).toMatch(/Crow lands its Hidden Blades/);
  });

  it('fields a summoner with the toads, who calls them and meditates into Sage Mode', () => {
    const jiraiya = contenderOf(naruto, 'person:jiraiya')!;
    const as = playerSetup(jiraiya, bout('person:jiraiya', 'person:kisame'), naruto);
    expect(as.calls?.map((c) => c.id)).toEqual(
      expect.arrayContaining(['gamabunta', 'fukasaku', 'shima']),
    );
    const watched = createVersus(naruto, {
      side: ['person:jiraiya'],
      foes: ['person:kisame'],
      seed: 2,
      watch: true,
    });
    if (!watched.ok) throw new Error(watched.error);
    let state = watched.value;
    const told: string[] = [];
    for (let i = 0; i < 40 && state.combat; i++) {
      told.push(...combatScene(state, naruto)!.log);
      state = act(state, { type: 'combatAct', optionId: 'round' }, naruto);
    }
    const story = [...told, ...(state.combatFinale?.log ?? [])].join(' ');
    expect(story).toMatch(/Gamabunta answers the call/);
    expect(story).toMatch(/Fukasaku perches on Jiraiya’s shoulder/);
    expect(story).toMatch(/Natural energy floods into Jiraiya/);
  });

  it('refuses a pick the pack doesn’t have', () => {
    const made = createVersus(naruto, { side: ['person:nobody'], foes: ['person:guy'], seed: 1 });
    expect(made.ok).toBe(false);
  });
});

describe('versus team fights', () => {
  const team7 = ['person:kakashi', 'person:naruto', 'person:sasuke', 'person:sakura'];

  it('fields up to four a side, your allies under your orders', () => {
    const state = team(team7, ['enemy:zabuza', 'enemy:haku']);
    const view = combatScene(state, naruto)!;
    const ours = view.combatants.filter((c) => c.side === 'player');
    const theirs = view.combatants.filter((c) => c.side === 'enemy');
    expect(ours.map((c) => c.name)).toEqual(['Kakashi', 'Naruto', 'Sasuke', 'Sakura']);
    expect(theirs.map((c) => c.name)).toEqual(['Zabuza Momochi', 'Haku']);
    expect(view.options.some((o) => o.kind === 'order')).toBe(true);
    expect(state.versus?.foeName).toBe('Zabuza Momochi and Haku');
  });

  it('numbers a foe that stands more than once', () => {
    const state = team(['person:kakashi'], ['enemy:gozu', 'enemy:gozu']);
    const ids = combatScene(state, naruto)!
      .combatants.filter((c) => c.side === 'enemy')
      .map((c) => c.id);
    expect(new Set(ids).size).toBe(2);
  });

  it('refuses a person twice on one side, or a side of more than four', () => {
    const twice = createVersus(naruto, {
      side: ['person:kakashi', 'person:kakashi'],
      foes: ['person:guy'],
      seed: 1,
    });
    expect(twice).toEqual({ ok: false, error: 'Kakashi Hatake can’t stand twice on one side.' });
    const crowd = createVersus(naruto, {
      side: [...team7, 'person:guy'],
      foes: ['person:asuma'],
      seed: 1,
    });
    expect(crowd.ok).toBe(false);
  });

  it('plays a team bout to its result card', () => {
    const end = fightOut(team(team7, ['enemy:zabuza', 'enemy:haku']), naruto);
    expect(end.combat).toBeNull();
    expect(end.reports[0]?.kind).toBe('fight');
  });
});

describe('rules on trial', () => {
  /** Lines in a watched bout (Konohamaru against Neji, unless named) that tell a rule on trial. */
  function linesIn(
    pick: { handSigns?: boolean; teleport?: boolean; farGap?: boolean; start?: 'far' },
    marker: string,
    who: { side: string; foe: string } = { side: 'person:konohamaru', foe: 'person:neji' },
  ): number {
    let found = 0;
    for (let seed = 1; seed <= 3; seed++) {
      const made = createVersus(naruto, {
        side: [who.side],
        foes: [who.foe],
        seed,
        watch: true,
        ...pick,
      });
      if (!made.ok) throw new Error(made.error);
      let state: GameState = made.value;
      for (let i = 0; i < 200 && state.combat; i++) {
        const view = combatScene(state, naruto)!;
        found += view.log.filter((line) => line.includes(marker)).length;
        const next = view.options.find((o) => !o.disabledReason && o.id !== 'flee');
        if (!next) break;
        state = act(state, { type: 'combatAct', optionId: next.id }, naruto);
      }
      if (found > 0) return found;
    }
    return found;
  }

  it('hand signs break only in a bout that turns them on; rushing in is in every bout', () => {
    // A caster who reads the fight keeps clear of a crowder (`crowding.ts`); Naruto casts anyway.
    const crowded = { side: 'person:kiba', foe: 'person:naruto' };
    expect(linesIn({ handSigns: true }, 'before the seals are done', crowded)).toBeGreaterThan(0);
    expect(linesIn({}, 'before the seals are done', crowded)).toBe(0);
    expect(linesIn({}, 'before the seals are done')).toBe(0);
    expect(linesIn({}, 'as he lands')).toBeGreaterThan(0);
  });

  it('the Flying Thunder God takes no turn only in a bout that turns it on', () => {
    const who = { side: 'person:minato', foe: 'person:asuma' };
    expect(linesIn({ teleport: true }, 'vanishes and is', who)).toBeGreaterThan(0);
    expect(linesIn({}, 'vanishes and is', who)).toBe(0);
  });

  it('a bout starts where it is set to, and the far gap is long only when turned on', () => {
    expect(linesIn({ start: 'far' }, 'It starts at a distance.')).toBeGreaterThan(0);
    expect(linesIn({}, 'It starts at a distance.')).toBe(0);
    const marksman = { side: 'person:tenten', foe: 'person:lee' };
    expect(linesIn({ start: 'far' }, 'time for another', marksman)).toBe(0);
    expect(linesIn({ start: 'far', farGap: true }, 'time for another', marksman)).toBeGreaterThan(
      0,
    );
  });
});
