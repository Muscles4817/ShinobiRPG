import type { MissionFill } from '../../../../missionTemplates';

/** D-rank work on the roads and at the doors: short escorts, toll gangs and nights on watch. */
export const D_ROAD: readonly MissionFill[] = [
  {
    id: 'pilgrim-nun-escort',
    templateId: 'd-short-escort',
    minMissionsCompleted: 2,
    values: {
      title: 'The Pilgrim Nun',
      client: 'The Mountain Temple',
      charge: 'an old pilgrim nun, Sister Kohaku, and the lantern she carries',
      destination: 'the foot shrine of Mount Reikon',
      chatter:
        'Sister Kohaku walks faster than you do, and spends the first hour asking whether you have eaten, slept and written to your mother.',
      fuss: 'At a roadside spring Kohaku stops to bless every pilgrim who passes, and there is a long line of them, and the light is going.',
      fussSettled:
        'You take over pouring the water for her, and she blesses twice as fast, and you are back on the road before dusk.',
      fussCostly:
        'You try to hurry her, and she blesses you too, at great length, while the queue grows and the sun sets.',
      ambush:
        'The road narrows between two boulders where the pilgrims’ path begins, and someone has been watching it from the rocks above.',
      foe: 'bandit-thug',
      lookout: 'bandit-archer',
      slipped:
        'You lead Kohaku up an old charcoal track round the boulders. She hums a sutra the whole way, very quietly, and the robbers never hear it.',
      ending:
        'At the foot shrine Kohaku hangs her lantern among a thousand others, and tells you it is for her brother, who walked this road and never came down.',
    },
  },
  {
    id: 'pots-for-kiln-pass',
    templateId: 'd-short-escort',
    minMissionsCompleted: 4,
    values: {
      title: 'Pots for the Kiln Pass Fair',
      client: 'Potter Yasuke',
      charge: 'a handcart of glazed pots and the potter who made them',
      destination: 'the autumn pottery fair at Kiln Pass',
      chatter:
        'Yasuke talks about glazes for the whole first hour, ash glazes and iron glazes and a blue he has been chasing his whole life.',
      fuss: 'The cart’s wheel cracks on a stone halfway up the pass, and the whole load of pots tilts towards the ditch.',
      fussSettled:
        'You wedge the axle with a branch and lash the wheel with cord, and the cart rolls on, creaking but whole.',
      fussCostly:
        'You end up carrying half the pots up the pass in your arms, two at a time, while Yasuke steers the limping cart.',
      ambush:
        'At the top of the pass the road runs between old kiln ruins, and a crate of broken pots has been set across it as a warning.',
      foe: 'bandit-thug',
      lookout: 'bandit-archer',
      slipped:
        'You steer the cart through the ruined kiln chambers, out of sight of the road, and come out above the robbers.',
      ending:
        'Yasuke sells every pot at the fair by noon, except one blue bowl he will not sell to anyone. He gives it to you.',
    },
  },
  {
    id: 'travelling-physician',
    templateId: 'd-short-escort',
    minMissionsCompleted: 5,
    values: {
      title: 'The Travelling Physician',
      client: 'Doctor Akebono',
      charge: 'Doctor Akebono, her medicine chest and her bad temper',
      destination: 'the fever-struck hamlets past the river ford',
      chatter:
        'The doctor reads a medical scroll as she walks, only looking up to tell you that you are holding your shoulders wrong.',
      fuss: 'At the ford the doctor refuses to wade. Her chest must not get wet, nor must she, and the ferry is on the far bank.',
      fussSettled:
        'You carry the chest across on your head, and then the doctor, who complains about your technique the whole way.',
      fussCostly:
        'You spend an hour shouting for the ferry, and the doctor spends it explaining exactly how many patients are dying in the meantime.',
      ambush:
        'On the far bank the road runs through tall reeds, and a skiff has been dragged up into them where no fisherman would leave it.',
      foe: 'river-pirate',
      lookout: 'bandit-archer',
      slipped:
        'You lead the doctor round the reeds along a dyke path, and the pirates waiting by their skiff hear nothing but frogs.',
      ending:
        'The doctor sets to work in the first hamlet without a word of thanks. When you leave, she presses a pot of salve into your hand, not looking at you.',
    },
  },
  {
    id: 'puppet-troupe-escort',
    templateId: 'd-short-escort',
    minMissionsCompleted: 7,
    reward: { ryo: 190, reputation: 5 },
    values: {
      title: 'The Puppet Troupe',
      client: 'The Wandering Moon Puppet Troupe',
      charge: 'a troupe of puppeteers and their cart of painted puppets',
      destination: 'the river market town of Kawabe',
      chatter:
        'The puppeteers rehearse as they walk, and their puppets argue with each other across the cart, and they will not let you hear the ending.',
      fuss: 'The troupe’s best puppet, a fox princess, falls off the cart into a stream, and her master refuses to go on without her.',
      fussSettled:
        'You fish the princess out downstream, dry her by your own fire and restring her, and her master weeps on your shoulder.',
      fussCostly:
        'It takes the whole afternoon to find the princess wedged in a weir, and the troupe arrives in Kawabe after dark.',
      ambush:
        'At the bridge before Kawabe, a pair of rough men sit on the rail, waiting for anyone with a cart worth emptying.',
      foe: 'bandit-thug',
      lookout: 'bandit-thug',
      slipped:
        'You lead the troupe across the stream by the stepping stones below the bridge, and the men on the rail never turn round.',
      ending:
        'That night the troupe plays the town square, and the fox princess bows to you from the stage. The whole town turns to see who she means.',
    },
  },
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
        'The first cart through is piled high with raw clay, and the carter throws you a lump of it, telling you to make yourself something useful.',
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
        'The man on the well hands you the ladle, handle first. “Too hot out here for fighting anyway,” he says, and the two of them walk off into the shimmer.',
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
        'The furnace glows low and warm, the only sound is the tick of cooling iron, and your head starts to nod.',
      intruder:
        'A slim figure slips in through the smoke hole and creeps towards the wrapped blade on the anvil.',
      foe: 'academy-dropout',
      parley:
        '“I only wanted to see it,” the intruder mumbles. “Just once. They say it is the best he has ever made.”',
      ending:
        'At dawn Hagane unwraps the blade to check it and lets you look, just once. Then he wraps it up again and tells you to forget what you saw.',
    },
  },
];
