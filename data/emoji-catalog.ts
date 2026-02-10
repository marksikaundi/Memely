import data from '@emoji-mart/data';

export type EmojiItem = {
  id: string;
  native: string;
  name: string;
  keywords: string[];
  category: string;
};

export type EmojiCategory = {
  id: string;
  name: string;
};

type EmojiData = {
  categories?: Array<{ id: string; name: string; emojis: string[] }>;
  emojis?: Record<string, { id: string; name: string; keywords?: string[]; skins?: Array<{ native: string }> }>;
};

const emojiData = data as EmojiData;
const categoriesSource = emojiData.categories ?? [];
const emojisSource = emojiData.emojis ?? {};

const emojiByCategory: Record<string, EmojiItem[]> = {};
const allEmojis: EmojiItem[] = [];
const seen = new Set<string>();

export const emojiCategories: EmojiCategory[] = categoriesSource.map((category) => ({
  id: category.id,
  name: category.name,
}));

export const emojiCategoryIcons: Record<string, string> = {
  'smileys-emotion': '😀',
  'people-body': '🙋',
  'animals-nature': '🐻',
  'food-drink': '🍔',
  'travel-places': '✈️',
  activities: '⚽️',
  objects: '💡',
  symbols: '🔣',
  flags: '🏳️',
};

categoriesSource.forEach((category) => {
  const items: EmojiItem[] = [];
  category.emojis.forEach((emojiId) => {
    const raw = emojisSource[emojiId];
    if (!raw || !raw.skins || raw.skins.length === 0) return;
    const native = raw.skins[0].native;
    if (!native || seen.has(raw.id)) return;

    const item: EmojiItem = {
      id: raw.id,
      native,
      name: raw.name,
      keywords: raw.keywords ?? [],
      category: category.id,
    };

    seen.add(raw.id);
    items.push(item);
    allEmojis.push(item);
  });
  emojiByCategory[category.id] = items;
});

export { allEmojis, emojiByCategory };

export const defaultQuickEmojis = allEmojis.slice(0, 12).map((item) => item.native);

const normalize = (value: string) => value.toLowerCase();

export const searchEmojis = (query: string) => {
  const needle = normalize(query.trim());
  if (!needle) return allEmojis;
  return allEmojis.filter((emoji) => {
    if (normalize(emoji.name).includes(needle)) return true;
    if (normalize(emoji.id).includes(needle)) return true;
    return emoji.keywords.some((keyword) => normalize(keyword).includes(needle));
  });
};
