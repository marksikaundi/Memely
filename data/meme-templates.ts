import { ImageSourcePropType } from 'react-native';

export type MemeCategory = 'Classic' | 'Reaction' | 'Sarcastic' | 'Random';

export type MemeTemplate = {
  id: string;
  name: string;
  category: MemeCategory;
  source: ImageSourcePropType;
};

export const memeTemplates: MemeTemplate[] = [
  { id: 'classic-01', name: 'Retro Burst', category: 'Classic', source: require('@/assets/memes/meme_01.png') },
  { id: 'classic-02', name: 'Hot Sauce', category: 'Classic', source: require('@/assets/memes/meme_02.png') },
  { id: 'classic-03', name: 'Peach Glow', category: 'Classic', source: require('@/assets/memes/meme_03.png') },
  { id: 'classic-04', name: 'Gold Rush', category: 'Classic', source: require('@/assets/memes/meme_04.png') },
  { id: 'classic-05', name: 'Fresh Mint', category: 'Classic', source: require('@/assets/memes/meme_05.png') },
  { id: 'classic-06', name: 'Teal Tide', category: 'Classic', source: require('@/assets/memes/meme_06.png') },
  { id: 'classic-07', name: 'Deep Harbor', category: 'Classic', source: require('@/assets/memes/meme_07.png') },
  { id: 'classic-08', name: 'Forest Haze', category: 'Classic', source: require('@/assets/memes/meme_08.png') },
  { id: 'reaction-01', name: 'Midnight Punch', category: 'Reaction', source: require('@/assets/memes/meme_09.png') },
  { id: 'reaction-02', name: 'Violet Echo', category: 'Reaction', source: require('@/assets/memes/meme_10.png') },
  { id: 'reaction-03', name: 'Candy Drop', category: 'Reaction', source: require('@/assets/memes/meme_11.png') },
  { id: 'reaction-04', name: 'Lemon Drop', category: 'Reaction', source: require('@/assets/memes/meme_12.png') },
  { id: 'reaction-05', name: 'Mint Pop', category: 'Reaction', source: require('@/assets/memes/meme_13.png') },
  { id: 'reaction-06', name: 'Sky Shock', category: 'Reaction', source: require('@/assets/memes/meme_14.png') },
  { id: 'reaction-07', name: 'Berry Ink', category: 'Reaction', source: require('@/assets/memes/meme_15.png') },
  { id: 'reaction-08', name: 'Citrus Zip', category: 'Reaction', source: require('@/assets/memes/meme_16.png') },
  { id: 'sarcastic-01', name: 'Terracotta', category: 'Sarcastic', source: require('@/assets/memes/meme_17.png') },
  { id: 'sarcastic-02', name: 'Night Slate', category: 'Sarcastic', source: require('@/assets/memes/meme_18.png') },
  { id: 'sarcastic-03', name: 'Herbal Mist', category: 'Sarcastic', source: require('@/assets/memes/meme_19.png') },
  { id: 'sarcastic-04', name: 'Sand Drift', category: 'Sarcastic', source: require('@/assets/memes/meme_20.png') },
  { id: 'sarcastic-05', name: 'Bubblegum', category: 'Sarcastic', source: require('@/assets/memes/meme_21.png') },
  { id: 'sarcastic-06', name: 'Ice Pop', category: 'Sarcastic', source: require('@/assets/memes/meme_22.png') },
  { id: 'sarcastic-07', name: 'Lavender Blur', category: 'Sarcastic', source: require('@/assets/memes/meme_23.png') },
  { id: 'sarcastic-08', name: 'Dew Drop', category: 'Sarcastic', source: require('@/assets/memes/meme_24.png') },
  { id: 'random-01', name: 'Sunny Side', category: 'Random', source: require('@/assets/memes/meme_25.png') },
  { id: 'random-02', name: 'Neon Blue', category: 'Random', source: require('@/assets/memes/meme_26.png') },
  { id: 'random-03', name: 'Aqua Flash', category: 'Random', source: require('@/assets/memes/meme_27.png') },
  { id: 'random-04', name: 'Electric Grape', category: 'Random', source: require('@/assets/memes/meme_28.png') },
  { id: 'random-05', name: 'Pink Buzz', category: 'Random', source: require('@/assets/memes/meme_29.png') },
  { id: 'random-06', name: 'Fresh Tide', category: 'Random', source: require('@/assets/memes/meme_30.png') },
  { id: 'random-07', name: 'Sea Glass', category: 'Random', source: require('@/assets/memes/meme_31.png') },
  { id: 'random-08', name: 'Soft Current', category: 'Random', source: require('@/assets/memes/meme_32.png') },
];

export const memeCategories: MemeCategory[] = ['Classic', 'Reaction', 'Sarcastic', 'Random'];

export const getTemplateById = (id: string) => memeTemplates.find((template) => template.id === id);

export const getRandomTemplate = (category?: MemeCategory) => {
  const pool = category ? memeTemplates.filter((template) => template.category === category) : memeTemplates;
  return pool[Math.floor(Math.random() * pool.length)];
};
