import type { CurriculumBeat } from '../../curriculum';

/** What every sensei shows a new genin; the order is theirs. */
export const CURRICULUM: readonly CurriculumBeat[] = [
  {
    id: 'drills',
    title: 'Drills',
    text: '{sensei} walks you round the training ground. “A drill grows what it works, a little each time, and less as you get good. Pick the one for what you need and do it until you can’t. Eat and sleep, and do it again.”',
  },
  {
    id: 'spar',
    title: 'Sparring',
    text: '“Fights are planned, then watched,” {sensei} says. “Set your cards, keep a defence, then see what happens. Spar a teammate at the training ground. Losing to a friend costs nothing but pride.”',
  },
  {
    id: 'board',
    title: 'The jobs board',
    text: '{sensei} taps the notices at the mission hall. “Chores in the village you do alone. Anything that takes you out the gate, I come with you. New work goes up every few days. Take what pays and what you can survive.”',
  },
  {
    id: 'prep',
    title: 'Before a job',
    text: '“You went out with empty pockets,” {sensei} says. “Buy tools before a job, kunai, smoke, salve. What you don’t use comes home with you.”',
  },
  {
    id: 'intel',
    title: 'Know what you face',
    text: '“The client knows more than the notice says,” {sensei} says. “Pay the clerk for their report and you’ll know every foe and their tricks before you meet them. It’s cheaper than the hospital.”',
  },
  {
    id: 'eat',
    title: 'Eat',
    text: '{sensei} pushes a bowl at you. “Hungry shinobi train slowly and fight worse. Eat before you work. A proper meal you cook yourself does more than a snack from a stall.”',
  },
  {
    id: 'cooking',
    title: 'Cooking',
    text: '“Learn to cook,” {sensei} says. “A good dish carries you through a day: sharper, steadier, harder to kill. Grocers sell books of recipes. People teach theirs to friends.”',
  },
  {
    id: 'pass',
    title: 'Leaving the village',
    text: '{sensei} signs a slip. “Genin go out the gate on a job, or with my pass. It lasts a week and covers safe roads. Get yourself in trouble out there and I’ll hear about it.”',
  },
  {
    id: 'permit',
    title: 'The library',
    text: '“You have the permit now,” {sensei} says. “The open shelves are standard techniques up to chūnin level. Study a scroll there and it’s yours, slowly. The restricted stacks wait for your vest.”',
  },
  {
    id: 'exercise',
    title: 'Control',
    text: '“Practise every day,” {sensei} says, nodding at the marks on the bark. “Chakra control comes from repetition, not talent. When you master it, roads open that were closed to you.”',
  },
  {
    id: 'exam',
    title: 'The exam',
    text: '{sensei} sits down next to you. “Twice a year there’s an exam. Chūnin. I put names forward when I think a student is ready, when they come when I ask, and when they’ve done enough work. Think about it.”',
  },
];
