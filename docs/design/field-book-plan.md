# The field book

The collections hook: an album in the Record tab of what you have caught, gathered, followed
and fought out in the world. Each page fills as you play; a full page leaves something for the
house or the shelf, never a stat. The state is `systems/collections`, the rules `game/fieldBook/`,
the view `game/views/fieldBook.ts` and `fieldBookEntries.ts`, the screen `ui/screens/FieldBook.tsx`.

## The pages

| Page         | Read from                                          | Full when                     | Leaves                          |
| ------------ | -------------------------------------------------- | ----------------------------- | ------------------------------- |
| Fish         | every fishing spot's catches (`fishWhere`)         | every fish caught             | A gyotaku print (wall), a float |
| Wild finds   | every wild place's finds and the camp's, not fish  | every find gathered           | A drying rack (corner), a knife |
| Recipes      | every recipe in the pack (already in `cooking`)    | every recipe learned          | A cook's knife                  |
| Night sights | the village's sights                               | every sight followed          | A paper lantern                 |
| Foes         | the foes you have fought, and those a report named | `FOES_PAGE_FULL` kinds beaten | A notched post                  |

Nobody meets every foe there is (the pooled senseis' foes alone run to dozens, and a save meets
a few), so the foes page fills at a number of kinds beaten rather than at all of them.

## What is written down

The `fieldBook` slice keeps counts only: each fish's catches with the longest one and its day,
finds gathered by hand, sights followed, each foe's fights and wins, and the pages already
rewarded. Recipes are read from `cooking`, so nothing is copied. Writing happens at the actions
that cause it (`fish`, `forage`, a camp's foraging, `followSight`, a mission fight's end), through
`game/fieldBook/record.ts`.

A fish's **length** comes from its kind's `length` range (`IngredientDef.length`, validated for
every fish on a spot), placed by a hash of the seed, the day and the spot (never the Rng), and
skewed so big ones are rare. The catch's chips say how long it was and whether it is a new best.

## Entries and hints

A filled entry says what you know: for fish, your best and how often, with the first place it
turns up (its numbers matter more than where it lives once found); the outcome for a sight; and
for a foe its description, how it stands against you now, its tricks once beaten (with their
counters, `traitNotes`) and what it leans on once known well (`FOE_KNOWN_AT` wins). A foe fought
but never beaten is a solid entry stamped "Not yet beaten".

An empty slot gives a hint and never the name ("Not yet caught", "Not yet learned"): where and
when for the wild pages, each place with its own hours ("The deep pool at the river, at night,
in autumn or winter, once your cooking reaches grade C"), the sight as anyone notices it
(`unseen`), where a recipe is taught. A foe named in a client's report you bought appears dashed
before you meet it. Long runs of empty slots fold away. The sights page is sealed (no slots,
one line saying why) for eyes that can never follow a sight.

A first catch or find says so on its chips ("New in your field book"), and each tab shows how
full its page is.

## Rewards

`noteFieldBook` runs in `dispatch` after anything changes the book or the recipes you know: each
page full and not yet rewarded hands over its piece (`content.fieldBook`, a furnishing with no
cost) and is marked, with a journal entry. The pieces are earned only here, so friends' gifts
pass them over. The keepsake shelf shows each full page's keepsake, in the order they filled.

## The day's sheet

The dawn snapshot keeps the book's entries as `kind:id` keys (`fieldBook/keys.ts`); the day's
end lists what is new as one line, "New in your field book: Sweetfish, Bandit Thug".

## Later

Roads and towns (places visited, road events met) as pages; techniques watched in fights (close
to mimicry, so held back).
