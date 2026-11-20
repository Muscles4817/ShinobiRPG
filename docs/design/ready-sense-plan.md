# A ready sense: hiding, finding and attacks you can't see

Agreed with the owner in conversation (20 November). Nothing here is built yet. It replaces the
"what you can see" rule on the `what-you-see` branch, which treated everyone as equally blind to
a hidden attacker; that rule's sight and travel reading stays, read through the sense below.

## Why

Today hiding costs the hider a turn, and finding them costs the seeker a turn and a slot (Search,
or a sensing technique). Either the hiding works and the searching is wasted, or it doesn't and
the hiding was. Everyone in a fight is always paying attention, so paying attention shouldn't be
a turn. And how much of a hidden attack you still feel coming is the same question as whether
you find the hider: one rule should answer both.

## The rule

- **One ready sense for the whole fight**, set on the plan screen beside the defences. A fighter
  doesn't know which distance a hider is at, so it can't be per distance.
- **Plain senses are the default**: eyes and ears, as good as your perception, costing nothing.
- **Or a sensing technique kept ready** in their place: a nose, a hand on the ground, a chakra
  sense, a sound sense. Each says, as data on the technique, what it catches, what blunts it and
  what keeping it ready costs (below).
- **Every exchange, as your turn begins, the ready sense tries** against each hidden foe: a
  modest chance, by the sense against how well they hid, rising with every glimpse they give
  (an attack, a failed search, as exposure does today). Found, they are no longer hidden.
- **Search stays as "focus your senses"**: an action that spends the turn for a much stronger
  try with your ready sense. Waiting on the background chance or spending a turn to look
  properly is the player's choice. A sensing technique that finds in one go (Iruka's palm to the
  ground) is the strong form of that focus.
- **An attack from a hider you haven't found is read worse** (`rules/sight.ts`), by how little of
  that way of hiding your ready sense picks up: a nose that has their scent feels the blow
  coming; eyes looking the wrong way don't.
- **All-seeing eyes** are simply the strongest ready sense: nothing hidden is hidden from them.
  **Eyes that see it coming** (foresight) read what they look at; they give nothing against an
  attack from behind, though they may help a focused search.

## Ways of hiding

Hiding is not one thing. Each way has what makes it good and what sees through it.

| Way                   | How it's done                                                          | Hidden as well as           |
| --------------------- | ---------------------------------------------------------------------- | --------------------------- |
| Cover                 | behind trees, in a crowd, in shadow; only where the ground gives cover | **stealth**                 |
| Camouflage            | a technique that blends the body into what's around it                 | the technique, with stealth |
| Illusion              | a genjutsu that hides the body from the mind                           | genjutsu and chakra control |
| Suppressed chakra     | the body's chakra drawn in so a chakra sense finds nothing             | chakra control              |
| Underground or inside | in the earth, in water, inside a summon                                | the technique               |

**Stealth** will become a stat of its own when progression gets its pass. Until then it is read
from what exists, never from taijutsu or speed (being quick or strong doesn't keep you hidden):
for now, perception and intellect (knowing where eyes won't go).

## Which sense catches which way

Graded strong, some, or none. A strong match finds often; none never does.

|                    | Cover  | Camouflage | Illusion | Suppressed chakra | Underground |
| ------------------ | ------ | ---------- | -------- | ----------------- | ----------- |
| Plain senses       | some   | none       | none     | some              | none        |
| Nose               | strong | strong     | some     | strong            | some        |
| Hand on the ground | some   | strong     | strong   | strong            | strong      |
| Chakra sense       | strong | strong     | strong   | none              | strong      |
| Sound sense        | strong | some       | some     | some              | none        |
| All-seeing eyes    | strong | strong     | strong   | strong            | strong      |

These are the starting grades. Each sensing technique sets its own on its data, so a new sense is
a new row with no code.

## What a sensing technique says about itself

- **What it catches**: its grade against each way of hiding.
- **What blunts it**: rain, smoke, mist or another field (`rules/verbs/field.ts`), noise, a target
  off the ground or on water, its user not on solid ground.
- **What keeping it ready costs**:
  - chakra each exchange, as veiled eyes cost;
  - hands, which means no Counter;
  - a crouch or stillness, which means no Dodge, or no stepping;
  - attention, a lesser Dodge or Counter.

  A nose costs nothing, a hand on the ground costs your hands and your feet, and a chakra sense
  costs chakra.

## What the player is told

By perception, how a foe hid: a sharp observer hears "Goro's chakra is gone" where a dull one
hears "Goro is gone". That is the moment of choice the owner described: keep the sense you have,
or change it for one that catches this way of hiding. The words depend on the way of hiding and
the ground; they need a content pass of their own.

The plan screen shows the ready sense beside the defences, what it costs to keep, and against a
foe seen to hide, how well it catches the way they hid, in words.

## Foes and teammates

They keep a ready sense too: their kit's best by default. A mind that reads the fight changes it
between rounds once it has read how its foe hides, as it changes its defences now.

## Content pass

- The 11 sensing techniques (`sense`) get their data: what they catch, what blunts them, what
  they cost to keep ready.
- The 36 hiding techniques (`conceal`) each say their way of hiding.
- Grounds say how much cover they give, which they partly do already.
- The lines that tell how someone hid, by way, ground and the observer's perception.

## What changes for saves and plans

- Sensing techniques leave the slots: a plan that slotted one keeps it as its ready sense, and a
  slotted Search stays (it is the focus).
- The ready sense is kept with the plan between fights, like the defences.

## How we'll know it works

Benches are where to look, not targets: a hider who never attacks should stay hidden for a while
against plain senses and be found quickly against the right sense; a hider who attacks gives
itself away; no single sense should be the right one against every way of hiding. Anything that
looks off comes back to the owner before anything is tuned.

## Open

- How strong the passive try is against the focused one: set by play, then measured.
- Echolocation and other unusual senses: each written when a technique needs it.
