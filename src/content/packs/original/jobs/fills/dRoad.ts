import type { MissionFill } from '../../../../missionTemplates';

/** D-rank work on the roads and at the doors: toll gangs and nights on watch. */
export const D_ROAD: readonly MissionFill[] = [
  {
    id: 'toll-at-the-ferry-steps',
    templateId: 'd-toll-gang',
    minMissionsCompleted: 3,
    values: {
      title: 'Toll at the Ferry Steps',
      client: 'The Ferry Landing Fishers',
      crossing: 'the ferry steps at the river crossing',
      complaint:
        '“A coin to go down the steps and a coin to come up,” the old fisherwoman says. “For our own landing. They hold the ferry-master’s boat hostage.”',
      gang: 'A woman with a boat-hook sits on the ferry roof, a pirate with a cudgel guards the steps, and the ferry-master is tied to his own pole.',
      foe: 'bandit-chief',
      crony: 'river-pirate',
      terrain:
        'Steep stone steps down to the water, the ferry rocking at the bottom, and a slick weed-covered ledge along the bank.',
      parley:
        'The woman on the roof weighs you up, then cuts the ferry-master loose herself. “Plenty of other rivers,” she says, and poles off in their skiff.',
      ending:
        'The ferry-master takes the first boatload across for nothing, and the fisherwoman counts the coins they left behind into every hand on the landing.',
    },
  },
  {
    id: 'kiln-pass-gate',
    templateId: 'd-toll-gang',
    minMissionsCompleted: 5,
    values: {
      title: 'The Kiln Pass Gate',
      client: 'The Kiln Pass Potters’ Guild',
      crossing: 'the old gatehouse at the top of Kiln Pass',
      complaint:
        '“Every cart of clay, every cart of pots,” the guild’s headwoman says. “They’ve taken the old gatehouse and they act like they built it.”',
      gang: 'A man in an old border guard’s jacket leans on the gatehouse door, a bowman on the roof above him, and a chain across the road.',
      foe: 'bandit-chief',
      crony: 'bandit-archer',
      terrain:
        'A narrow road through a stone gatehouse, steep slopes either side, and a broken window in the gatehouse’s back wall.',
      parley:
        'The man in the jacket takes the chain down himself and coils it neatly. “It was a good gate,” he says. “Somebody should guard it properly.”',
      ending:
        'The first cart through is piled high with raw clay, and the carter throws you a lump of it, telling you to make yourself a cup.',
    },
  },
  {
    id: 'toll-on-orchard-lane',
    templateId: 'd-toll-gang',
    minMissionsCompleted: 3,
    values: {
      title: 'Toll on Orchard Lane',
      client: 'The East Farms’ Children',
      crossing: 'the footbridge on Orchard Lane, the only way to the village school',
      complaint:
        'A tiny girl with a scraped knee stands at the Mission Hall desk with a fistful of coins. “Two big boys,” she says. “They take our lunches. We clubbed together to pay you.”',
      gang: 'Two hulking farmhands, too old for school and too lazy for work, lounge on the footbridge eating rice balls that aren’t theirs.',
      foe: 'bandit-thug',
      crony: 'bandit-thug',
      terrain:
        'A narrow plank footbridge over a muddy stream, an orchard wall on one side and a deep pond on the other.',
      parley:
        'The bigger farmhand swallows his rice ball and goes red to the ears. “It was only lunches,” he mumbles, and they slink off across the orchard.',
      ending:
        'The children cross the bridge in a solemn line, each one bowing to you. The tiny girl gives you half of her rice ball.',
    },
  },
  {
    id: 'toll-on-the-dune-road',
    templateId: 'd-toll-gang',
    minMissionsCompleted: 9,
    reward: { ryo: 220, reputation: 6 },
    values: {
      title: 'Toll on the Dune Road',
      client: 'The Sakyūgakure Glass Traders',
      crossing: 'the last well on the dune road to Sakyūgakure',
      complaint:
        '“Water costs a jar of glass a camel,” the glass trader says, in the slow accent of the dunes. “Water from a well your lord dug for everyone.”',
      gang: 'A sun-darkened man in a stolen trader’s veil sits on the well’s rim with a ladle, and a bowman watches from the shade of the windbreak.',
      foe: 'bandit-chief',
      crony: 'bandit-archer',
      terrain:
        'A stone well in a hollow of the dunes, a windbreak of palm fronds, and soft sand that slides underfoot on every slope.',
      parley:
        'The man on the well hands you the ladle, handle first. “Too hot out here for fighting anyway,” he says, and the two of them walk off into the heat haze.',
      ending:
        'The traders water their camels and give you a little glass lantern from the dunes, as clear as the well water.',
    },
  },
  {
    id: 'night-in-the-archive',
    templateId: 'd-night-watch',
    minMissionsCompleted: 1,
    values: {
      title: 'A Night in the Lantern Archive',
      client: 'Archivist Senri',
      post: 'the sealed scroll room of the Lantern Archive',
      setup:
        'Someone has been trying the seals on the archive’s restricted room, and Senri is too frightened to sit up himself. Footnote the owl glares at you from a beam.',
      vigil:
        'The small hours drag among the scrolls. The archive is warm, the lamp is low, and the smell of old paper is soothing.',
      intruder:
        'A young man in a scratched-out headband is kneeling at the sealed door, trying to copy the seal onto his own paper by candlelight.',
      foe: 'academy-dropout',
      parley:
        '“I just wanted to know what they wouldn’t teach me,” he says, folding his paper away. Footnote hoots, and he jumps a foot.',
      ending:
        'At dawn Senri finds the seals untouched and gives you breakfast among the scrolls. Footnote steals your egg.',
    },
  },
  {
    id: 'watch-on-the-rice-barge',
    templateId: 'd-night-watch',
    minMissionsCompleted: 2,
    values: {
      title: 'Watch on the Rice Barge',
      client: 'Bargemaster Iwao',
      post: 'a rice barge moored on the canal for the night',
      setup:
        'The barge is loaded with the village’s winter rice, and two barges on the canal have been robbed this month. Iwao is going home to his wife.',
      vigil:
        'The barge rocks gently on the dark water, the canal lanterns sway, and the lapping of the water sounds just like a lullaby.',
      intruder:
        'A skiff glides up alongside without a sound, and a man with a boat-hook climbs aboard and starts handing sacks down.',
      foe: 'river-pirate',
      parley:
        '“Fine, fine,” he says, and puts the sack back very carefully on the pile. “You can’t blame a man for being hungry.”',
      ending:
        'At dawn Iwao counts his sacks twice and finds none missing. He gives you a sack of your own, which is more rice than you can carry.',
    },
  },
  {
    id: 'watch-over-the-brewery',
    templateId: 'd-night-watch',
    minMissionsCompleted: 4,
    values: {
      title: 'Watch over the Sake Brewery',
      client: 'Brewer Kuramoto',
      post: 'the brewery’s cellar of new-season sake',
      setup:
        'The new sake is maturing in its casks, and a cask was drained dry last week by someone who left the tap running. Kuramoto has brought you a stool and a warning.',
      vigil:
        'The cellar is warm and the air is thick with sake. After an hour, simply breathing it makes your eyelids heavy.',
      intruder:
        'A big man with a ladle is crouched by the oldest cask, drinking from the tap and humming happily.',
      foe: 'bandit-thug',
      parley:
        '“All right,” he says, wiping his mouth. “Best sake in the village, mind. I came back for the taste, not to steal.”',
      ending:
        'At dawn Kuramoto finds the cask a little lighter and you wide awake. He laughs and pours you a thimbleful for the effort.',
    },
  },
  {
    id: 'night-at-the-forge',
    templateId: 'd-night-watch',
    minMissionsCompleted: 6,
    values: {
      title: 'Night at the Forge',
      client: 'Master Smith Hagane',
      post: 'the forge where Hagane’s secret blade rests overnight',
      setup:
        'Everyone in the village has heard about Hagane’s secret blade, and somebody has already tried the forge door. Hagane leaves you by the banked furnace.',
      vigil:
        'The furnace burns low and warm, and with no sound but the tick of cooling iron, your head starts to drop.',
      intruder:
        'A slim figure slips in through the smoke hole and creeps towards the wrapped blade on the anvil.',
      foe: 'academy-dropout',
      parley:
        '“I only wanted to see it,” the intruder mumbles. “Just once. They say it is the best he has ever made.”',
      ending:
        'At dawn Hagane unwraps the blade to check it and lets you look, just once. Then he wraps it up again and tells you to forget what you saw.',
    },
  },
  {
    id: 'watch-over-the-smokehouse',
    templateId: 'd-night-watch',
    minMissionsCompleted: 2,
    values: {
      title: 'Watch over the Smokehouse',
      client: 'Butcher Okada',
      post: 'the smokehouse behind Okada’s shop, hung with the autumn hams',
      setup:
        'Two hams went missing last week, and the paw prints in the ash were as big as your hand. Okada leaves you a lantern and a stool and bolts the shop door behind him.',
      vigil:
        'The smoke is warm and sweet, the hams turn slowly on their hooks, and the stool is far too comfortable for a night like this.',
      intruder:
        'The back shutter lifts. A grey hound slips in first, nose down, and a man in a hunter’s coat follows it with a sack over his shoulder.',
      foe: 'poacher',
      parley:
        '“Easy, easy,” the poacher says, a hand on the hound’s neck. “We were only hungry, the two of us.” The dog keeps its eyes on you all the way out.',
      ending:
        'At dawn Okada counts his hams, finds them all, and wraps the end of one in paper for you. He says he will buy a dog of his own.',
    },
  },
];
