import type { MissionDef } from '@/systems/missions';

/**
 * The Sand's old wounds as work: a Leaf face among the Hatake widows, a broken hound turned on
 * its breaker, and the taint coming in from the belt to the outer wells.
 */
const TAINTED_TERRAIN =
  'Grey sand has drifted glittering against the well-stones. The camels won’t go within a hundred paces of it.';

export const SUNA_HARD_JOBS: readonly MissionDef[] = [
  {
    id: 'suna-chalk-on-the-wall',
    title: 'Chalk on the Wall',
    rank: 'C',
    client: 'Kiyose, clerk of the Envoy’s Office',
    summary:
      'Someone chalks the name Hatake on the Envoy’s Office door every night. Kiyose would like a foreigner to find out who.',
    slots: 2,
    energyCost: 20,
    reward: { ryo: 300, reputation: 6 },
    minMissionsCompleted: 4,
    once: true,
    stages: [
      {
        kind: 'narrative',
        text: 'The chalk says HATAKE, and under it a tally of strokes, longer every night. Kiyose watches you read it and says nothing at all.',
      },
      {
        kind: 'check',
        text: 'You wait across the street in the dark. Near dawn, a figure in black comes up the street with a stick of chalk.',
        approaches: [
          { label: 'Follow them home without being seen', stat: 'speed', difficulty: 11 },
          { label: 'Read the strokes before they finish', stat: 'intellect', difficulty: 11 },
        ],
        success:
          'It is Oyone, who sells spice on the Row. The strokes are the dead of one winter, one for each, and she has nearly finished counting.',
        failure:
          'She sees you watching. She finishes her stroke anyway, looks straight at you, and walks home.',
        onFailure: 'forward',
      },
      {
        kind: 'decision',
        text: 'Oyone stands with the chalk in her hand. “He killed my husband and my sons in one winter,” she says. “Your village gave him a medal for it. What do you want?”',
        options: [
          {
            label: 'Tell her you are sorry, and mean it',
            tone: 'kind',
            reply:
              'She looks at you for a long time. Then she gives you the chalk, and goes home without finishing the count.',
            effects: [{ kind: 'mark', mark: 'sorry' }],
            ledger: 'Said sorry for the Leaf, and meant it.',
          },
          {
            label: 'Tell her it was a war, and both sides bled',
            tone: 'earnest',
            reply:
              '“Both sides,” she says. She laughs, and it isn’t a laugh. She finishes the count in front of you.',
            ledger: 'Told a widow it was a war.',
          },
          {
            label: 'Leave her to it and tell Kiyose nothing',
            tone: 'quiet',
            reply:
              'You walk away and leave her to it. In the morning the tally is finished, and nobody chalks the door again.',
            ledger: 'Let the widow finish her count.',
          },
        ],
      },
      {
        kind: 'ending',
        endings: [
          {
            when: { has: 'sorry' },
            text: 'The door stays clean. Kiyose pays you in full, and for the first time he hands the coins over instead of leaving them on the desk.',
            effects: [{ kind: 'memory', text: 'a widow’s chalk in your hand' }],
            ledger: 'The chalk stopped.',
          },
          {
            text: 'Kiyose scrubs the door himself. He pays you, and doesn’t ask what you said to her.',
            effects: [{ kind: 'memory', text: 'the name chalked on the Envoy’s door' }],
            ledger: 'Found who chalked the door.',
          },
        ],
      },
    ],
  },
  {
    id: 'suna-broken-hound',
    title: 'The Hound That Waited',
    rank: 'C',
    client: 'Gōzan, master of the Breaking Pens',
    summary:
      'A broken hound turned on its breaker last night and is loose in the dry wash behind the Pens. Gōzan wants it brought back. Dead will do.',
    slots: 3,
    energyCost: 25,
    reward: { ryo: 340, reputation: 6 },
    minMissionsCompleted: 4,
    once: true,
    stages: [
      {
        kind: 'narrative',
        text: 'The breaker it bit is in the Poison Ward with a torn arm. Gōzan says it was the best of the litter. It took every order for two years, he says. All that time it was waiting.',
      },
      {
        kind: 'check',
        text: 'The dry wash runs a mile into the rocks, and somewhere in it a hound is lying very still.',
        approaches: [
          {
            label: 'Track it over the stones',
            stat: 'perception',
            difficulty: 11,
            role: 'tracker',
          },
          { label: 'Sit in the open and let it come to you', stat: 'willpower', difficulty: 12 },
        ],
        success:
          'It is lying in the shade of an overhang with its collar half chewed through, watching you with its head on its paws.',
        failure:
          'You find it when it finds you, from behind, and it is a near thing for an arm before it backs off to watch you.',
        onFailure: 'forward',
        failureDamage: 3,
      },
      {
        kind: 'decision',
        text: 'The hound looks at you, and you can see it thinking. That is the whole of what is wrong with it, in the Sand.',
        options: [
          {
            label: 'Take its collar off and let it go into the desert',
            tone: 'kind',
            reply:
              'It sniffs your hand once and trots off up the wash without looking back. Gōzan will not be pleased.',
            effects: [{ kind: 'mark', mark: 'freed' }],
            ledger: 'Let the hound go free into the desert.',
          },
          {
            label: 'Bring it back to the Pens on a rope',
            tone: 'earnest',
            reply: 'It comes quietly, which is somehow worse. It watches Gōzan the whole way in.',
            ledger: 'Brought the hound back to the Pens.',
          },
          {
            label: 'Do what Gōzan asked, as kindly as it can be done',
            tone: 'quiet',
            reply: 'It is quick. You bury it under the overhang, where it chose to lie.',
            ledger: 'Put the hound down for the Pens.',
          },
        ],
      },
      {
        kind: 'ending',
        endings: [
          {
            when: { has: 'freed' },
            text: 'Gōzan pays you half and spits. Weeks later, the caravan men say a lone hound runs beside them across the outer sands, and never comes close.',
            effects: [{ kind: 'memory', text: 'a hound loose in the dry wash' }],
            ledger: 'Freed a hound the Sand would have put down.',
          },
          {
            text: 'Gōzan pays you and goes back to his pens. The rest of the litter watch him a little more carefully now.',
            effects: [{ kind: 'memory', text: 'a hound that waited two years' }],
            ledger: 'Settled the matter of the hound that waited.',
          },
        ],
      },
    ],
  },
  {
    id: 'suna-outer-wells',
    title: 'Grey Sand at the Outer Wells',
    rank: 'B',
    client: 'The Priests’ Yards',
    summary:
      'A beast of the belt has come in to the outer wells, and the sand around them has gone grey. The priests have asked the Envoy’s Office for help, which they have never done before.',
    slots: 3,
    energyCost: 35,
    reward: { ryo: 860, reputation: 12 },
    minMissionsCompleted: 10,
    once: true,
    stages: [
      {
        kind: 'narrative',
        text: 'The outer wells are the first water a caravan reaches, half a day out. Kōro of the Dunes meets you at the wall and walks out with you, a step behind, the way the priests walk with anyone from inside.',
      },
      {
        kind: 'check',
        text: 'The grey runs from the wells back towards the belt in a trail as wide as a road, and in the middle of it the sand moves on its own.',
        approaches: [
          { label: 'Read where it will come up', stat: 'perception', difficulty: 13 },
          { label: 'Ask Kōro to still the sand around it', stat: 'chakraControl', difficulty: 13 },
        ],
        success: 'You are ready when it rises. It is not ready for you.',
        failure: 'It comes up under you, and the first you know of it is the sting.',
        onFailure: 'forward',
        failureDamage: 4,
      },
      {
        kind: 'encounter',
        ground: 'arena',
        template: 'beast',
        job: 'eliminate',
        text: 'A tainted scorpion as big as a barge’s cabin comes up out of the grey sand between the wells, and behind it a shape of blown sand that walks like a person.',
        enemyIds: ['tainted-scorpion', 'sand-wraith'],
        flavour: { terrain: TAINTED_TERRAIN },
        canFlee: true,
        bypassable: false,
      },
      {
        kind: 'ending',
        endings: [
          {
            text: 'Kōro chants over the wells until the grey goes gold again. On the way back he walks beside you instead of behind, and nobody on the wall says anything about it.',
            effects: [{ kind: 'memory', text: 'walking back from the outer wells with a priest' }],
            ledger: 'Cleared the taint from the outer wells.',
          },
        ],
      },
    ],
  },
];
