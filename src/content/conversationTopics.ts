import type { TopicKind } from './people';

/**
 * The words every topic of a kind supplies, and so the only `{slots}` a conversation about
 * that kind may use (besides `{you}` and `{them}`). A *phrase* goes mid-sentence and starts
 * in lower case; a *line* is one or two whole sentences; a *quote* is something the person
 * says, in their own voice, without quotation marks (the template adds them). Words that speak
 * of the person in narration use their pronoun slots (`{them.they}`, `{them.their}`, `{them.s}`…),
 * never a bare "they", so a line agrees with whoever says it.
 */
export const TOPIC_SLOTS: Readonly<Record<TopicKind, Readonly<Record<string, string>>>> = {
  specialty: {
    art: 'The art’s name in lower case, e.g. “taijutsu”.',
    practice: 'Phrase: what they drill every day, e.g. “a thousand kicks at the post”.',
    pride: 'Line: something they did in the art that they are quietly proud of.',
    doubt: 'Line: what they fear they will never get right in it.',
    dream: 'Phrase: the feat or technique they want to master one day.',
    advice: 'Quote: a piece of advice about the art they would give you.',
    keepsake: 'Phrase: a small object tied to the art, worth giving to a close friend.',
  },
  trait: {
    habit: 'Phrase: an everyday habit that shows the trait.',
    story: 'Line: a short tale from the academy days that shows the trait.',
    cost: 'Line: a time the trait cost them something.',
    admission: 'Quote: what they would only admit about it to a close friend.',
    wish: 'Phrase: who or what they wish they could be like instead, now and then.',
  },
  clan: {
    clan: 'The clan’s name, e.g. “the Hibana”.',
    duty: 'Phrase: what the clan expects of its children.',
    elder: 'Phrase: a relative who looms large, e.g. “my grandmother, who …”.',
    rite: 'Phrase: a clan rite or custom an outsider rarely sees.',
    burden: 'Line: what weighs on them about being one of the clan.',
    secret: 'Quote: a clan matter they would only tell someone they are bonded with.',
  },
  role: {
    work: 'Phrase: what fills their days in this role.',
    weight: 'Line: what is hard about the role that outsiders don’t see.',
    memory: 'Line: a memory from when they were starting out.',
    hope: 'Quote: what they hope for you.',
  },
};

/** Slots any conversation may use, besides the pronoun forms of `{them}` (`{them.their}`). */
export const NAME_SLOTS: readonly string[] = ['you', 'them'];
