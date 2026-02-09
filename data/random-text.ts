export type RandomTextPair = {
  top: string;
  bottom: string;
};

export type MemeTag =
  | 'awkward'
  | 'chaos'
  | 'confused'
  | 'tired'
  | 'sassy'
  | 'win'
  | 'fail'
  | 'suspicious'
  | 'overthinking'
  | 'relief';

const defaultPairs: RandomTextPair[] = [
  { top: 'WHEN YOU HIT', bottom: 'THE RANDOM BUTTON' },
  { top: 'EXPECTATIONS', bottom: 'REALITY' },
  { top: 'NO INTERNET', bottom: 'NO PROBLEM' },
  { top: 'JUST ONE MEME', bottom: 'THEN SLEEP' },
  { top: 'OFFLINE MODE', bottom: 'ONLINE ENERGY' },
  { top: 'ME: JUST ONE', bottom: 'ALSO ME: 47 TABS' },
];

export const textByTag: Record<MemeTag, RandomTextPair[]> = {
  awkward: [
    { top: 'WHEN YOU WAVE BACK', bottom: 'AND IT WASN'T FOR YOU' },
    { top: 'ME TRYING TO', bottom: 'EXIT A CONVERSATION' },
    { top: 'I SAID "YOU TOO"', bottom: 'AT THE WRONG TIME' },
    { top: 'THIS IS FINE', bottom: 'NO ONE NOTICED' },
    { top: 'SMILE AND NOD', bottom: 'SMILE AND NOD' },
  ],
  chaos: [
    { top: 'I OPENED ONE APP', bottom: 'AND CHOSE VIOLENCE' },
    { top: 'TODAY'S ENERGY', bottom: 'UNHINGED' },
    { top: 'TASK LIST:', bottom: 'SURVIVE' },
    { top: 'ME MULTITASKING', bottom: 'BADLY' },
    { top: 'NO THOUGHTS', bottom: 'JUST CHAOS' },
  ],
  confused: [
    { top: 'ME READING THE', bottom: 'SAME LINE 4 TIMES' },
    { top: 'WAIT…', bottom: 'WHAT DOES THIS DO' },
    { top: 'I'M NOT LOST', bottom: 'I'M EXPLORING' },
    { top: 'BRAIN BUFFERING', bottom: 'PLEASE WAIT' },
    { top: 'THIS LOOKS EASY', bottom: 'I AM NOT EASY' },
  ],
  tired: [
    { top: 'TIRED BUT', bottom: 'STILL ONLINE' },
    { top: 'I'LL SLEEP', bottom: 'AFTER THIS MEME' },
    { top: 'ENERGY: 2%', bottom: 'EFFORT: 100%' },
    { top: 'NAP SCHEDULED', bottom: 'EVERY 20 MINUTES' },
    { top: 'DO NOT DISTURB', bottom: 'EXCEPT FOR SNACKS' },
  ],
  sassy: [
    { top: 'I'M NOT RUDE', bottom: 'I'M EFFICIENT' },
    { top: 'SAY IT WITH ME', bottom: 'NOPE' },
    { top: 'NEW ME', bottom: 'SAME ATTITUDE' },
    { top: 'THE AUDACITY', bottom: 'IS LOUD TODAY' },
    { top: 'I'M LISTENING', bottom: 'BUT I'M NOT AGREEING' },
  ],
  win: [
    { top: 'SMALL WIN', bottom: 'STILL A WIN' },
    { top: 'I DID THE THING', bottom: 'LOOK AT ME GO' },
    { top: 'PROGRESS:', bottom: 'NOTHING CAN STOP ME' },
    { top: 'CHECKED IT OFF', bottom: 'CELEBRATION TIME' },
    { top: 'SURVIVED MONDAY', bottom: 'A CHAMPION' },
  ],
  fail: [
    { top: 'NAILED IT', bottom: 'BACKWARDS' },
    { top: 'ME: EASY', bottom: 'ALSO ME: PANIC' },
    { top: 'THIS COULD WORK', bottom: 'IT DID NOT' },
    { top: '0% PLAN', bottom: '100% HOPE' },
    { top: 'TRUST THE PROCESS', bottom: 'THE PROCESS FAILED' },
  ],
  suspicious: [
    { top: 'I DON'T TRUST', bottom: 'THIS "GOOD NEWS"' },
    { top: 'ME WHEN THE', bottom: 'MATH IS TOO EASY' },
    { top: 'WAIT A MINUTE', bottom: 'SOMETHING'S OFF' },
    { top: 'SOUNDS GREAT', bottom: 'I'LL READ THE FINE PRINT' },
    { top: 'I'M NOT JUDGING', bottom: 'I'M INVESTIGATING' },
  ],
  overthinking: [
    { top: 'I SAID HI', bottom: 'NOW I'M REPLAYING IT' },
    { top: 'ME AT 2 AM', bottom: 'REVIEWING TODAY' },
    { top: 'ONE SMALL DETAIL', bottom: 'BIG SPIRAL' },
    { top: 'I'M FINE', bottom: 'BUT MY THOUGHTS ARE NOT' },
    { top: 'JUST RELAX', bottom: 'BRAIN: ABSOLUTELY NOT' },
  ],
  relief: [
    { top: 'THAT WAS CLOSE', bottom: 'WE MADE IT' },
    { top: 'CRISIS AVERTED', bottom: 'SNACK TIME' },
    { top: 'I FIXED IT', bottom: 'DO NOT TOUCH IT' },
    { top: 'WE'RE GOOD', bottom: 'EVERYTHING'S FINE' },
    { top: 'PANIC OVER', bottom: 'VIBES ON' },
  ],
};

export const getRandomTextPair = () => defaultPairs[Math.floor(Math.random() * defaultPairs.length)];

export const getRandomTextPairForTags = (tags?: MemeTag[]) => {
  if (!tags || tags.length === 0) return getRandomTextPair();
  const pool = tags.flatMap((tag) => textByTag[tag] ?? []);
  if (pool.length === 0) return getRandomTextPair();
  return pool[Math.floor(Math.random() * pool.length)];
};
