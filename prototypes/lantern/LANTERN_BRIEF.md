# New techniques for the lantern pack (Shinobi RPG's own world)

The game's own setting is Tōrōgakure, the Village Hidden Among Lanterns: lanterns lit at dusk,
kilns and forges, rivers and fog, sacred ropes that bind the restless dead, lantern moths, ash,
cedar forest, bridges and gates, festivals, night watches. This pack ships in a paid release, so
**nothing may come from Naruto**: no names, no phrases, no recognisable signature moves
(no spiralling sphere in the palm, no lightning blade through a chest, no shadow possession, no
eight gates by that name, no "Style:"/"Release:" naming). Mechanics are free to borrow; identity
is not. `np/fan-names.json` lists every fan-pack technique name: never use one, or anything close.

## Voice (match the pack exactly)

Read `np/lantern-existing.json` (the pack's 214 learnable techniques) before writing. Names are
short, plain English and concrete, often from crafts, places and weather: "Kiln Spark", "Tide
Lash", "Banked Coals", "Still Water", "Mending Line", "Falling Lintel", "River-Turning Throw",
"Buried Lantern", "Ash Sweep", "Pinwheel Blade". Two to four words, no colons except a school's
own pattern. Descriptions are ONE sentence (two short ones at most), present tense or plain
imperative, vivid and physical, no numbers, often a small image from village life: "A rising cut
that snuffs a lantern flame without touching the paper." / "Not a thousand. Four, shallow and
quick, and every one of them keeps bleeding." Never copy a description from anywhere.

## What each new technique is

```
{
  "id": "kebab-case, unique, not used in np/lantern-existing.json",
  "name": "...", "description": "...",
  "discipline": "taijutsu | ninjutsu | genjutsu | kenjutsu | fuuinjutsu",
  "element": "fire | wind | lightning | earth | water | null",
  "needsNature": true for elemental rank B and up, else false,
  "rank": "E|D|C|B|A|S",
  "reach": ["close","mid","far"] subset or null (the art's usual),
  "accuracy": "sure | steady | wild | null",
  "effects": [ { "verb": ..., "power": n, ...fields } ],
  "extras": { optional: "lethal", "oncePerFight", "needsTarget": "open", "moulded", "swarmCost", "dustCost", "dustDraw" },
  "home": { "kind": "shelf" } | { "kind": "clan", "clan": "<id>" } | { "kind": "school", "school": "<exact school name>" },
  "template": "the mechanics-catalogue line you based it on, or 'new'",
  "note": "one short line: the idea"
}
```

Verbs and their fields are exactly as in `BRIEF.md` (same folder): damage (hits 2-5), area (size
small/wide/vast; vast almost never), field (mist/smoke/dust), move (to), knock (to, required),
afflict (harm burn/bleed/poison), pin (channelled), drain (absorb, will), trap (dazes),
substitute (spins), shroud (kind lightning/sand/earth/chakra), empower (boosts + healthPerExchange
1-20, both required), clone (strikes, kind), and power-only daze, seal, heal, confuse, conceal,
sense, break, counter. Kenjutsu is held-weapon work (it requires a blade in hand). A body move
(taijutsu or kenjutsu with no element) costs breath; `moulded` makes it a chakra move.

## Power scale (this pack's own medians by rank; stay near them, never above 40)

```
verb       E   D   C   B   A   S
damage    10  12  16  19  24  26
area       -  10  10  13  18  20  (blasts are rarer and weaker here; wide for real waves only)
break      -  13  12  18  22  26
daze       6   6   6   8  10  12
pin        6  10  12  15  18  20
seal      10   9  16  12  17  24
confuse    -   8   8  13  17  16
heal       -  18   -  20  14   -
conceal    -  10   8  12  14   -
sense      -  10  14   9   -   -
clone      6  10   9   -  16   -
substitute 6   8  11  14  16   -
empower    -   -  12  14  18  26
shroud     -   -   8  12  16   -
drain      -   6  10  13  14   -
afflict    6   5   6   8   7   -
knock      6   6   8   9  10   -
trap       -   8  14  16  16  16
field      7   8  12  14  16  20
counter    -  12  15  17  18   -
move       -   7   6   8   8   -
```

## Where it lives (`home`)

- `shelf`: a standard technique anyone may learn: ranks **E–A only** (E–D go on the academy rack,
  C–A in the library). Never S on a shelf.
- `clan`: only that clan learns it, taught by the clan's teacher. Keep to the clan's identity
  and mechanics: hibana (fire, lantern-lighters, hot-tempered), tokaku (genjutsu of the dead,
  Spirit Sight), kurogane (smiths and swordsmen: kenjutsu, blades folded with chakra), shimenawa
  (sacred ropes: fūinjutsu binds and wards), toga (lantern moths: a HIVE; every Tōga technique
  spends insects with `extras.swarmCost` 10-45, as their existing ones do), haibara (ash: DUST;
  every Haibara technique spends `extras.dustCost` 15-45 or pulls up `extras.dustDraw` 30-50).
  May include one S per clan (a trump card, `oncePerFight`).
- `school`: a fighting school's own form, taught by its teachers. Read the school's existing
  techniques and extend its style; one A or S at most per school.

## Variety

Cover the shapes a fighter needs: close attacks, ranged attacks, flurries, an area or two,
walls and swaps (substitute), cast armour (shroud), binds (pin), dazes and seals, illusions
(confuse/daze for genjutsu), sensing and hiding, a power-up. Use `np/MECHANICS.md` (shapes proven
in the fan pack's 801 techniques) for the effect lists; put the shape's line in `template`.

## Output

Write a JSON array to your output path. Validate it parses and that every id and name is
unique and absent from `np/lantern-existing.json` and `np/fan-names.json`. Reply with only: how
many you wrote, by home and rank, and anything you were unsure about.
