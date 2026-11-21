# Drafting canon jutsu for Shinobi RPG's fan pack

You are drafting game data for techniques (jutsu) from Narutopedia facts. Each task in your batch
file is one jutsu: its wiki facts (rank, classification, element, class type, range), the first
paragraph of its wiki page (`lead`), the versus fighters who use it with their grades per art,
and up to three existing pack techniques with similar names (`similarInPack`).

For every task write one object to your output file (a JSON array, same order as the batch).
Work from the facts given; do not fetch anything. Be decisive: this is a draft a person reviews.

## Decide first

- `"decision": "duplicate"` with `"duplicateOf": "<pack id>"` when a `similarInPack` entry is
  the same technique under another name (e.g. "Spider Sticky Gold" = `spider-sticking-gold`).
  Only when it is truly the same jutsu, not a variant.
- `"decision": "skip"` with a short `"skipReason"` when it is not a fight technique the engine can
  play: a gag or social jutsu (Sexy Technique, Calorie Control), a ritual or unsealing that has no
  effect in a fight (Unsealing Technique, Transcription Seal, Five Elements Unseal), a whole-body
  transformation or mode (Nine-Tails Chakra Mode, Baryon Mode, Slithering Snake Mode), a summons or
  puppet that needs a body of its own (Performance of a Hundred Puppets, Super Beast Imitating
  Drawing only if it is purely a summons), resurrection or soul magic (Living Corpse Reincarnation,
  One's Own Life Reincarnation), a passive ability, or a power far beyond any fight (planet-scale).
  When in doubt and it does something in a fight, draft it.
- Otherwise `"decision": "draft"`.

## A draft's fields

```
{
  "title": "<the task title, unchanged>",
  "decision": "draft",
  "id": "kebab-case, unique, short, from the English name (e.g. 'great-fire-destruction')",
  "name": "Pack-style English name: 'Fire Style: Great Fire Destruction' (Release -> Style; drop a trailing 'Technique'; keep proper names like 'Chidori')",
  "description": "ONE sentence in your own words, plain and vivid, at most ~140 characters, NO numbers, never copied from the lead. Present tense, says what you see happen.",
  "discipline": "taijutsu | ninjutsu | genjutsu | kenjutsu | fuuinjutsu",
  "element": "fire | wind | lightning | earth | water | null",
  "needsNature": true/false,
  "rank": "E|D|C|B|A|S",
  "reach": ["close","mid","far"] subset, or null for the art's usual reach,
  "accuracy": "sure | steady | wild | null",
  "effects": [ ... in order ... ],
  "extras": { optional: "lethal": true, "oncePerFight": true, "needsTarget": "open", "moulded": true, "dustCost": n, "dustDraw": n, "clan": "<pack clan id>" },
  "confidence": "high | medium | low",
  "note": "one short line: why these effects (what the lead says it does)"
}
```

### Discipline and element

- Genjutsu if classified Genjutsu. Taijutsu for unarmed body techniques. Kenjutsu for a blade or
  any held weapon form (the engine requires a blade in hand for kenjutsu). Fūinjutsu for sealing
  and barrier-formula techniques. Everything else ninjutsu.
- Element from the wiki element: Fire/Wind/Lightning/Earth/Water Release map directly. Kekkei
  genkai: Wood -> earth, Lava -> fire, Ice -> water, Storm -> lightning, Explosion -> earth,
  Blaze -> fire, Scorch -> fire, Boil -> fire, Magnet -> earth, Dust -> null. Yin/Yang/none -> null.
- `needsNature`: true for elemental techniques of rank B and up; false otherwise.

### Rank (important)

- Use the wiki rank when given. Otherwise judge from power: E trivial, D basic, C solid, B strong,
  A elite, S legendary.
- THEN cap it: the rank must not exceed the LOWEST grade among its users in the technique's
  discipline (grades E<D<C<B<A<S). A fighter whose ninjutsu is C cannot use a B ninjutsu at all.
  If the cap forces it below what the technique deserves, lower the power to fit the rank too.

### Effects: verbs and the power scale

Power medians in the pack by rank (stay near these; a fighter's signature move may go one rank
above; never above 40):

```
verb       E   D   C   B   A   S
damage    10  12  14  18  24  28
area       6   9  12  18  20  30   (area = wounding blast; set "size")
break     14  14  16  18  28  36   (goes through a guard: drills, spirals, crushing blows)
daze       7   6  10   8   8  14
pin        7  10  12  14  18  18
seal       9  10  13  10  17  19   (closes chakra: can't use jutsu for a while)
confuse    5   8  10  14  14  12
heal       -  18   -  10   -  40
conceal    8  10  12  11  16   -
sense      -  10  14   -   -   -
clone      6  10   8  10  10   -   (power = how many/how good)
substitute 6   9  12  14  14  18   (a swap or wall that takes one hit)
empower    -   8  10  14  12   -
shroud     -   -   -  11  18  22   (cast armour)
drain      6   6  10  12  12  28
afflict    -   6   6   6   8   8   (lingering burn/bleed/poison)
knock      6   6   8   8  10  10   (throws or pulls them to another distance)
trap      12  12  12  16  12   -
field      8  10  12  14  12   -   (mist/smoke/dust over the fight)
counter   12  12  14  18  12   -   (readied riposte)
move       -   7   6   8   8   8
```

Each effect is `{ "verb": "...", "power": n, ...its fields }`. Fields by verb (omit optional
ones unless they matter):

- damage: `hits` 2-5 for a flurry (optional)
- area: `size` "small" | "wide" | "vast" (vast is extremely rare: only a technique that levels a
  battlefield; wide for a big wave, sea of flame, rain of blades)
- field: `field` "mist" | "smoke" | "dust" (required)
- move: `to` "close" | "mid" | "far" (optional: where it takes the user)
- knock: `to` "close" | "mid" | "far" (required: where it leaves the target)
- afflict: `harm` "burn" | "bleed" | "poison" (required)
- pin: `channelled` true when the caster must keep holding it (e.g. a water prison)
- drain: `absorb` true if the chakra flows to the user
- trap: `dazes` true if it dazes whoever springs it
- substitute: `spins` true only for a rotating all-round defence (like Palm Rotation)
- shroud: `kind` "lightning" | "sand" | "earth" | "chakra" (required)
- empower: `boosts` array of stats from [strength, speed, stamina, taijutsu, ninjutsu, genjutsu,
  kenjutsu, fuuinjutsu, chakraControl, intellect, perception, willpower] (required, non-empty)
  AND `healthPerExchange` 1-20 (required: every power-up costs health each exchange)
- clone: `strikes` true for solid clones that hit back; `kind` "illusion" | "water" | "wind" |
  "earth" | "lightning" | "fire" | "shadow" (optional; follows the element when left out)
- daze, seal, heal, confuse, conceal, sense, break, counter: power only

Shape guidance:

- A plain attack: one damage. A big elemental wave or rain: area (wide). A drilling or spiralling
  strike that punches through guards: break. A strike that also stuns: damage then daze.
- A binding (prison, web, cocoon, shadow, chains, wood binding): pin. A paralysis: daze or pin.
- A wall, shield or dome that blocks an attack: substitute (with the element). Armour worn over the
  body: shroud.
- Hiding or camouflage: conceal. Mist: field mist. Sensing: sense.
- Fire that leaves burns: add afflict burn after the damage. Poison: afflict poison.
- Wind gusts that blow foes back: damage then knock to "far" (or "mid").
- Short-range only techniques: reach ["close"]. Mid: ["close","mid"]. Long: ["mid","far"].
  All ranges: ["close","mid","far"]. Leave null for clones, buffs, sensing and other self effects.
- accuracy "sure" for lightning blades, needles, iai and pinpoint strikes; "wild" for huge
  sweeping or crushing blows; else null.
- `lethal`: only for an assassination strike meant to kill in one blow (a lightning blade).
- `oncePerFight`: only for a trump card that exhausts its user.
- Sand techniques of Gaara and other sand users: add `dustCost` 15-40 (sand spent) and for big
  ones `dustDraw` 20-40 (sand pulled from the ground); element null.
- Clan: set `extras.clan` only for a hiden (secret clan) technique whose users all share a clan
  id from this list: uchiha, hyuga, nara, akimichi, yamanaka, aburame, inuzuka, uzumaki, kaguya,
  sabaku, akasuna, kamaitachi, sakyu, hozuki, hoshigaki, yuki. Otherwise omit.

## Output

Write the JSON array to the output path given to you, one object per task, same order. Validate
it parses (e.g. `python3 -c "import json;json.load(open(PATH))"`). Then reply with only: how many
drafts, duplicates and skips, and any task you were unsure about.
