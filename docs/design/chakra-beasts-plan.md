# Chakra beasts

The bestiary's animals are plain on purpose (`content-pass-plan.md`): no chakra, no
techniques, only traits, size and meat. This plan is the other side of that line: animals whose
lines have lived beside chakra for generations and come out of it strange. A boar whose tusks
smoke, a fox whose tracks lead you in circles, an old bear with moss on its back that the
mountain itself seems to answer to.

## Decisions

- **They are animals, never people.** Unlike the summoning clans, a chakra beast is not sentient:
  it doesn't speak, bargain, sign or remember you as a person would. However old an elder is, it
  is an animal that has lived a long time beside chakra.
- **They live in the deep wilds**, not on the roads. On any commonly travelled path they are rare
  to the point of a story told at an inn. You find them by choosing to go off the road and into
  wild country, and the further in you go, the likelier they get (see **The deep wilds**).
- **Tailed beasts**, and anything of that scale, are out of scope.
- **No settled name yet** (see **Names**). Until one is chosen the code says `chakra beast` and
  nothing in the game's text depends on a category word.

## What a chakra beast is

An animal of a kind the bestiary already has (or could), changed by where it lives: a leyline
under a mountain, a battlefield where too many shinobi died, a shrine grove, the edge of a great
beast's sleep. It is still an animal. It doesn't talk, sign contracts or use hand signs; what it
does, it does the way a heron fishes, by instinct grown over generations.

Three things set it apart from a plain animal, and each is already a fight rule:

- **Chakra.** It has a pool (`maxChakra`) and may have a **nature**, which strengthens its own
  element's techniques like anyone's (`rules/elements.ts`).
- **Techniques of its own.** Breath, spit, a charge wreathed in its element, a cry that dazes, a
  coat that hides it. Beast techniques are body moves where they are bites and charges (breath,
  `rules/breath.ts`) and moulded where they carry an element.
