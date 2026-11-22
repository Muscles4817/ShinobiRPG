import type { CombatantView, CombatView, FightBeat } from '@/game';

/**
 * Those the story has on the field at this beat who are gone by the end of it (a shadow clone
 * made and popped within the stretch), drawn in the body they wore (`CombatCastMember.like`).
 */
export function goneSince(view: CombatView, beat: FightBeat | undefined): CombatantView[] {
  if (!beat) return [];
  const standing = new Set(view.combatants.map((c) => c.id));
  return (view.cast ?? []).flatMap((member) => {
    // Once the story has them gone (a clone popped, a summons sent home), they leave the stage.
    const gone = !beat.present.includes(member.id) || !((beat.health[member.id] ?? 0) > 0);
    if (standing.has(member.id) || gone) return [];
    const body =
      view.combatants.find((c) => c.id === member.like) ??
      view.combatants.find((c) => c.side === member.side);
    if (!body) return [];
    const { id, name, side } = member;
    return [
      { ...body, id, name, side, maxHealth: member.maxHealth ?? body.maxHealth, statuses: [] },
    ];
  });
}
