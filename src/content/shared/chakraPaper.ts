import type { ChakraPaperText } from '../settingText';

/** The chakra paper test: how each nature shows itself. Setting-neutral, so every pack can use it. */
export const CHAKRA_PAPER_TEXT: ChakraPaperText = {
  heading: 'Chakra paper',
  speech:
    '{sensei} takes a slip of thin, pale paper from a pouch and holds it out to you. “Grown from trees fed on chakra. It answers to yours. Push your chakra into it, and we will both know what you are made of.”',
  prompt: 'Push your chakra into the paper',
  results: {
    fire: 'The paper chars from the middle outwards and crumbles to warm ash in your fingers.',
    wind: 'The paper splits clean down the middle, as if cut by a blade you never held.',
    lightning: 'The paper crinkles all over in a hundred tiny folds, crackling as it goes.',
    earth: 'The paper dries and turns to grit, and sifts out between your fingers.',
    water: 'The paper darkens and goes heavy and damp, with water that came from nowhere.',
  },
  verdict: '“So that is what you are,” {sensei} says. “Good. Now we know what to work on.”',
};
