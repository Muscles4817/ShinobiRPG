# Making a home

The home hook: a place that grows with you, from a rented room to a house of your own, filled
with furniture that does something and keepsakes that remember. The code is `game/home/`,
`systems/housing/home.ts`, the content in `content/homes.ts` and each pack's `homes.ts`.

## The ladder

A pack's `homes` (`HomeDef`) are let and sold at a **lettings** place (the land office, with
the joiner next door). The home you start in is not on the list: it is your rented room (or
your room in the clan's house) with four spots.

| Home (original pack)              | How                   | Needs           | Opens                     |
| --------------------------------- | --------------------- | --------------- | ------------------------- |
| Room above the noodle stand       | Rent, 30 a week       | Where you start | Four spots                |
| A flat on Lantern Row             | Rent, 70 a week       | Three jobs      | A hearth                  |
| A townhouse in the dyers' quarter | Rent 150 or buy 4,000 | Chūnin          | Garden, yard, guest room  |
| A walled house above the river    | Buy 12,000            | Jōnin           | Sealed: not built yet     |
| A compound of your own            | Founded, never bought | Jōnin           | Sealed: comes with legacy |

Moving (`moveHome`) pays the price, or the first week's rent. Furniture you own comes with you;
what stood in a spot the new home lacks is kept but put away. A garden starts bare in every new
home, and a guest stays only where there is a guest room. Clan children climb the same ladder
from their room in the clan's house.

## Furniture

Each home has **spots** (bed, desk, wall, corner, hearth). A piece (`FurnishingDef`) stands in
one spot, adds comfort (1–3) and does one small thing, read at one hook and only while you are
at home (`comforts` in `game/home/home.ts`):

| Effect   | Hook                      | Pieces                           |
| -------- | ------------------------- | -------------------------------- |
| `sleep`  | a night's healing at home | cotton futon, silk-lined futon   |
| `nap`    | a nap's energy at home    | kettle and brazier               |
| `study`  | scroll study at home      | low desk, lacquered writing desk |
| `guests` | a dinner you host at home | low table, sunken hearth         |
| `decor`  | comfort only              | scrolls, a bonsai                |

Comfort adds up to a step (Bare, Lived-in, Comfortable, Homely, A real home), and each step
makes a dinner at home worth one more bond (`homeWelcome`). Every new home starts with the
`starter` pieces (a straw futon). The finest pieces have no price: a friend who becomes a
close friend brings the first one you don't own (`noteHomeGifts`, from `dispatch`).

## Rooms

- **Garden:** beds that grow kitchen ingredients from seed (`GardenCrop`: days, seasons, seed
  cost); a ripe bed gives two to the pantry.
- **Yard:** the home's drills (`yardTrainingIds`) at less energy than the training ground
  (`YARD_ENERGY`): no walk there and back.
- **Guest room:** a friend (bond: friend or closer) moves in, and is at your home every
  evening and night (`whereNow`), so dinner and talk are always on.

## Keepsakes

The shelf is read from what already happened, never bought (`views/keepsakes.ts`): a memory
shared with someone on a job, a race won against your rival, the vest of each rank. Nothing
there does anything in a fight.

## Next

The walled house and the compound open with jōnin work and legacy: a dojo for pupils, a bath, a
library alcove, a crest on the gate and the people who live there.
