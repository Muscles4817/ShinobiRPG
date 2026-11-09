import type { MissionDef } from '@/systems/missions';

/**
 * B-rank work out on the water and in the wild: Mist hunter-nin come for bloodline refugees in
 * the Land of Waves, pirates raiding the new bridge's boats, and poachers after a beast the Great
 * Forest has kept for longer than the Leaf has stood.
 */

export const REFUGEES_AT_THE_WAVES: MissionDef = {
  id: 'senior-refugees-at-the-waves',
  title: 'Refugees at the Waves',
  rank: 'B',
  client: 'Tazuna, bridge builder of the Land of Waves',
  summary:
    'A boat of families fleeing the Mist has come ashore in the Land of Waves, and the Mist’s hunters are a day behind it.',
  slots: 4,
  energyCost: 35,
  reward: { ryo: 640, reputation: 11 },
  minMissionsCompleted: 10,
  goesTo: 'land-of-waves',
  endsAt: 'konohagakure',
  stages: [
    { kind: 'road', to: 'outbound', text: 'South to the coast and over the bridge.' },
    {
      kind: 'narrative',
      text: 'Tazuna has hidden three families in his own boatshed, among them a girl whose breath frosts the air when she is frightened.',
    },
    {
      kind: 'check',
      text: 'The hunters will come by water. You have the night to make the boatshed look like nothing worth searching.',
      approaches: [
        { label: 'Lay a false trail along the shore', stat: 'intellect', difficulty: 13 },
        { label: 'Hang an illusion over the boatshed', stat: 'genjutsu', difficulty: 13 },
        { label: 'Seal the families’ chakra for a night', stat: 'fuuinjutsu', difficulty: 14 },
      ],
      success:
        'When the masks come ashore at dawn they follow the trail you laid, and you meet them on the mudflats far from the boatshed.',
      failure:
        'The masks come straight to the boatshed door, and you have to stand in front of it.',
      onFailure: 'penalty',
      failureDamage: 6,
    },
    {
      kind: 'encounter',
      template: 'lone-rogue',
      job: 'escort',
      ground: 'lake',
      text: 'Two hunter-nin step off a skiff onto the shallows, their masks turned towards the town.',
      enemyIds: ['mist-hunter-nin', 'mist-patrol'],
      canFlee: false,
      flavour: {
        parley:
          'The taller mask tilts. “Our orders cover the Land of Waves, not the Leaf,” they say. “If the Leaf is standing here, we have no orders.”',
      },
    },
    {
      kind: 'decision',
      text: 'The families cannot stay in the Land of Waves. The hunters will be back with more.',
      options: [
        {
          label: 'Bring them to the Leaf',
          tone: 'kind',
          reply:
            'They walk the coast road behind you with everything they own on their backs, and the girl holds your sleeve the whole way.',
          effects: [{ kind: 'mark', mark: 'refugees-to-leaf' }],
          ledger: 'Brought the Mist families to the Leaf, where nobody hunts a bloodline.',
        },
        {
          label: 'Find them a boat further along the coast',
          tone: 'quiet',
          reply:
            'A fishing captain who owes Tazuna a favour takes them east by night, to an island the Mist has never bothered with.',
          effects: [{ kind: 'mark', mark: 'refugees-east' }],
          ledger: 'Sent the families east on a fishing boat, out of every village’s reach.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'refugees-to-leaf' },
          text: 'The Hokage signs their papers himself, and the girl whose breath frosts the air starts at the academy in the spring.',
        },
        {
          text: 'Tazuna hears months later that the boat reached the island, and that the families have taken up fishing.',
        },
      ],
    },
    { kind: 'road', to: 'home' },
  ],
};

