/** Versus mode: any two fighters from a pack, head to head, in a sandbox that is never saved. */
export { createVersus, type VersusPick } from './match';
export { resolveVersus } from './resolve';
export { VERSUS_SIDE_MAX, versusProblem } from './sides';
export { VERSUS_GROUNDS, type VersusGround } from './grounds';
export { VERSUS_GROUPS, versusRoster, type VersusFighter, type VersusGroup } from './roster';
export {
  browseRoster,
  OPEN_FILTER,
  withGroup,
  type FacetOption,
  type GroupChoice,
  type RosterBrowse,
  type VersusFilter,
} from './filter';
export { versusProfile, type VersusProfile } from './profile';
