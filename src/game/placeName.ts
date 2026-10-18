/**
 * A place's name inside a sentence. Names written as titles ("The Lantern Archive") keep their
 * capital only at the start of a line, so mid-sentence the article drops to "the".
 */
export function placeInText(name: string): string {
  return name.replace(/^The /, 'the ');
}
