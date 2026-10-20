import type { ClanDef, ContentDb } from '@/content';

/**
 * The clans of the village you are born in: the start village's own. A clan of another village
 * (`ClanDef.village`, the Mist's houses) lives in its compound there, but is never offered at
 * creation or drawn into your year at the academy.
 */
export function homeClans(content: ContentDb): readonly ClanDef[] {
  return content.clans.all.filter(
    (c) => c.village === undefined || c.village === content.startLocationId,
  );
}
