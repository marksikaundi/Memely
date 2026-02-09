import { ImageSourcePropType } from 'react-native';

import { MemeTag } from './random-text';

export type MemeCategory = 'Classic' | 'Reaction' | 'Sarcastic' | 'Random';

export type MemeTemplate = {
  id: string;
  name: string;
  category: MemeCategory;
  source: ImageSourcePropType;
  tags: MemeTag[];
  credit?: { provider: 'Pexels' | 'Unsplash'; url: string };
};

const categoryTags: Record<MemeCategory, MemeTag[]> = {
  Classic: ['relief', 'overthinking', 'win'],
  Reaction: ['confused', 'awkward', 'suspicious'],
  Sarcastic: ['sassy', 'fail', 'overthinking'],
  Random: ['chaos', 'tired', 'win', 'fail'],
};

const makeTemplate = (
  id: string,
  name: string,
  category: MemeCategory,
  source: ImageSourcePropType,
  credit: { provider: 'Pexels' | 'Unsplash'; url: string },
  tags: MemeTag[] = categoryTags[category]
): MemeTemplate => ({
  id,
  name,
  category,
  source,
  tags,
  credit,
});

export const memeTemplates: MemeTemplate[] = [
  makeTemplate('px-01', 'Camera Gremlin', 'Reaction', require('@/assets/memes-real/template_01.jpg'), { provider: 'Pexels', url: 'https://images.pexels.com/photos/1466845/pexels-photo-1466845.jpeg' }, ['awkward', 'confused', 'chaos']),
  makeTemplate('px-02', 'Citrus Chaos', 'Sarcastic', require('@/assets/memes-real/template_02.jpg'), { provider: 'Pexels', url: 'https://images.pexels.com/photos/3756617/pexels-photo-3756617.jpeg' }, ['sassy', 'chaos', 'awkward']),
  makeTemplate('px-03', 'Cool Cat Pink', 'Sarcastic', require('@/assets/memes-real/template_03.jpg'), { provider: 'Pexels', url: 'https://images.pexels.com/photos/3851649/pexels-photo-3851649.jpeg' }, ['sassy', 'suspicious']),
  makeTemplate('px-04', 'Goofy Eye Roll', 'Reaction', require('@/assets/memes-real/template_04.jpg'), { provider: 'Pexels', url: 'https://images.pexels.com/photos/4587958/pexels-photo-4587958.jpeg' }, ['confused', 'chaos', 'awkward']),
  makeTemplate('px-05', 'Professor Pup', 'Classic', require('@/assets/memes-real/template_05.jpg'), { provider: 'Pexels', url: 'https://images.pexels.com/photos/5732456/pexels-photo-5732456.jpeg' }, ['overthinking', 'win', 'relief']),
  makeTemplate('px-06', 'Yawning Cat', 'Classic', require('@/assets/memes-real/template_06.jpg'), { provider: 'Pexels', url: 'https://images.pexels.com/photos/2955277/pexels-photo-2955277.jpeg' }, ['tired', 'relief']),
  makeTemplate('px-07', 'Tongue Out Classic', 'Reaction', require('@/assets/memes-real/template_07.jpg'), { provider: 'Pexels', url: 'https://images.pexels.com/photos/56857/animal-cat-kitten-funny-56857.jpeg' }, ['chaos', 'awkward', 'sassy']),
  makeTemplate('px-08', 'Bearded Chaos', 'Reaction', require('@/assets/memes-real/template_08.jpg'), { provider: 'Pexels', url: 'https://images.pexels.com/photos/3799761/pexels-photo-3799761.jpeg' }, ['chaos', 'awkward']),
  makeTemplate('px-09', 'Unicorn Pug', 'Random', require('@/assets/memes-real/template_09.jpg'), { provider: 'Pexels', url: 'https://images.pexels.com/photos/1564506/pexels-photo-1564506.jpeg' }, ['chaos', 'win']),
  makeTemplate('px-10', 'Paint Party', 'Random', require('@/assets/memes-real/template_10.jpg'), { provider: 'Pexels', url: 'https://images.pexels.com/photos/1149022/pexels-photo-1149022.jpeg' }, ['chaos', 'win', 'awkward']),
  makeTemplate('px-11', 'Side Eye', 'Reaction', require('@/assets/memes-real/template_11.jpg'), { provider: 'Pexels', url: 'https://images.pexels.com/photos/3808003/pexels-photo-3808003.jpeg' }, ['suspicious', 'overthinking']),
  makeTemplate('px-12', 'Street Jokester', 'Reaction', require('@/assets/memes-real/template_12.jpg'), { provider: 'Pexels', url: 'https://images.pexels.com/photos/4212939/pexels-photo-4212939.jpeg' }, ['sassy', 'chaos']),
  makeTemplate('px-13', 'Sleepy Kitty', 'Classic', require('@/assets/memes-real/template_13.jpg'), { provider: 'Pexels', url: 'https://images.pexels.com/photos/6626050/pexels-photo-6626050.jpeg' }, ['tired', 'relief']),
  makeTemplate('px-14', 'Valentine Chaos', 'Sarcastic', require('@/assets/memes-real/template_14.jpg'), { provider: 'Pexels', url: 'https://images.pexels.com/photos/6853516/pexels-photo-6853516.jpeg' }, ['sassy', 'chaos', 'awkward']),
  makeTemplate('px-15', 'Ostrich Screech', 'Reaction', require('@/assets/memes-real/template_15.jpg'), { provider: 'Pexels', url: 'https://images.pexels.com/photos/2233442/pexels-photo-2233442.jpeg' }, ['confused', 'chaos']),
  makeTemplate('px-16', 'Ghost Roommate', 'Random', require('@/assets/memes-real/template_16.jpg'), { provider: 'Pexels', url: 'https://images.pexels.com/photos/5540997/pexels-photo-5540997.jpeg' }, ['awkward', 'suspicious', 'chaos']),
  makeTemplate('px-17', 'Yawning Monkey', 'Classic', require('@/assets/memes-real/template_17.jpg'), { provider: 'Pexels', url: 'https://images.pexels.com/photos/2213575/pexels-photo-2213575.jpeg' }, ['tired', 'chaos']),
  makeTemplate('px-18', 'Box Belly', 'Classic', require('@/assets/memes-real/template_18.jpg'), { provider: 'Pexels', url: 'https://images.pexels.com/photos/3928265/pexels-photo-3928265.jpeg' }, ['fail', 'tired', 'relief']),
  makeTemplate('px-19', 'Wild Hair Day', 'Reaction', require('@/assets/memes-real/template_19.jpg'), { provider: 'Pexels', url: 'https://images.pexels.com/photos/7725637/pexels-photo-7725637.jpeg' }, ['chaos', 'awkward']),
  makeTemplate('px-20', 'Crossed Eyes', 'Reaction', require('@/assets/memes-real/template_20.jpg'), { provider: 'Pexels', url: 'https://images.pexels.com/photos/3812738/pexels-photo-3812738.jpeg' }, ['awkward', 'confused']),
  makeTemplate('us-01', 'Golden Stare', 'Classic', require('@/assets/memes-real/template_21.jpg'), { provider: 'Unsplash', url: 'https://unsplash.com/photos/O-X-qro6Be4' }, ['suspicious', 'overthinking']),
  makeTemplate('us-02', 'Head Pats', 'Classic', require('@/assets/memes-real/template_22.jpg'), { provider: 'Unsplash', url: 'https://unsplash.com/photos/-kzlfe1e52c' }, ['relief', 'tired']),
  makeTemplate('us-03', 'Ostrich Judge', 'Reaction', require('@/assets/memes-real/template_23.jpg'), { provider: 'Unsplash', url: 'https://unsplash.com/photos/P5Znrn6bNQ8' }, ['suspicious', 'confused']),
  makeTemplate('us-04', 'Snowy Squirrel', 'Random', require('@/assets/memes-real/template_24.jpg'), { provider: 'Unsplash', url: 'https://unsplash.com/photos/haOZsVLmS1A' }, ['awkward', 'suspicious']),
  makeTemplate('us-05', 'Wall Lounger', 'Sarcastic', require('@/assets/memes-real/template_25.jpg'), { provider: 'Unsplash', url: 'https://unsplash.com/photos/HULQHTegxaI' }, ['sassy', 'win']),
  makeTemplate('us-06', 'Cool Chow', 'Sarcastic', require('@/assets/memes-real/template_26.jpg'), { provider: 'Unsplash', url: 'https://unsplash.com/photos/KZv7w34tluA' }, ['sassy', 'win']),
  makeTemplate('us-07', 'No Pets, Still Here', 'Sarcastic', require('@/assets/memes-real/template_27.jpg'), { provider: 'Unsplash', url: 'https://unsplash.com/photos/ab4bjKc_2zo' }, ['awkward', 'sassy', 'fail']),
  makeTemplate('us-08', 'Banana Bandit', 'Random', require('@/assets/memes-real/template_28.jpg'), { provider: 'Unsplash', url: 'https://unsplash.com/photos/QBzYEojdNB8' }, ['chaos', 'awkward']),
  makeTemplate('us-09', 'Cowboy Cat', 'Sarcastic', require('@/assets/memes-real/template_29.jpg'), { provider: 'Unsplash', url: 'https://unsplash.com/photos/7iUPXpL_714' }, ['sassy', 'win']),
  makeTemplate('us-10', 'Graffiti Cat', 'Random', require('@/assets/memes-real/template_30.jpg'), { provider: 'Unsplash', url: 'https://unsplash.com/photos/VXBcZo6JBLM' }, ['suspicious', 'overthinking']),
  makeTemplate('us-11', 'Window Debate', 'Classic', require('@/assets/memes-real/template_31.jpg'), { provider: 'Unsplash', url: 'https://unsplash.com/photos/1zRPGJQNJ7M' }, ['tired', 'awkward']),
  makeTemplate('us-12', 'Bunny Ears', 'Random', require('@/assets/memes-real/template_32.jpg'), { provider: 'Unsplash', url: 'https://unsplash.com/photos/TAhVzLfLW-4' }, ['awkward', 'fail']),
  makeTemplate('us-13', 'Facepalm Cat', 'Classic', require('@/assets/memes-real/template_33.jpg'), { provider: 'Unsplash', url: 'https://unsplash.com/photos/rPfccC7JyYE' }, ['fail', 'awkward', 'tired']),
  makeTemplate('us-14', 'Hat Cat', 'Sarcastic', require('@/assets/memes-real/template_34.jpg'), { provider: 'Unsplash', url: 'https://unsplash.com/photos/oENlRRllTg0' }, ['sassy', 'win']),
  makeTemplate('us-15', 'Detective Nap', 'Classic', require('@/assets/memes-real/template_35.jpg'), { provider: 'Unsplash', url: 'https://unsplash.com/photos/iRt9rlwAV3c' }, ['tired', 'relief']),
  makeTemplate('us-16', 'Ducks On Duty', 'Random', require('@/assets/memes-real/template_36.jpg'), { provider: 'Unsplash', url: 'https://unsplash.com/photos/3Qp_8HhnpL8' }, ['awkward', 'suspicious']),
  makeTemplate('us-17', 'Sunglasses Cat', 'Sarcastic', require('@/assets/memes-real/template_37.jpg'), { provider: 'Unsplash', url: 'https://unsplash.com/photos/GhmmZMAvn8o' }, ['sassy', 'win']),
  makeTemplate('us-18', 'Stair Standoff', 'Reaction', require('@/assets/memes-real/template_38.jpg'), { provider: 'Unsplash', url: 'https://unsplash.com/photos/h2I1mP0LOZI' }, ['awkward', 'overthinking']),
  makeTemplate('us-19', 'Croc Kitten', 'Random', require('@/assets/memes-real/template_39.jpg'), { provider: 'Unsplash', url: 'https://unsplash.com/photos/HPms4CetpG0' }, ['awkward', 'chaos']),
  makeTemplate('us-20', 'Rug Swagger', 'Sarcastic', require('@/assets/memes-real/template_40.jpg'), { provider: 'Unsplash', url: 'https://unsplash.com/photos/hRfVrKqDtCQ' }, ['sassy', 'win']),
];

export const memeCategories: MemeCategory[] = ['Classic', 'Reaction', 'Sarcastic', 'Random'];

export const getTemplateById = (id: string) => memeTemplates.find((template) => template.id === id);

export const getRandomTemplate = (category?: MemeCategory) => {
  const pool = category ? memeTemplates.filter((template) => template.category === category) : memeTemplates;
  return pool[Math.floor(Math.random() * pool.length)];
};
