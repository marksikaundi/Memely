export type RandomTextPair = {
  top: string;
  bottom: string;
};

export const randomTextPairs: RandomTextPair[] = [
  { top: 'WHEN YOU HIT', bottom: 'THE RANDOM BUTTON' },
  { top: 'ME: JUST ONE', bottom: 'ALSO ME: 47 TABS' },
  { top: 'EXPECTATIONS', bottom: 'REALITY' },
  { top: 'I OPENED THE APP', bottom: 'NOW I AM A MEME' },
  { top: 'BRAIN SAYS NO', bottom: 'FINGER SAYS YES' },
  { top: 'OFFLINE MODE', bottom: 'ONLINE ENERGY' },
  { top: 'KEPT IT SIMPLE', bottom: 'MADE IT FUN' },
  { top: 'WHEN THE TEXT', bottom: 'FIT FINALLY' },
  { top: 'ME SHARING', bottom: 'EVERYTHING' },
  { top: 'NO INTERNET', bottom: 'NO PROBLEM' },
  { top: 'JUST ONE MEME', bottom: 'THEN SLEEP' },
  { top: 'I CAME FOR', bottom: 'THE TEMPLATE' },
  { top: 'MOUTH SAYS STOP', bottom: 'BRAIN SAYS POST' },
  { top: 'SARCASM LEVEL', bottom: 'MAXIMUM' },
  { top: 'WHEN THE CROP', bottom: 'IS PERFECT' },
  { top: 'SEND IT', bottom: 'TO EVERYONE' },
];

export const getRandomTextPair = () =>
  randomTextPairs[Math.floor(Math.random() * randomTextPairs.length)];