export const PIRATES_AT_THE_BRIDGE: MissionDef = {
  id: 'senior-pirates-at-the-bridge',
  title: 'Pirates at the Bridge',
  rank: 'B',
  client: 'The Land of Waves Ferrymen',
  summary:
    'Now the bridge is built, the boats that use it are rich enough to rob. A pirate crew has started taking them one at a time.',
  slots: 4,
  energyCost: 35,
  reward: { ryo: 560, reputation: 10 },
  minMissionsCompleted: 8,
  goesTo: 'land-of-waves',
  endsAt: 'konohagakure',
  stages: [
    { kind: 'road', to: 'outbound', text: 'South to the coast.' },
    {
      kind: 'narrative',
      text: 'The ferrymen show you the wreck of the last boat taken, scuttled in the shallows with its cargo gone and its crew put ashore in their underclothes.',
    },
    {
      kind: 'check',
      text: 'The pirates choose their boats. Somebody on the quay is telling them which ones are worth it.',
      approaches: [
        { label: 'Watch who talks to whom on the quay', stat: 'perception', difficulty: 12 },
        { label: 'Load a boat with false cargo', stat: 'intellect', difficulty: 13 },
      ],
      success:
        'A net-mender on the quay sends a boy running every time a rich boat loads, and the boy leads you to the pirates’ cove.',
      failure:
        'You sail out as bait on a boat that nobody would bother robbing, and come back a day later with nothing to show.',
      onFailure: 'penalty',
      failureDamage: 4,
    },
    {
      kind: 'encounter',
      template: 'bandit-camp',
      job: 'eliminate',
      ground: 'lake',
      text: 'The pirates’ ship lies at anchor in a cove, with their captain on deck counting barrels and a lookout up the mast.',
      enemyIds: ['pirate-captain', 'bandit-archer'],
      canFlee: true,
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'talked-down' },
          text: 'The pirates give up their ship and are put to work on the bridge, under Tazuna, who says he has had worse crews.',
        },
        {
          text: 'The ferrymen sail the pirates’ ship home as a prize and paint the Leaf’s mark on its bow.',
        },
      ],
    },
    { kind: 'road', to: 'home' },
  ],
};

export const FOREST_POACHERS: MissionDef = {
  id: 'senior-forest-poachers',
  title: 'The Poachers of the Great Forest',
  rank: 'B',
  client: 'The Inuzuka Kennels',
  summary:
    'Snares and chakra-wire have turned up deep in the Great Forest, set for something big. The Inuzuka want to know who set them, and for what.',
  slots: 4,
  energyCost: 35,
  reward: { ryo: 540, reputation: 10 },
  minMissionsCompleted: 8,
  goesTo: 'great-forest',
  endsAt: 'konohagakure',
  stages: [
    { kind: 'road', to: 'outbound', text: 'Out along the forest track and off it.' },
    {
      kind: 'check',
      text: 'The snares lead deeper, each one heavier than the last, and each one set by someone who knew how the forest’s animals move.',
      approaches: [
        { label: 'Follow the snare line', stat: 'perception', difficulty: 12 },
        { label: 'Think like the quarry', stat: 'intellect', difficulty: 13 },
        { label: 'Climb and look from the canopy', stat: 'speed', difficulty: 12 },
      ],
      success:
        'At the end of the line is a great boar with moss on its back, caught in chakra-wire, and the poachers’ camp downwind of it.',
      failure:
        'You walk into a snare meant for the boar, and by the time you are free the poachers know they are being hunted.',
      onFailure: 'penalty',
      failureDamage: 8,
    },
    {
      kind: 'encounter',
      template: 'bandit-camp',
      job: 'eliminate',
      ground: 'forest',
      text: 'A marksman and a hired swordsman share a fire beside cages big enough for a bear.',
      enemyIds: ['border-marksman', 'ronin'],
      canFlee: true,
    },
    {
      kind: 'decision',
      text: 'The boar is still in the wire, worn out with fury, and it doesn’t know who set it.',
      options: [
        {
          label: 'Cut it loose and stand clear',
          tone: 'kind',
          reply:
            'The boar crashes away into the trees, and somewhere in the forest something old stops listening for the poachers.',
          effects: [{ kind: 'mark', mark: 'boar-freed' }],
          ledger: 'Cut the forest’s old boar loose from the poachers’ wire.',
        },
        {
          label: 'Leave it for the Inuzuka to see to',
          tone: 'earnest',
          reply:
            'The Inuzuka come with their dogs, and the boar is let go two days later, fed and calmer, with a clan mark shaved into its flank.',
          effects: [
            { kind: 'mark', mark: 'boar-marked' },
            { kind: 'pay', share: 0.15 },
          ],
          ledger: 'Left the boar to the Inuzuka, who marked it and paid a little more for it.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'boar-marked' },
          text: 'Tsume says the marked boar will know the clan’s dogs now, and the clan’s dogs will know it.',
        },
        {
          text: 'The poachers’ papers name a buyer in Otafuku who collects chakra beasts for their hides.',
        },
      ],
    },
    { kind: 'road', to: 'home' },
  ],
};
