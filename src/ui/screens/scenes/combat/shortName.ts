/**
 * The word that tells a fighter apart, and their seal's letter: "Bandit Archer" is Archer (A),
 * "Hungry Ghost 2" is Ghost 2 (G2), "Kaen" is Kaen (K).
 */
export function shortName(name: string): { readonly label: string; readonly mark: string } {
  const words = name.split(' ');
  const last = words.at(-1) ?? name;
  const numbered = /^\d+$/.test(last) && words.length > 1;
  const word = numbered ? (words.at(-2) ?? last) : last;
  return {
    label: numbered ? `${word} ${last}` : word,
    mark: numbered ? `${word.charAt(0)}${last}` : word.charAt(0),
  };
}
