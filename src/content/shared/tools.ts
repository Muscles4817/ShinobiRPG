import type { ToolDef } from '../items';

/**
 * Fight tools every shinobi village sells, by the piece. Names are generic shinobi kit, so
 * every pack shares them.
 */
export const TOOLS: readonly ToolDef[] = [
  {
    id: 'smoke-bomb',
    name: 'Smoke bomb',
    description: 'Vanish from sight. Your next attack lands harder, then they see you.',
    cost: 30,
    icon: 'wind',
    effect: 'smoke',
  },
  {
    id: 'flash-tag',
    name: 'Flash tag',
    description: 'A burst of light that shows every hidden foe.',
    cost: 35,
    icon: 'lantern',
    effect: 'flash',
  },
  {
    id: 'explosive-tag',
    name: 'Explosive tag',
    description: 'A sealed blast at one foe. Armour can’t blunt it; spirits fear it.',
    cost: 45,
    icon: 'seal',
    effect: 'blast',
  },
  {
    id: 'soldier-pill',
    name: 'Soldier pill',
    description: 'Bitter, but it brings your chakra flooding back.',
    cost: 40,
    icon: 'pill',
    effect: 'chakra',
  },
  {
    id: 'wound-salve',
    name: 'Wound salve',
    description: 'Closes cuts and dulls the pain mid-fight.',
    cost: 35,
    icon: 'heal',
    effect: 'heal',
  },
  {
    id: 'clarity-charm',
    name: 'Clarity charm',
    description: 'Grip it to shake off an illusion’s confusion.',
    cost: 25,
    icon: 'charm',
    effect: 'clarity',
  },
];

export const TOOL_IDS: readonly string[] = TOOLS.map((t) => t.id);
