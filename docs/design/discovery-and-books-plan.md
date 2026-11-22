# Discovery and the books: notes for later

Status: **ideas, not started.** Written down from a conversation so the work can be picked up
later. Nothing here is decided beyond the direction; each part needs its own plan before code.

Four connected ideas:

1. A **bestiary** you are given, by someone in the world.
2. A **bingo book** of shinobi you fill in by fighting and watching them.
3. **Harvesting** parts from beasts (a separate system, later).
4. **Finding the village's places** rather than seeing them all on day one.

The common thread: the game is very wide, and a new player meets all of it at once. Each thing
should be _introduced_ by something natural in the world, always with more than one way in.

## What exists today

- **The field book's foes page** (`game/fieldBook/`, `docs/design/field-book-plan.md`) counts
  each kind of foe fought and beaten (`fieldBook.foes`), and a foe's entry grows: description,
  how it stands against you, its tricks and counters once beaten (`traitNotes`), what it leans
  on once known well (`FOE_KNOWN_AT`). Foes a bought client's report named appear dashed. The
  page fills at `FOES_PAGE_FULL` kinds beaten. So the bestiary's data mostly exists; what is
  missing is a book of its own, a person who gives it to you, and beasts kept apart from people.
- **The bingo book** is planned the other way round in `docs/design/jonin-kage-plan.md`
  (renown): past a threshold _you_ are listed, foes scout you and hunters come. Not built.
- **No harvesting**, no buyer of parts.
- **Towns are found** (`game/atlas.ts`: famous, heard of, been to), but **every place in a
  village is shown from the start**.
- **The sensei curriculum** (`game/sensei/curriculum.ts`, decision 27) already tells each thing
  once, just before it is first needed, and locks nothing. Anything below has to fit with it.

## 1. The bestiary

**The idea.** You kill a beast (a hog, say) and keep a part of it (a tusk). Trying to sell it,
someone points you to a person who buys animal parts: a new place in the village you didn't
know of. Once you've been, they ask what you know of beasts and give you a bestiary: an empty
one, or one they made for someone (a nephew who died), which can be a small story of its own
through the bond with them.

**Notes.**

- Keep recording from the first fight, as the foes page does now. The book arrives already
  holding what you've met ("it already knows the hog you killed") rather than starting blank.
- Several ways in, never one: the parts buyer; a hunter or a vet; a sensei with a nature lens;
  a road traveller; a job's reward; a library shelf.
- Beasts only (the bestiary's animals, chakra beasts, maybe summons seen). People go in the
  bingo book. That likely means splitting today's foes page by kind of foe.
- Entries grow by what you've done: seen, fought, beaten, harvested, studied (and later what
  its parts are worth and to whom).
- Field book interplay: either the bestiary becomes a page of the field book once given, or the
  foes page moves out into it. Decide in the plan.

## 2. The bingo book

**The idea.** A book of shinobi: famous names already listed with blank faces (question-mark
portraits, a rumour), filling in as you fight, spar with and watch them. It teaches the player
what kinds of techniques and fighters exist in the game.

**Ways in (several):** your first fight with a foreign shinobi; a sensei of a mercenary mission
posture, or anyone who says "looking to make some extra money?"; watching the exam finals; a
bounty board in a rougher town; a job that hands one over.

**Pages fill by stage, never numbers**, read from what scouting and the fight already know:

| Stage      | How                       | Shows                                       |
| ---------- | ------------------------- | ------------------------------------------- |
| Unheard of | —                         | nothing                                     |
| A name     | famous, or a rumour heard | name, village, a line of legend, blank face |
| Glimpsed   | watched or fought once    | face, fighting style, threat against you    |
| Read       | fought or sparred more    | the cards you've seen them use, their kit   |
| Known      | many bouts                | what they lean on, what beats them          |

- Generated genin, your rival and your classmates can have pages too, so sparring counts.
- Reads from the same sources as scouting (`game/scouting.ts`) and the fight's reads
  (`plan/reads.ts`), so what the book says is what the fight does.
- Ties to renown later: bounties, and eventually a page about **you** (the jōnin plan's
  "you are listed"). The last page you ever see could be your own.
- Rogue path (milestone 5): the same book read from the other side.

## 3. Harvesting (a separate system, later)

**The idea.** After killing a beast, take parts from it: horn, hide, fangs, meat. Better skill
and better tools give more and finer materials, sold for money or used.

**Notes.**

- The bestiary does **not** need the full system. A first cut: a beast drops one part, one
  buyer pays for it. Enough to set off the meeting in section 1.
- The full version: a skill that grows with the work (like cooking or puppet craft), tools
  sold at a gear place, part quality by skill, tool and how the beast died, buyers who want
  different parts.
- Uses to connect later: cooking (meat), puppetry materials, gear, companions (a vet or a
  handler's interest), offerings to a summoning contract.
- Where it happens: after a fight against a beast on a job, a venture or a road event.

## 4. Finding the village's places

**The idea.** Start the game knowing only some places, and learn the rest naturally, always
more than one way. What you know at the start depends on who you are:

- A poor kid who ate badly at home knows the cheap noodle counter, not the market.
- A clan heir who never bought their own food doesn't know where the market is at all.
- Poorer teammates showing you around is a way to show class.

**Notes.**

- **One rule, not hand-written triggers.** A place is known when: your upbringing, clan or
  standing knows it; someone shows you or sends you there (a teammate, a sensei, a shopkeeper);
  you're sent there by a job or the curriculum; or you come across it. This is the atlas idea
  brought inside the village; build it the same way (a slice of known places, a happening that
  adds them, a validation that every place has a way in).
- **Fit with the curriculum.** Today it tells things and locks nothing. Either it becomes one
  of the ways a place is revealed, or there will be two tutorial systems pulling against each
  other. Decide that first.
- **Never a dead end.** A place reachable through only one person is stuck if that bond never
  happens. Always a fallback inside the world: ask around at the gate, or someone who will point
  you anywhere for a few ryo, so nothing is more than a small cost away.
- **Don't punish players who know the game.** Probably a setting, or the fallback above, so
  hiding things doesn't feel like a chore on a second playthrough.
- Saves: existing saves start knowing every place (migration).
- The UI's "locked content folds away" rule applies: an unknown place shows nothing, or a hint
  once you've heard of it.

## Suggested order

1. Finding the village's places (the structural one; the books then use it for their buyer and
   bounty board).
2. The bestiary with the minimal harvest drop and the parts buyer.
3. The bingo book.
4. Full harvesting.
