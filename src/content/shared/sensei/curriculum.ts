import type { CurriculumBeat } from '../../curriculum';

/**
 * What every sensei shows a new genin, in their own manner (`SenseiFeedback`); the order is
 * theirs, and most beats come just before the thing they are about (`game/sensei/curriculum.ts`).
 * Speech, never a manual: what a shinobi would say to a student, not how the game works.
 */
export const CURRICULUM: readonly CurriculumBeat[] = [
  {
    id: 'week',
    title: 'Your week',
    scene: '{sensei} hands you a slip with the days of the week marked on it.',
    says: {
      blunt:
        '“Those are the days I want you at {place}. One full lesson, the rest short. Come when I say and I’ll think better of you, and if you leave me standing there I’ll remember it. A job or a sickbed excuses you. Nothing else does.”',
      warm: '“These are the days I’ll be waiting for you at {place}. Once a week we’ll do a proper lesson, and the other days a short session. If you’re on a job or laid up, of course I understand. Otherwise, come, would you? It matters to me.”',
      socratic:
        '“Every mark on there is a day I’ll be at {place}. One is the real lesson, the rest are short. Why do you suppose I care more that you come than how well you do?”',
      competitive:
        '“My days at {place}, and yours now. One proper lesson a week and a few short ones. My last student never missed one, so that’s the mark to beat. Jobs and broken legs excepted.”',
      cryptic:
        '“Days are stones across a river,” {sensei.they} say{sensei.s}. “These are the ones I’ll be standing on, at {place}. Miss one and you get wet. A job or a fever is a bridge, and I won’t mind those.”',
    },
  },
  {
    id: 'drills',
    title: 'Drills',
    scene: '{sensei} keeps you back a moment to talk about drills.',
    before: '{sensei} catches you before you start and walks you along the drills.',
    says: {
      blunt:
        '“A drill builds what it works, and the better you get the less each one gives you. Pick one for what you need and do it till you can’t. Then eat, sleep and do it again.”',
      warm: '“Each of these builds a different part of you, a little at a time. It gets slower as you improve, and that’s nothing to be discouraged by. Choose what you need most, and rest when you’re spent.”',
      socratic:
        '“Look at what each one works before you choose. What do you need most right now? And why do you think the first weeks feel quicker than the later ones?”',
      competitive:
        '“I wore that post down to a stump at your age. Pick the drill for what’s weakest and go until your arms give out. It slows down as you get better, so get the easy part over fast.”',
      cryptic:
        '“Water wears the stone a little each day,” {sensei.they} say{sensei.s}. “Less, once the stone is smooth. Choose your stone, and come back tomorrow with more water.”',
    },
  },
  {
    id: 'spar',
    title: 'Sparring',
    scene: '{sensei} stops you on your way out to talk about sparring.',
    before: '{sensei} stops you before you square up.',
    says: {
      blunt:
        '“Decide what you’ll do before it starts, close in and far off, and keep one way of not getting hit ready. Then you find out if you were right. Losing to a teammate costs you nothing but pride, so lose a lot.”',
      warm: '“Go in with a plan for near and far, and always keep a way of stopping a blow ready. Then let it happen and watch what comes of it. Nobody minds losing here, I promise.”',
      socratic:
        '“What will you do if they rush you? And if they hang back? Decide both before you start, then watch which of your guesses was wrong.”',
      competitive:
        '“Have a plan for every distance and a guard you trust, then go and test it. I lost my first forty spars. See if you can do better than that.”',
      cryptic:
        '“The fight is won before it begins, and then it is watched,” {sensei.they} say{sensei.s}. “Know your near and your far, and keep a shield by the door.”',
    },
  },
  {
    id: 'board',
    title: 'The jobs board',
    scene: '{sensei} keeps you a moment to talk about the jobs board at the mission hall.',
    before: '{sensei} stops you in front of the notices.',
    says: {
      blunt:
        '“Chores inside the walls you do on your own. Anything past the gate, I’m coming with you. New work goes up every few days. Take what pays and what you can live through.”',
      warm: '“The little jobs in the village you can take by yourself. If it means going beyond the gate, I’ll be right there with you. There’s always something new in a day or two, so don’t worry about missing out.”',
      socratic:
        '“Which jobs on the board could you do alone, and which would you want me along for? Anything past the gate, you’ll have me. Work changes every few days, so what would you choose today?”',
      competitive:
        '“Village chores are yours alone. Outside the gate I lead. Fresh work every few days, and I want our team’s name on more of it than anyone else’s.”',
      cryptic:
        '“Inside the wall you walk alone,” {sensei.they} say{sensei.s}. “Outside it, we walk together. The board changes like the weather, so read it often.”',
    },
  },
  {
    id: 'prep',
    title: 'Before a job',
    scene: '{sensei} looks at your empty pouch and frowns.',
    before: '{sensei} checks your pouch before you set out.',
    says: {
      blunt:
        '“You went out with empty pockets last time. Buy kunai, smoke, salve, whatever the job wants, before you go. What you don’t use comes home with you.”',
      warm: '“Let’s make sure you’ve got a few things this time. A kunai or two, some salve. Anything you don’t use, you keep, so it’s never wasted.”',
      socratic:
        '“What did you wish you’d had with you last time? Buy it now, while you’re standing next to the shop. Whatever you don’t use comes home again.”',
      competitive:
        '“My pouch is never empty, and yours shouldn’t be either. Tools before the job, and bring back what you don’t throw.”',
      cryptic:
        '“An empty pouch is a closed hand,” {sensei.they} say{sensei.s}. “Fill it before the road, and it will still be full when the road is done, if you are lucky.”',
    },
  },
  {
    id: 'intel',
    title: 'Know what you face',
    scene: '{sensei} has a word about the clerk at the mission hall.',
    before: '{sensei} taps the clerk’s counter before you take the job.',
    says: {
      blunt:
        '“The client knows more than the notice says. Pay the clerk for the report and you’ll know every one of them and their tricks before you meet them. It costs less than the hospital.”',
      warm: '“The clerk can sell you the client’s own report. It tells you who you’ll meet and what they can do, and I’d feel so much better if you read it first.”',
      socratic:
        '“Who wrote that notice, and what did they leave out? The clerk sells the client’s report. Ask yourself what knowing would be worth, then decide.”',
      competitive:
        '“The best never walk in blind. Buy the report from the clerk, learn their tricks, and beat them before they’ve moved.”',
      cryptic:
        '“The notice is the face,” {sensei.they} say{sensei.s}. “The client’s report is the hands. Pay the clerk, and see the hands.”',
    },
  },
  {
    id: 'eat',
    title: 'Eat',
    scene: '{sensei} pushes a bowl in front of you.',
    says: {
      blunt:
        '“Hungry shinobi train slowly and fight worse. Eat before you work. A meal you cook yourself does more for you than a snack off a stall.”',
      warm: '“Eat, please. You can’t train well on an empty stomach, and you fight worse too. If you cook for yourself it does you even more good than stall food.”',
      socratic:
        '“How did your last drill go on an empty stomach? Eat first and compare. And try cooking your own, then tell me which keeps you going longer.”',
      competitive:
        '“I can outrun you hungry, but not for long. Eat before you train. A proper home-cooked meal beats anything off a stall.”',
      cryptic:
        '“The lamp needs oil before it gives light,” {sensei.they} say{sensei.s}. “A meal you make yourself burns longest.”',
    },
  },
  {
    id: 'cooking',
    title: 'Cooking',
    scene: '{sensei} asks whether you can cook, and doesn’t seem surprised by the answer.',
    before: '{sensei} watches you look over the pans.',
    says: {
      blunt:
        '“Learn to cook. A good dish carries you through the whole day, sharper and harder to kill. Grocers sell books of recipes, and friends teach theirs.”',
      warm: '“I love that you’re trying this. A good meal looks after you all day long. The grocer has recipe books, and people will share theirs once they know you.”',
      socratic:
        '“Why would a shinobi bother to cook well? Try a good dish before a hard day and you’ll have your answer. The grocer sells recipe books, and your friends know dishes you don’t.”',
      competitive:
        '“My cooking has won me more fights than my fists have. A proper dish keeps you sharp all day. Get a recipe book from the grocer and catch me up.”',
      cryptic:
        '“What goes into the pot comes out in the fight,” {sensei.they} say{sensei.s}. “Books from the grocer, and recipes from friends, and the rest is fire and patience.”',
    },
  },
  {
    id: 'pass',
    title: 'Leaving the village',
    scene: '{sensei} taps the pass {sensei.they} signed for you.',
    before: '{sensei} catches you at the gate and looks at the pass in your hand.',
    says: {
      blunt:
        '“Genin go out the gate on a job or with my pass. It lasts a week and covers the safe roads. Get yourself in trouble out there and I’ll hear about it.”',
      warm: '“This lets you go beyond the gate for a week, on the safe roads. Write to me if anything happens. I mean that.”',
      socratic:
        '“A pass for a week on the safe roads. Where will you go first, and what do you think you’ll find that you can’t find here?”',
      competitive:
        '“A week on the safe roads. I’d walked every one of them by your age. Go and catch up.”',
      cryptic:
        '“A road is only a road until someone walks it,” {sensei.they} say{sensei.s}. “The safe ones, for a week. Come back with more than you took.”',
    },
  },
  {
    id: 'permit',
    title: 'The library',
    scene: '{sensei} has a word about the library.',
    before: '{sensei} walks you as far as the library steps.',
    says: {
      blunt:
        '“You have the permit now. The open shelves go up to what a chūnin would know. Study a scroll and it’s yours, slowly. The restricted stacks can wait for your vest.”',
      warm: '“I’m so glad you’ve got the permit. Everything on the open shelves is yours to learn, up to what a chūnin would know. Take your time with it.”',
      socratic:
        '“The open shelves hold as much as a chūnin knows. Which scroll would you start with, and why that one? The restricted stacks are for later.”',
      competitive:
        '“Open shelves, up to chūnin. I read every scroll on them before my vest. The restricted stacks wait until you’ve earned one.”',
      cryptic:
        '“Every scroll was once someone’s whole life,” {sensei.they} say{sensei.s}. “The open shelves are yours now. Read slowly. The locked ones are patient.”',
    },
  },
  {
    id: 'exercise',
    title: 'Control',
    scene: '{sensei} watches you rub your sore feet after practice.',
    before: '{sensei} watches you set your feet against the bark.',
    says: {
      blunt:
        '“Practise every day. Chakra control comes from doing it over and over, not from talent. Master this and there are roads you can walk that are closed to you now.”',
      warm: '“A little every day and you’ll get there, I know you will. Once you’ve mastered it, whole roads open up that you can’t take yet.”',
      socratic:
        '“Why do you think control comes from repetition and not talent? Practise every day and see if you agree. And ask yourself where a shinobi who can do this could go.”',
      competitive:
        '“I could walk straight up a tree a week after I started. Practise every day and prove you’re quicker. Master it and the closed roads open.”',
      cryptic:
        '“The tree doesn’t want you on it,” {sensei.they} say{sensei.s}. “Ask it every day until it agrees. Then the roads you couldn’t walk will let you pass.”',
    },
  },
  {
    id: 'exam',
    title: 'The exam',
    scene: '{sensei} sits down beside you.',
    says: {
      blunt:
        '“Twice a year there’s the chūnin exam. I put a name forward when the student is ready, comes when I ask and has done enough work. Think about which of those you’re short of.”',
      warm: '“There’s an exam twice a year, for chūnin. I’d put you forward the moment I think you’re ready, if you keep coming to me and keep doing the work. No rush at all.”',
      socratic:
        '“Twice a year, the chūnin exam. What do you think I look for before I put a name forward? Readiness, turning up, enough work behind you. Which do you have?”',
      competitive:
        '“The chūnin exam comes round twice a year. I made it on my first try. Be ready, turn up, do the work, and I’ll put your name in.”',
      cryptic:
        '“Twice a year the gate opens,” {sensei.they} say{sensei.s}. “I walk a student to it when the student is ready, and has come when called, and has done the work. Not before.”',
    },
  },
];
