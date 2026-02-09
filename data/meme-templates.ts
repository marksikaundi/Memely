import { ImageSourcePropType } from 'react-native';

import { MemeTag } from './random-text';

export type MemeCategory = 'Classic' | 'Reaction' | 'Sarcastic' | 'Random';

export type MemeTemplate = {
  id: string;
  name: string;
  category: MemeCategory;
  source: ImageSourcePropType;
  tags: MemeTag[];
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
  tags: MemeTag[] = categoryTags[category]
): MemeTemplate => ({
  id,
  name,
  category,
  source,
  tags,
});

export const memeTemplates: MemeTemplate[] = [
  makeTemplate('classic-01', 'Retro Burst', 'Classic', require('@/assets/memes/meme_01.png')),
  makeTemplate('classic-02', 'Hot Sauce', 'Classic', require('@/assets/memes/meme_02.png')),
  makeTemplate('classic-03', 'Peach Glow', 'Classic', require('@/assets/memes/meme_03.png')),
  makeTemplate('classic-04', 'Gold Rush', 'Classic', require('@/assets/memes/meme_04.png')),
  makeTemplate('classic-05', 'Fresh Mint', 'Classic', require('@/assets/memes/meme_05.png')),
  makeTemplate('classic-06', 'Teal Tide', 'Classic', require('@/assets/memes/meme_06.png')),
  makeTemplate('classic-07', 'Deep Harbor', 'Classic', require('@/assets/memes/meme_07.png')),
  makeTemplate('classic-08', 'Forest Haze', 'Classic', require('@/assets/memes/meme_08.png')),
  makeTemplate('reaction-01', 'Midnight Punch', 'Reaction', require('@/assets/memes/meme_09.png')),
  makeTemplate('reaction-02', 'Violet Echo', 'Reaction', require('@/assets/memes/meme_10.png')),
  makeTemplate('reaction-03', 'Candy Drop', 'Reaction', require('@/assets/memes/meme_11.png')),
  makeTemplate('reaction-04', 'Lemon Drop', 'Reaction', require('@/assets/memes/meme_12.png')),
  makeTemplate('reaction-05', 'Mint Pop', 'Reaction', require('@/assets/memes/meme_13.png')),
  makeTemplate('reaction-06', 'Sky Shock', 'Reaction', require('@/assets/memes/meme_14.png')),
  makeTemplate('reaction-07', 'Berry Ink', 'Reaction', require('@/assets/memes/meme_15.png')),
  makeTemplate('reaction-08', 'Citrus Zip', 'Reaction', require('@/assets/memes/meme_16.png')),
  makeTemplate('sarcastic-01', 'Terracotta', 'Sarcastic', require('@/assets/memes/meme_17.png')),
  makeTemplate('sarcastic-02', 'Night Slate', 'Sarcastic', require('@/assets/memes/meme_18.png')),
  makeTemplate('sarcastic-03', 'Herbal Mist', 'Sarcastic', require('@/assets/memes/meme_19.png')),
  makeTemplate('sarcastic-04', 'Sand Drift', 'Sarcastic', require('@/assets/memes/meme_20.png')),
  makeTemplate('sarcastic-05', 'Bubblegum', 'Sarcastic', require('@/assets/memes/meme_21.png')),
  makeTemplate('sarcastic-06', 'Ice Pop', 'Sarcastic', require('@/assets/memes/meme_22.png')),
  makeTemplate('sarcastic-07', 'Lavender Blur', 'Sarcastic', require('@/assets/memes/meme_23.png')),
  makeTemplate('sarcastic-08', 'Dew Drop', 'Sarcastic', require('@/assets/memes/meme_24.png')),
  makeTemplate('random-01', 'Sunny Side', 'Random', require('@/assets/memes/meme_25.png')),
  makeTemplate('random-02', 'Neon Blue', 'Random', require('@/assets/memes/meme_26.png')),
  makeTemplate('random-03', 'Aqua Flash', 'Random', require('@/assets/memes/meme_27.png')),
  makeTemplate('random-04', 'Electric Grape', 'Random', require('@/assets/memes/meme_28.png')),
  makeTemplate('random-05', 'Pink Buzz', 'Random', require('@/assets/memes/meme_29.png')),
  makeTemplate('random-06', 'Fresh Tide', 'Random', require('@/assets/memes/meme_30.png')),
  makeTemplate('random-07', 'Sea Glass', 'Random', require('@/assets/memes/meme_31.png')),
  makeTemplate('random-08', 'Soft Current', 'Random', require('@/assets/memes/meme_32.png')),
];

export const memeCategories: MemeCategory[] = ['Classic', 'Reaction', 'Sarcastic', 'Random'];

export const getTemplateById = (id: string) => memeTemplates.find((template) => template.id === id);

export const getRandomTemplate = (category?: MemeCategory) => {
  const pool = category ? memeTemplates.filter((template) => template.category === category) : memeTemplates;
  return pool[Math.floor(Math.random() * pool.length)];
};
