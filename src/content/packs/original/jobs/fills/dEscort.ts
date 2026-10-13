import type { MissionFill } from '../../../../missionTemplates';

/** Escorts: days on the road with someone to look after (`dRankEscort`). */
export const D_ESCORT: readonly MissionFill[] = [
  {
    id: 'brides-chest',
    templateId: 'd-short-escort',
    values: {
      storyKey: 'saburo',
      chargeName: 'Old Saburō',
      likes: 'joke',
      alsoLikes: 'praise',
      dislikes: 'challenge',
      region: 'hill-road',
      greeting:
        '“They sent children,” Old Saburō says, peering at you over the chest on his back. “Well. Children can carry things.”',
      warmReply:
        'He laughs until he wheezes, and tells you that you remind him of his grandson, who is a fool.',
      businessReply: '“Business, business,” he grumbles, and starts to sing to the chest instead.',
      jokeReply:
        'He snorts so hard he nearly drops the chest, and for the rest of the morning he calls you “young master”.',
      camp: 'You make camp in a cedar hollow below the ridge, and Saburō sets the chest where he can touch it in his sleep.',
      confidence:
        'He tells you he carried the bride’s mother’s chest up this same hill, thirty springs ago, and he will not die before he has carried the daughter’s.',
      guarded:
        'He asks whether you can sing, and then makes you prove it, and that is the end of talking.',
      lastDay:
        'Kayano’s rooftops show over the last ridge by midmorning, and Saburō starts singing again.',
      desperate:
        'The men behind the log are thin as rakes, and the one with the bow is a girl no older than the bride.',
      spared:
        'You tell them the chest holds linen and lacquer, nothing they could eat. Saburō gives them his rice balls. They roll the log aside themselves.',
      hurt: 'Saburō ran when the fighting started and fell on the slope. He reaches Kayano on your back, the chest on his, swearing at you both.',
      trusted:
        'At the gate of Kayano, Saburō sets the chest down and makes you carry it the last steps. “So you can say you did,” he says.',
      title: 'The Bride’s Chest',
      client: 'The Matsuda household',
      charge: 'a bride’s dowry chest and its porter, Old Saburō',
      destination: 'the hill village of Kayano',
      chatter:
        'Old Saburō carries the chest on his back and sings wedding songs, badly, for the first hour of the climb.',
      fuss: 'At the halfway shrine Saburō sits down and declares that his knees have retired, and the chest is too heavy to carry another step.',
      fussSettled:
        'You rig a sling from your spare rope and take half the weight. Saburō walks on, singing again.',
      fussCostly:
        'You carry the chest yourself, with Saburō limping behind and telling you that you are doing it wrong. You lose an hour.',
      ambush:
        'Where the path crosses the ridge, someone has rolled a log across it, and the bushes either side are too still.',
      foe: 'bandit-thug',
      lookout: 'bandit-archer',
      slipped:
        'You take Saburō and the chest down a goat path round the ridge. Behind you, robbers wait at their log for nobody.',
      ending:
        'In Kayano the bride’s family open the chest to check it. Saburō is already asleep against the shrine wall, snoring a wedding song.',
    },
  },
  {
    id: 'pilgrim-nun-escort',
    templateId: 'd-short-escort',
    minMissionsCompleted: 2,
    values: {
      storyKey: 'kohaku',
      chargeName: 'Sister Kohaku',
      likes: 'kind',
      alsoLikes: 'earnest',
      dislikes: 'tease',
      region: 'hill-road',
      greeting: 'Sister Kohaku looks you up and down. “You’re very young. Have you eaten?”',
      warmReply:
        'You admit you haven’t. She presses a rice ball into your hand and watches you eat it all.',
      businessReply: '“Good,” she says, and walks faster than you do, as if to prove something.',
      jokeReply: 'She laughs, but she watches you a little more carefully after that.',
      camp: 'You make camp below the pass, among the stones the pilgrims have stacked for luck.',
      confidence:
        'She tells you about her brother, who walked this road with a lantern forty years ago and never came down.',
      guarded:
        'She asks whether you have written to your mother lately, and says nothing about herself.',
      lastDay:
        'The last morning the path climbs through a thousand small shrines, and Kohaku stops at none of them.',
      desperate:
        'The men waiting in the rocks are pilgrims’ sons from the hill farms, gone hungry since the harvest failed. Their lookout is a boy.',
      spared:
        'Kohaku walks up to the boy before you can stop her and blesses him. The men look at their feet, and then at the road home.',
      hurt: 'Kohaku ran when the fighting started and turned her ankle among the rocks. She hangs her lantern from your shoulder, and does not say a word.',
      trusted:
        'At the foot shrine Kohaku hangs her lantern among a thousand others, then hands you the taper and asks you to light it for her brother.',
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
      storyKey: 'yasuke',
      chargeName: 'Potter Yasuke',
      likes: 'curious',
      alsoLikes: 'praise',
      dislikes: 'tease',
      region: 'mountain-pass',
      greeting:
        '“Mind the cart,” Potter Yasuke says, before he says anything else. “There are three years of my life in it.”',
      warmReply:
        'You ask to see the best piece. He unwraps a bowl the colour of deep water and does not breathe until it is wrapped again.',
      businessReply: 'He nods, and checks the lashings on the cart for the fourth time.',
      jokeReply: 'He does not laugh, and he moves the cart a little further from you.',
      camp: 'You make camp in the lee of an old kiln, its bricks still faintly warm from someone else’s fire.',
      confidence:
        'He tells you his teacher died chasing that blue, and that this fair is the last place she ever sold a bowl.',
      guarded: 'He tells you a great deal about clay, and nothing about himself.',
      lastDay:
        'The last morning the pass is full of potters’ carts, all heading for the fair, all creaking.',
      desperate:
        'The men waiting in the kiln ruins are out-of-work kiln hands, laid off in the spring, their hands still grey with old clay.',
      spared:
        'Yasuke knows two of them by name. He tells them the fair needs carriers, and they help push the cart the rest of the way.',
      hurt: 'Yasuke tried to shield the cart when the fighting started and was knocked flat. Half a crate is broken, and he will not look at you.',
      trusted:
        'At the fair Yasuke sells every pot by noon except the blue bowl. He wraps it again, and puts it in your hands.',
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
      storyKey: 'akebono',
      chargeName: 'Doctor Akebono',
      likes: 'earnest',
      alsoLikes: 'quiet',
      dislikes: 'joke',
      region: 'river-road',
      greeting:
        '“You’re late,” Doctor Akebono says, though you are early. “People are dying while you stand there.”',
      warmReply: '“Sentiment,” she says, but she lets you carry the chest.',
      businessReply: 'She looks at you properly for the first time, and nods once.',
      jokeReply: 'She stares at you until the joke dies on its own, and then she starts walking.',
      camp: 'You make camp on a dry bank above the river, and the doctor sorts her powders by firelight.',
      confidence:
        'She tells you the fever took her own village when she was your age, and that she has been walking towards it ever since.',
      guarded: 'She tells you how to dress a wound properly, at length, and nothing else.',
      lastDay:
        'The last morning you smell the hamlets before you see them: woodsmoke, and the sharper smell of sickness.',
      desperate:
        'The pirates waiting in the reeds are fishermen from the hamlets, too sick to fish and too poor to pay a doctor.',
      spared:
        'The doctor walks into the reeds and starts examining the nearest of them. By the time you catch up, they are carrying her chest.',
      hurt: 'The doctor bolted when the fighting started and slipped in the mud. She sets her own wrist in the first hamlet and works one-handed all day.',
      trusted:
        'In the first hamlet the doctor hands you a mortar and a pestle and tells you to grind. At dusk she says you did it nearly properly.',
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
    reward: { ryo: 400, reputation: 5 },
    values: {
      storyKey: 'tsuru',
      chargeName: 'Master Tsuru',
      likes: 'joke',
      alsoLikes: 'curious',
      dislikes: 'quiet',
      region: 'river-road',
      greeting:
        '“A guard!” Master Tsuru cries, sweeping a bow so low his hat touches the road. “At last, a part for someone who can’t act.”',
      warmReply:
        'He claps you on the back and gives you a puppet to carry, a little monk with a cracked face. “He likes you,” he says.',
      businessReply: '“So serious,” he sighs, and puts on a show for the cart horse instead.',
      jokeReply:
        'He laughs so hard he has to sit down on the cart, and the whole troupe wants to know what you said.',
      camp: 'You make camp in a meadow by the river, and the troupe puts on a show for nobody but you.',
      confidence:
        'He tells you the fox princess was carved by his wife, and that every town they play, he looks for her in the crowd.',
      guarded: 'He does three voices at once to avoid answering, and they are all very funny.',
      lastDay:
        'The last morning the river widens and Kawabe’s market flags show downstream, and the troupe begins to rehearse in earnest.',
      desperate:
        'The rough men on the bridge are out-of-work boatmen, and one of them is watching the puppets with a child’s face.',
      spared:
        'Master Tsuru hands the boatmen a puppet each and makes them part of the show. They walk into Kawabe ahead of the cart, as heralds.',
      hurt: 'Master Tsuru ran for the cart when the fighting started and fell from the bridge rail. He plays that night from a chair, his leg in a splint.',
      trusted:
        'That night the troupe plays the square, and the fox princess bows to you from the stage. Master Tsuru gives you the little monk to keep.',
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
];
