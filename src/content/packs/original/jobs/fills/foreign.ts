import type { MissionFill } from '../../../../missionTemplates';

/**
 * Jobs against the shinobi of other villages (`shinobiVillages.ts`) and their missing-nin: a
 * Squall scout on the coast, an Ashfield squad over the line, a Dune chūnin minding a ring,
 * two missing-nin hunted down, and a Squall captain who needs a jōnin.
 */
export const FOREIGN_FILLS: readonly MissionFill[] = [
  {
    id: 'the-squall-scout',
    templateId: 'c-team-border-sweep',
    minMissionsCompleted: 6,
    values: {
      title: 'The Squall Scout',
      client: 'The Harbour Office',
      border:
        'the headlands south of Port Shiomachi, where boats from over the sea put in at night',
      orders:
        '“Somebody is counting our watchtowers from the water,” your sensei reads. “Find out who. Bring them in if you can.”',
      march:
        'The cliff path is half washed away, the wind off the sea leans on you the whole way, and the spray soaks you to the skin.',
      trace:
        'In a cove below the third tower there is a keel mark in the shingle, and a fire laid inside a ring of stones and never lit.',
      stranger:
        'A shinobi in a salt-stiff headband is lying flat on the rocks above the cove with a spyglass and a tally of the towers drawn on oilcloth.',
      foe: 'foe-arashigakure-scout-genin',
      parley:
        'They hand over the oilcloth. “We heard your coast was empty,” they say. “It isn’t. I’ll tell them so.”',
      ending:
        'The Harbour Office sends the scout home on the next boat with the tally torn in half. Your sensei keeps the other half, and writes to someone across the sea.',
    },
  },
  {
    id: 'the-survey-squad',
    templateId: 'c-team-raid',
    minMissionsCompleted: 8,
    values: {
      title: 'The Survey Squad',
      client: 'The Border Watch',
      hideout: 'a charcoal-burners’ hut in the Ash Wood, inside our side of the line',
      loot: 'the Border Watch’s survey of the passes, taken from a courier on the road',
      briefing:
        'Your sensei unrolls a sketch of the hut. “Three of them, Ashfield genin, a squad sent to bring home our survey. Nobody is to die over a map.”',
      count:
        'You watch the hut from the trees until dusk: a captain giving orders, a scout coming and going, and someone washing a cut by the door.',
      plan: 'The scout will be back within the hour. The team must agree on a way in before then.',
      guards:
        'The captain sits at the table with the survey spread under a lamp, the medic beside them, and the scout leaning in the doorway.',
      foe: 'foe-ashfield-captain-genin',
      second: 'foe-ashfield-scout-genin',
      third: 'foe-ashfield-medic-genin',
      slipped:
        'You come in through the charcoal shed while the scout is out, and the survey is gone from under the lamp before the captain looks up.',
      ending:
        'The survey goes back to the Border Watch unread. The Ashfield squad goes home empty-handed, and your sensei says that was the kindest thing anyone did for them all year.',
    },
  },
  {
    id: 'the-dune-seals',
    templateId: 'b-smuggling-ring',
    minMissionsCompleted: 12,
    values: {
      title: 'The Dune Seals',
      client: 'The Kiri Ford Toll-House',
      contraband: 'sealing paper, ours, sold to the dune caravans by the bale',
      route: 'through the toll-house at Kiri Ford, under the bills for rice paper',
      papers:
        'The toll-house bills are all rice paper, and rice paper weighs nothing. The carts that carry it sink to their axles in the ford.',
      papersRead:
        'Every heavy cart is signed through by the same night clerk, and every one is met on the far bank by a camel train.',
      papersBlind:
        'The bills are too neat to argue with. When you leave the toll-house, a camel driver you have never seen is watching your door.',
      cover:
        'The caravan camp outside the ford is closed to anyone who doesn’t speak the slow speech of the dunes.',
      den: 'In the caravan’s stores the seal paper is stacked in bales. A Dune chūnin keeps watch with tags of their own, and the caravan’s boss minds the dog.',
      foe: 'foe-sakyugakure-trapper-chunin',
      second: 'smuggler-boss',
      ending:
        'The bales go back to the village, and the night clerk goes with them. The caravan’s ledgers name a buyer in Sakyūgakure who, it turns out, is a village office.',
    },
  },
  {
    id: 'rokusho-of-the-ash-road',
    templateId: 'b-rogue-hunt',
    minMissionsCompleted: 12,
    values: {
      title: 'Rokushō of the Ash Road',
      client: 'The Tōrokage’s Office',
      quarry: 'Rokushō, an Ashfield trapper gone rogue, who has mined the ash road for tolls',
      dossier:
        'The file says Rokushō left the Ashfield with their village’s maps of the border passes. It does not say why their village has never asked for them back.',
      trail:
        'The trail is the ash road itself: carts stopped and carters paying, with nobody willing to say who to.',
      trap: 'Halfway up the road the ash has been raked smooth over a stretch, and a single paper tag flutters in a tree, as if someone wanted you to see it.',
      cornered:
        'Rokushō is waiting at the top of the pass on a stone, a tag between two fingers. “You walked round all of them,” they say. “Good. I hate it when they don’t.”',
      foe: 'rogue-ashfield-trapper-chunin',
      parley:
        'Rokushō lets the tag drop, unlit. “Their maps are under the third milestone. I only kept them because nobody else wanted the passes known.”',
      ending:
        'The maps come home, and the ash road is cleared tag by tag. The Ashfield never writes to thank anyone, which tells your sensei a great deal.',
    },
  },
  {
    id: 'karasu-of-the-red-dunes',
    templateId: 'b-rogue-hunt',
    minMissionsCompleted: 14,
    values: {
      title: 'Karasu of the Red Dunes',
      client: 'The Tōrokage’s Office',
      quarry: 'Karasu of the Red Dunes, a Sakyūgakure medic who sells healing at a price',
      dossier:
        'Karasu kept a Dune squad alive through the border war and left with every one of their debts. The file lists who still pays, and leaves out who stopped.',
      trail:
        'The trail goes from sickroom to sickroom through the caravan towns, and nobody in any of them will say a word against the one who saved them.',
      trap: 'At the last oasis the well rope has been cut, and the water in the trough beside it smells faintly of plum blossom in a place where no plum grows.',
      cornered:
        'Karasu is washing their hands in a basin in a tent full of sleeping caravan hands. “They’ll wake in an hour,” they say. “We have that long.”',
      foe: 'rogue-sakyugakure-medic-chunin',
      parley:
        'Karasu dries their hands. “Take me in. Their debts end with me, and they don’t know that yet. Tell them, will you?”',
      ending:
        'You bring Karasu in, and the caravan towns stop paying. Some are glad. One old drover asks where to send the money now, and nobody has an answer.',
    },
  },
  {
    id: 'ikazuchi-of-the-squalls',
    templateId: 's-hunt',
    minMissionsCompleted: 22,
    values: {
      title: 'Ikazuchi of the Squalls',
      client: 'The Tōrokage’s Office',
      quarry:
        'Ikazuchi, a captain of the Village Hidden in the Squalls who went rogue with their squad',
      briefing:
        'Ikazuchi lost a squad on an order they argued against, and has been finding the people who gave it, across the Southern Sea and now on our coast. One of them lives in Port Shiomachi under another name. The Tōrokage wants Ikazuchi stopped here, and quietly.',
      trail:
        'The trail is weather: storms on clear nights along the coast road, each one a little nearer the port.',
      found:
        'You find the storm before it finds the port: a sloop anchored in a sea cave, its crew asleep, and a lamp in the stern cabin.',
      cold: 'You find the sea cave, but the sloop is already at the mouth of it with its sail up. They knew.',
      lair: 'Ikazuchi stands in the stern with the sky darkening behind them, and the last of their squad, a medic named Arata, beside them.',
      foe: 'rogue-arashigakure-captain-jonin',
      second: 'rogue-arashigakure-medic-chunin',
      surrender:
        'Ikazuchi lowers their hands, and the clouds go with them. “Then you tell them,” they say. “Tell them what that order cost.”',
      ending:
        'The man in Port Shiomachi is never named. A letter goes across the Southern Sea under the Tōrokage’s seal, and no storms come up the coast road all winter.',
    },
  },
];
