/**
 * The character on someone's name tag when nobody chose one: the first sound of their name in
 * hiragana, read from how the name is spelled. A name that doesn't begin with a Japanese sound
 * keeps its first letter.
 */

const VOWELS: Readonly<Record<string, string>> = { a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お' };

/** Consonant rows, each in a-i-u-e-o order; a gap is a sound the row doesn't have. */
const ROWS: Readonly<Record<string, string>> = {
  k: 'かきくけこ',
  g: 'がぎぐげご',
  s: 'さしすせそ',
  z: 'ざじずぜぞ',
  t: 'たちつてと',
  d: 'だぢづでど',
  n: 'なにぬねの',
  h: 'はひふへほ',
  b: 'ばびぶべぼ',
  p: 'ぱぴぷぺぽ',
  m: 'まみむめも',
  y: 'や ゆ よ',
  r: 'らりるれろ',
  w: 'わ   を',
  f: '  ふ  ',
  j: ' じ   ',
};

/** Spellings whose first sound is the `i` kana of a row: "sha" is し, "cho" is ち, "kyo" is き. */
const DIGRAPHS: Readonly<Record<string, string>> = { sh: 'し', ch: 'ち', ts: 'つ' };

const VOWEL_ORDER = 'aiueo';

/** Long vowels are written with a macron; the first sound is the plain vowel's. */
function plain(name: string): string {
  return name.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function kanaIn(row: string, vowel: string): string | null {
  const kana = row.charAt(VOWEL_ORDER.indexOf(vowel));
  return kana.trim() === '' ? null : kana;
}

function firstKana(spelling: string): string | null {
  const [a = '', b = '', c = ''] = spelling;
  if (VOWELS[a]) return VOWELS[a];
  const digraph = DIGRAPHS[a + b];
  if (digraph) return digraph;
  const row = ROWS[a];
  if (!row) return null;
  if (VOWEL_ORDER.includes(b)) return kanaIn(row, b);
  // A glide ("kyo", "ryu") starts on the row's i sound; a lone n is ん.
  if (b === 'y' && VOWEL_ORDER.includes(c)) return kanaIn(row, 'i');
  return a === 'n' ? 'ん' : null;
}

/** One character to stand for a name on a tag. */
export function sealFor(name: string): string {
  const spelling = plain(name);
  return firstKana(spelling) ?? name.trim().charAt(0).toUpperCase();
}
