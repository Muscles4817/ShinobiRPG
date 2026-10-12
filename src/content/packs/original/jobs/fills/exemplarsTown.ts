import type { MissionFill } from '../../../../missionTemplates';

/** The first fill of each chore and in-town D-rank template: the pattern later fills follow. */
export const EXEMPLARS_TOWN: readonly MissionFill[] = [
  {
    id: 'ferryman-heron',
    templateId: 'd-lost-animal',
    values: {
      title: 'The Ferryman’s Heron',
      client: 'Ferryman Gonta',
      animal: 'a grey heron called Admiral',
      plea: 'Gonta wrings his straw hat. “He rides the prow and calls the fish. Without him the boat feels like a coffin. He likes shiny things, and he hates dogs.”',
      trail:
        'A trail of stolen lantern tassels leads off the jetty, one glinting in the canal weed, another snagged on a washing line.',
      caught:
        'You find Admiral on a temple roof, guarding a hoard of tassels and a spoon. He lets himself be carried, glaring the whole way.',
      chase:
        'Admiral leads you over half the rooftops in the Lantern District, then strolls down to the jetty on his own as if nothing happened.',
      ending:
        'Gonta laughs aloud and the heron hops back onto the prow. The ferry puts out with Admiral calling the fish, a tassel still in his beak.',
    },
  },
  {
    id: 'dredging-lantern-canal',
    templateId: 'd-hard-graft',
    values: {
      title: 'Dredging the Lantern Canal',
      client: 'The Canal Wardens',
      task: 'dredge the silted lantern canal before the floating lanterns go out on it',
      setup:
        'A warden in waders hands you a rake twice your height. The canal is a ribbon of black mud, and the floating lanterns have nowhere to float.',
      labour:
        'The silt is knee-deep and sucks at every step. Each rake-load weighs as much as you do.',
      twist:
        'Your rake catches on something under the mud: a lacquered box, sealed with an old Tōkaku mark, cold enough to sting.',
      twistHandled:
        'You leave the seal be and carry the box to the wardens unopened. A Tōkaku elder collects it within the hour and thanks you very gravely.',
      twistBotched:
        'You prise the lid up an inch. A breath of cold rushes out and the lanterns along the bank gutter. The wardens make you stand in the mud while a priest is fetched.',
      ending:
        'By dusk the water runs clear. The first floating lantern drifts past you, bobbing, and an old woman on the bank bows to it.',
    },
  },
  {
    id: 'ink-for-the-archive',
    templateId: 'd-courier',
    values: {
      title: 'Ink for the Archive',
      client: 'Ink-seller Mabuchi',
      parcel: 'a crate of lamp-black ink, wet-sealed and very fragile',
      recipient: 'the archivists at the Lantern Archive',
      route:
        'The archive stands at the top of the long stair, and today the stair is crowded with pilgrims climbing to the shrine.',
      routeWon: 'You take the crate over the rooftops and arrive with not a drop spilled.',
      routeLost:
        'A pilgrim’s elbow catches the crate. You arrive with ink to the wrist and one jar cracked.',
      doorstep:
        'The head archivist will not sign until every jar has been held to the light and smelled, and she disapproves of your fingerprints.',
      ending:
        'Mabuchi’s ink is already on a brush by the time you leave. The archivist gives you a sheet of the first copy, still wet, of an old map of the village.',
    },
  },
  {
    id: 'lamplighters-boy',
    templateId: 'd-missing-person',
    values: {
      title: 'The Lamplighter’s Boy',
      client: 'Lamplighter Oume',
      person: 'Oume’s son Tobi',
      worry:
        '“He swore he’d seen his grandfather’s ghost by the old wall,” Oume says. “I told him not to be stupid. Then he didn’t come home.”',
      rumour:
        'The children on the lane go quiet when you ask. One of them keeps glancing at the gap in the old wall.',
      lead: 'A girl finally whispers that Tobi went through the gap with a lantern, to light it for his grandfather.',
      deadEnd:
        'You lose the afternoon to shrugs and made-up stories before a girl whispers that Tobi went through the gap with a lantern.',
      search:
        'Beyond the gap the old wall runs into the ruined watch-houses, all broken stairs and roofs that sag underfoot.',
      found:
        'Tobi is asleep in a watch-tower, curled round a burnt-out lantern. He says his grandfather sat with him until it went out.',
      ending:
        'Oume holds her son so hard he squeaks. That night a new lantern hangs on the old wall, and nobody in the family says who lit it.',
    },
  },
  {
    id: 'kite-day-stewards',
    templateId: 'd-festival-trouble',
    values: {
      title: 'Stewards for Kite Day',
      client: 'The Kite Day Committee',
      festival: 'Kite Day on the lake shore',
      setup:
        'The shore is a sea of children, string and sweet stalls. Overhead a hundred kites fight for the same patch of wind.',
      crush:
        'The great dragon kite comes down on the crowd, and everyone runs from it at once, straight towards the water.',
      mischief:
        'Kites are snapping loose all along the shore, and every cut string has been cut clean.',
      mischiefStopped:
        'You catch a boy with a sharpened shuriken and a pocketful of other children’s spools. He wanted a kite of his own and has none.',
      mischiefMissed:
        'By the time you catch the boy with the sharpened shuriken, a dozen kites are drifting out over the lake.',
      ending:
        'At sunset the dragon kite goes up again, mended, with the boy holding the string beside its maker. The whole shore cheers.',
    },
  },
  {
    id: 'dyers-wall',
    templateId: 'd-quarrel',
    values: {
      title: 'The Dyers’ Wall',
      client: 'Ward Elder Kinu',
      parties: 'two dyers who share a drying wall on Indigo Row',
      quarrel:
        'Old Fuji says his neighbour’s crimson bled onto his indigo. The neighbour, Haru, says Fuji moved the wall in the night. Both are holding wet cloth like weapons.',
      clue: 'The bottom stones of the wall are newer than the top, and there is a pale stripe of unbleached ground beside them.',
      truth:
        'The wall was moved, but by the landlord, who wanted to rent a third strip of it. Both dyers turn their fury on him together.',
      muddle:
        'You cannot prove anything, so you draw a chalk line down the middle of the wall. Neither of them speaks to you again.',
      ending:
        'By the next week the wall is purple at the join, and the two old men sell it as a new colour, splitting the takings.',
    },
  },
  {
    id: 'well-rope',
    templateId: 'd-small-rite',
    values: {
      title: 'Retying the Well Rope',
      client: 'Shimenawa Elder Tsuzuri',
      rite: 'the yearly retying of the sacred rope round the old plague well',
      setup:
        'The old rope is black with age and hums when you touch it. “It has held a sickness down there for a century,” Tsuzuri says. “Don’t let go.”',
      binding:
        'The new rope must be knotted in one pass, with chakra fed into every twist, while the old one is cut away.',
      bound:
        'The last knot closes and the hum moves from the old rope to the new, steady as a heartbeat under your palm.',
      frayed:
        'Your knot slips, and for one breath the well is unbound. Tsuzuri’s hands close over yours and finish it.',
      pull: 'Something in the well breathes up at you, and for a moment you want very much to look over the edge.',
      ending:
        'The old rope is burned at the shrine. Women come to draw water again for the first time in a week, and one of them leaves a rice ball on the well’s lid.',
    },
  },
];
