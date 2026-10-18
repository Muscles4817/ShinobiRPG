/**
 * A place's name inside a sentence. Names written as titles ("The Lantern Archive") keep their
 * capital only at the start of a line, so mid-sentence the article drops to "the".
 */
export function placeInText(name: string): string {
  return name.replace(/^The /, 'the ');
}

/** A place mid-sentence: its own `inText` form where it has one ("the training ground"). */
export function placeInSentence(place: {
  readonly name: string;
  readonly inText?: string;
}): string {
  return place.inText ?? placeInText(place.name);
}
