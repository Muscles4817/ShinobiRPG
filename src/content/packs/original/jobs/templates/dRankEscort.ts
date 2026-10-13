import type { MissionTemplate } from '../../../../missionTemplates';

/**
 * The escort: the first job that is a journey (three days out and one home), built on the
 * whole of a mission's story (`docs/design/missions-plan.md`, the Pilgrim Nun). You look after
 * someone whose trust you earn or lose by how you speak to them; the road brings what it
 * brings; the trouble on the second day can cost the light and force a choice at dusk; by the
 * fire they may tell you why they travel; the robbers ahead may be desperate men; and how it
 * ends follows from all of it.
 */
export const D_RANK_ESCORT: readonly MissionTemplate[] = [
  {
    id: 'd-short-escort',
    rank: 'D',
    slots: 1,
    energyCost: 30,
    reward: { ryo: 420, reputation: 6 },
    minMissionsCompleted: 2,
    placeholders: {
      title: 'the job’s title, e.g. The Bride’s Chest',
      client: 'who hires you, e.g. the Matsuda household',
      charge: 'who or what you guard, mid-sentence, e.g. a bride’s dowry chest and its porter',
      chargeName: 'the one you look after, by name, e.g. Sister Kohaku',
      storyKey:
        'a short id for what this job leaves behind, e.g. kohaku: the village remembers "kohaku-spared" and "kohaku-trusted"',
      likes:
        'a tone the charge warms to: praise, challenge, joke, earnest, kind, tease, curious or quiet',
      alsoLikes: 'another tone the charge warms to',
      dislikes: 'a tone the charge bristles at',
      destination: 'where to, mid-sentence, e.g. the hill village of Kayano',
      region: 'the kind of road: hill-road, river-road, coast-road, forest-track or mountain-pass',
      greeting: 'a sentence: the charge’s first words to you, in their voice',
      warmReply: 'a sentence: what the charge does when you answer warmly',
      businessReply: 'a sentence: what the charge does when you keep it to business',
      jokeReply: 'a sentence: what the charge does when you make a joke of it',
      chatter: 'a sentence: the first day of the road, and the charge’s character',
      fuss: 'a sentence: the charge causes trouble on the second day',
      fussSettled: 'a sentence: you settle the trouble and keep moving',
      fussCostly: 'a sentence: the trouble costs you the light',
      camp: 'a sentence: where you make camp, and the night',
      confidence:
        'a sentence: what the charge tells you by the fire once they trust you, and why this journey matters',
      guarded: 'a sentence: how the charge turns the talk aside when they don’t trust you yet',
      lastDay: 'a sentence: the last morning’s road, nearly there',
      desperate:
        'a sentence: the robbers ahead are hungry, not wicked; one of them is barely more than a child',
      spared: 'a sentence: you talk the hungry robbers out of it, and what they do',
      ambush: 'a sentence: the place on the road where robbers wait',
      foe: 'an enemy id: a D-rank bandit, such as bandit-thug',
      lookout: 'an enemy id: a second D-rank bandit, such as bandit-archer',
      slipped: 'a sentence: you lead the charge round the robbers unseen',
      hurt: 'a sentence: arrival, the charge hurt in the fight because they didn’t trust you to keep them safe',
      trusted:
        'a sentence: arrival, the charge trusting you, and the moment they share with you because you know why they came',
      ending: 'a sentence: arrival, and what the charge says or does',
    },
    title: '{title}',
    client: '{client}',
    summary: 'See {charge} safely to {destination}. The road has a bad name lately.',
    threads: [
      {
        id: 'trust',
        label: '{chargeName}’s trust',
        levels: ['Doubtful', 'Polite', 'At ease', 'Trusts you'],
        start: 1,
      },
      {
        id: 'daylight',
        label: 'Daylight',
        levels: ['Dark', 'Dusk', 'Afternoon', 'Morning'],
        start: 3,
      },
    ],
    charge: {
      name: '{chargeName}',
      thread: 'trust',
      likes: ['{likes}', '{alsoLikes}'],
      dislikes: ['{dislikes}'],
    },
    twists: [
      { mark: 'desperate-men', weight: 1 },
      { mark: 'plain-robbers', weight: 2 },
    ],
    stages: [
      {
        kind: 'decision',
        text: '{greeting}',
        options: [
          { label: 'Answer warmly', tone: 'kind', reply: '{warmReply}' },
          { label: 'Keep it to business', tone: 'earnest', reply: '{businessReply}' },
          { label: 'Make a joke of it', tone: 'joke', reply: '{jokeReply}' },
        ],
      },
      { kind: 'leg', text: '{chatter}', days: 1, region: '{region}' },
      {
        kind: 'check',
        text: '{fuss}',
        approaches: [
          {
            label: 'Keep your patience',
            stat: 'willpower',
            difficulty: 8,
            onSuccess: {
              effects: [{ kind: 'thread', thread: 'trust', by: 1 }],
              ledger: 'Kept your patience with {chargeName}, and they noticed.',
            },
            onFailure: {
              effects: [{ kind: 'thread', thread: 'daylight', by: -2 }],
              ledger: 'The trouble on the road cost the light.',
            },
          },
          {
            label: 'Find a clever fix',
            stat: 'intellect',
            difficulty: 8,
            onFailure: {
              effects: [{ kind: 'thread', thread: 'daylight', by: -2 }],
              ledger: 'The trouble on the road cost the light.',
            },
          },
          {
            label: 'Do the heavy work yourself',
            stat: 'strength',
            difficulty: 9,
            onFailure: {
              effects: [{ kind: 'thread', thread: 'daylight', by: -2 }],
              ledger: 'The trouble on the road cost the light.',
            },
          },
        ],
        success: '{fussSettled}',
        failure: '{fussCostly}',
        onFailure: 'forward',
      },
      {
        kind: 'decision',
        when: { thread: 'daylight', below: 2 },
        text: 'The light is going, and the road ahead is narrow and unfamiliar.',
        options: [
          {
            label: 'Push on in the dark',
            tone: 'challenge',
            reply: 'You light a single lantern and go on, {chargeName} stumbling at your heels.',
            effects: [{ kind: 'mark', mark: 'night-road' }],
            ledger: 'Pushed on through the dark instead of making camp.',
          },
          {
            label: 'Make camp where you are',
            tone: 'quiet',
            reply: 'You find a hollow out of the wind and make the best of it.',
          },
        ],
      },
      {
        kind: 'camp',
        when: { lacks: 'night-road' },
        text: '{camp}',
        picks: 2,
        activities: [
          {
            kind: 'charge',
            label: 'Sit with {chargeName}',
            text: '{confidence}',
            guarded: '{guarded}',
            opensWhen: { thread: 'trust', atLeast: 2 },
            outcome: {
              effects: [
                { kind: 'mark', mark: 'knows-why' },
                { kind: 'thread', thread: 'trust', by: 1 },
              ],
              ledger: 'Heard why {chargeName} makes this journey.',
            },
          },
          { kind: 'crew', label: 'Sit with your crew', when: { crew: 'team' } },
          {
            kind: 'watch',
            label: 'Take first watch',
            stat: 'perception',
            difficulty: 8,
            role: 'tracker',
            success:
              'Late in the watch you see a figure on the rocks ahead, gone when you look again.',
            failure: 'Nothing but wind in the grass, all night long.',
            onSuccess: {
              effects: [{ kind: 'mark', mark: 'saw-scouts' }],
              ledger: 'Spotted their lookout the night before.',
            },
          },
          { kind: 'drill', label: 'Drill by the fire' },
          { kind: 'rest', label: 'Sleep properly' },
        ],
      },
      { kind: 'leg', text: '{lastDay}', days: 1 },
      {
        kind: 'decision',
        when: { has: 'desperate-men' },
        text: '{desperate}',
        options: [
          {
            label: 'Talk them out of it',
            tone: 'kind',
            reply: '{spared}',
            effects: [
              { kind: 'mark', mark: 'spared' },
              { kind: 'world', mark: '{storyKey}-spared' },
            ],
            ledger: 'Talked hungry men out of a robbery.',
          },
          {
            label: 'Treat them as the robbers they are',
            tone: 'challenge',
            reply: 'You step into the road and let them see you mean it.',
          },
        ],
      },
      {
        kind: 'encounter',
        when: { lacks: 'spared' },
        template: 'bandit-camp',
        job: 'escort',
        text: '{ambush}',
        enemyIds: ['{foe}', '{lookout}'],
        canFlee: false,
        flavour: { slipped: '{slipped}' },
      },
      {
        kind: 'ending',
        endings: [
          {
            when: { all: [{ has: 'fought-past' }, { thread: 'trust', below: 2 }] },
            text: '{hurt}',
            effects: [{ kind: 'pay', share: -0.4 }],
            ledger: '{chargeName} bolted when the fighting started, and was hurt.',
          },
          {
            when: { all: [{ has: 'knows-why' }, { thread: 'trust', atLeast: 3 }] },
            text: '{trusted}',
            effects: [
              { kind: 'pay', share: 0.2 },
              { kind: 'world', mark: '{storyKey}-trusted' },
              { kind: 'memory', text: 'the road with {chargeName}' },
            ],
            ledger: '{chargeName} pressed a gift on you at the end of the road.',
          },
          { text: '{ending}' },
        ],
      },
      { kind: 'leg', text: 'The road home is quiet, and shorter than the road out.', days: 1 },
    ],
  },
];