- **A gift.** Some carry one of the perks people earn by blood or training: `mimicry` (a shrike
  that answers your technique with your technique), `insight` or `foresight` (an owl that has
  watched shinobi fight for sixty years), a `shield` that rises from where its power came from (a
  turtle's shell of hardened dust), or a hive living in its body (`EnemyDef.hive`).

None of that needs new engine rules for the first pass. The line between plain and changed is
drawn in content: a plain animal has no chakra and no techniques; a chakra beast has both, and
its banner says so (`kind: 'Chakra Beast'`, so scouting and the field book can tell them apart).

## Three degrees of change

| Degree      | Danger        | What it is                                                                              |
| ----------- | ------------- | --------------------------------------------------------------------------------------- |
| **Touched** | petty, armed  | A plain body with a trickle of chakra and one trick: a hiding coat, a dazing cry.       |
| **Changed** | armed, deadly | A nature and an elemental technique or two, often a size up.                            |
| **Elder**   | deadly, elite | Named and old (`proper`), one of a kind, with a gift: mimicry, eyes, a shield, a brood. |

Elders are the bestiary's equivalent of named missing-nin: few, each with a description that is
a story, met on hunts and arcs rather than on the road.

## A first roster, by country

About eighteen, written once in `content/shared/bestiary/chakraBeasts.ts` for every pack (beast
techniques are shared, like companions', so no `FoeKit` roles are needed):

- **Woods:** a mist fox (touched: illusions, `illusionist`); an ember-tusk boar (changed: fire,
  a burning charge); an echo shrike (touched: `mimicry`, small and quick); the moss-backed bear
  (elder: earth, `huge`, armoured, slow and terrible).
- **Mountains:** a thunder kite (changed: lightning, swift dive); a stone serow (changed: earth,
  armoured, a charge that knocks); the old owl of the pass (elder: genjutsu, `foresight`).
- **River and marsh:** a lightning eel (changed: lightning, a shock that dazes); a mist toad
  (touched: water, a fog field); a marsh serpent (changed: water, a coiling pin).
- **Shore:** a tide crab (changed: water, a water wall); an ink squid (touched: a blinding
  cloud); a storm gull flock (touched: wind, `pack`).
- **Desert:** a glass scorpion (changed: a poison sting, `afflict`); a dune serpent (changed:
  earth, hides under the sand); the sand-sea turtle (elder: a dust `shield`, `huge`).
- **Anywhere chakra pools:** chakra hornets (touched: a hive, `EnemyDef.hive`); a lantern moth
  swarm (touched: glow, drain).

Each joins the bestiary bench at its danger, like every other foe.

**As built.** Eighteen, as listed (the hornets are bell-nest wasps, a hive of the shared paper
wasps). They keep the `Beast` banner and are marked `chakraBeast` instead, so no category word
reaches the game's text; a foe's `perks` carry the shrike's mimicry and the owl's foresight.
Twenty-eight techniques of their own (`beastArts.ts`, `beastArtsWater.ts`), exempt from needing
a source and validated so no one else holds them. The elders had to come down to sit in the
elite band, and the moss-backed bear lost its armour: huge is armour enough. Elders are not
`proper`, so the story says "the old owl of the pass".

## The deep wilds

Wild country already exists: wild locations between the towns (the Cedar Deep, the Salt Flats,
the Old Battlefield: `kind: 'wild'`, a `wilds` place and a `camp`) and the wild places in and
around every village. What doesn't exist is going _into_ it. This is where chakra beasts live,
so it comes first.

**Venturing in.** From a wild place's camp, or any `wilds` place outside a village, you may set
out into the wild instead of foraging at the edge (`venture`, a new action). A venture plays like
a journey (`game/journeys.ts`: it is a mission run with generated stages): a day at a time, each
day a leg deeper, a way-finding check (perception, intellect or a tracker's nose: fail and you
lose a day or a little health, never your way home), and that depth's draw: a find, a sight, a
camp, or a meeting. Every evening you choose to push on or turn back; turning back walks you out
the way you came, at the depths you came through. Food is your pack, as on the road.

**Depths.** Each wild country has three:

| Depth     | What lives there                                                                                                                 |
| --------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Edge**  | Plain animals, foragers' finds, the odd poacher or bandit camp.                                                                  |
| **Deep**  | Where people go to hide: missing-nin (the composed rogues), smugglers' caches, a hermit, deserters. Touched beasts. Rarer finds. |
| **Heart** | Changed beasts as a matter of course, and somewhere in it an elder. The rarest finds, and sights of the kind only the heart has. |

What each depth holds is data on the wild country (`WildDepths`: by biome, with the shared lists
per biome written once, as finds and fishing spots are), drawn by hash of the seed and the day
like the board, never the Rng. Foes at a depth follow the bestiary's danger bands, so the heart
of a forest is elite country whatever your rank: the venture's notice says how deep you are and
what that means, and a genin's sensei won't sign leave for the heart (`game/leave.ts`).

**As built.** Woods, mountains, marsh, shore and desert each have the three depths
(`content/shared/deepWilds.ts`); a river runs through other country and has none. A venture is
set out on from any wild place of those biomes and plays as a mission run of your own
(`game/ventures.ts`), never on the map: a day at each depth (edge armed, deep deadly, heart elite),
a way-finding check (perception or intellect, a tracker's nose where you have one) before the
deep and the heart that costs some health when it fails, a camp each night where you may turn
back, and a day back through each depth on the way out. What a day brings is its depth's road
events, drawn as a road's are, encounters included: plain animals, poachers and finds at the edge;
the pack's missing-nin, smugglers, deserters, a hermit and the touched beasts in the deep; the
changed beasts, the three elders (rare) and the heart's sights in the heart. A day at the edge is anyone's; past it, leave works as for a trip: a genin's pass must last until
they are back, a chūnin spends days of leave, and the heart is for chūnin and up. A sensei won't
sign you out across an exam they'd put you in, and a day at the edge is no excuse for missing
them. A venture that ends in a defeat costs no standing, as a trip's doesn't.

**Why go.** The heart's finds and drops (the kitchen, below), field book entries no road gives,
bounties: a missing-nin hiding in the deep is a job's quarry already, and a hunt posted for one
can name the wild country it is in. Later, a changed kind to win over (companions, below).

## Names

There is no settled name, and the world may not need one. Three ways to go:

- **No category word at all.** People name what they meet: "the ember-tusk", "the old owl of the
  pass". The banner says `Beast` like any animal, and a read adds a line ("its chakra runs like a
  shinobi's") once seen. This is the quietest, and keeps them strange.
- **A folk word**, said by hunters and innkeepers rather than scholars, set per pack in
  `SettingText` so the fan pack can use its own. Candidates for the original: _the changed_,
  _deep-blood_, _old-wild beasts_, _lantern-eyed_ (their eyes take the light like a lantern).
- **A scholar's word** the Archive uses, with the folk word in the mouths of everyone else.

Recommended: start with no category word (the first option), and add a folk word only if the
writing keeps reaching for one.

## What has to be built

1. **Beast techniques for foes.** Add the new techniques to `shared/beastTechniques.ts` (or a
   sibling file) and give them a source exemption like companions' and summons': a technique held
   by a chakra beast is its own (`validateSources.ts`), and only foes of kind `Chakra Beast` may
   hold one (validated, so people never learn a boar's charge).
2. **The roster** above, with drops.
3. **The kitchen.** Chakra-rich meat and parts as `drops` (ember boar flank, thunder eel, moss
   bear fat, glass scorpion venom sac), each an ingredient only a beaten beast leaves (the existing
   `drops` route), and recipes that use them: chakra back as you eat, a study bonus for the
   beast's element (`studyElement`), a provision. One role each, as always.
4. **Jobs.** Hunt fills for the changed beasts (`c-team-hunt`, B-rank hunts) that send you into
   the wild country they live in; a protect job (a white stag poachers want, where the job fails if
   the beast dies); and one arc around an elder (the old owl of the pass, say: something is wrong
   on the mountain, and the owl has been watching it). No road-event bands: they stay off the
   roads.
5. **Scouting and the field book.** A read says "Changed by chakra" and names the nature and the
   gift once seen. The field book's foes page takes them with no code; a page of its own for chakra
   beasts is a later choice.

Then, later:

6. **Companions.** A changed wild kind you can track and win over in a chakra-rich wild place
   (`trackWild`), whose techniques open by bond stage like any kind's (`CompanionKindDef`), slower
   to bond than a plain wolf and worth it.
7. **Rules gaps, only if the first pass shows them.** Candidates: a beast that regenerates (a
   heal over exchanges), venom that stacks, a shell that cracks and stays cracked. Each a verb or a
   lingering effect, added only when a beast can't be written without it.

## Order

1. Beast techniques, the source exemption and its validation; the roster; the bench.
2. The deep wilds: `venture`, depths and their shared tables by biome, the edge, deep and heart
   of the wild countries that exist, with the missing-nin and hideouts of the deep.
3. Drops and the recipes that use them.
4. Hunt fills that name a wild country, the protect job, then the elder's arc.
5. Scouting's line for a changed beast.
6. Later: changed companions, and any rule a beast turns out to need.

## Open questions

- **The name**, if any (see **Names**).
- **How deep a genin may go.** This plan lets a genin venture to the deep on leave and keeps the
  heart for chūnin and up, or for a genin under their sensei on a job.
- **Whether the deep wilds get places of their own** on the map (a hidden valley found only by
  venturing), or stay depths of the wild countries that exist. This plan starts with depths.
