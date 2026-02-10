import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { allEmojis, emojiByCategory, emojiCategories, emojiCategoryIcons, EmojiItem, searchEmojis } from '@/data/emoji-catalog';

type EmojiPickerTheme = {
  panel: string;
  panelAlt: string;
  text: string;
  subtext: string;
  accent: string;
  border: string;
};

type EmojiPickerProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  theme: EmojiPickerTheme;
  recentEmojis?: string[];
};

type CategoryFilter = { id: string; name: string; icon: string };

const baseCategories: CategoryFilter[] = [
  { id: 'all', name: 'All', icon: '✨' },
  ...emojiCategories.map((category) => ({
    ...category,
    icon: emojiCategoryIcons[category.id] ?? '🔹',
  })),
];

export function EmojiPicker({ visible, onClose, onSelect, theme, recentEmojis = [] }: EmojiPickerProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories: CategoryFilter[] = useMemo(() => {
    if (recentEmojis.length === 0) return baseCategories;
    return [{ id: 'recent', name: 'Recent', icon: '🕘' }, ...baseCategories];
  }, [recentEmojis.length]);

  const recentItems: EmojiItem[] = useMemo(
    () =>
      recentEmojis.map((emoji, index) => ({
        id: `recent-${index}-${emoji}`,
        native: emoji,
        name: 'Recent',
        keywords: [],
        category: 'recent',
      })),
    [recentEmojis]
  );

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setSelectedCategory('all');
    }
  }, [visible]);

  const data = useMemo(() => {
    if (query.trim().length > 0) return searchEmojis(query);
    if (selectedCategory === 'recent') return recentItems;
    if (selectedCategory === 'all') return allEmojis;
    return emojiByCategory[selectedCategory] ?? [];
  }, [query, selectedCategory, recentItems]);

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.modalCard, { backgroundColor: theme.panel, borderColor: theme.border }]}> 
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>All Stickers</Text>
              <Text style={[styles.subtitle, { color: theme.subtext }]}>Search or browse the full set.</Text>
            </View>
            <Pressable onPress={onClose} style={[styles.closeChip, { backgroundColor: theme.panelAlt }]}> 
              <Text style={[styles.closeChipText, { color: theme.text }]}>Close</Text>
            </Pressable>
          </View>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search emojis"
            placeholderTextColor={theme.subtext}
            style={[styles.searchInput, { color: theme.text, backgroundColor: theme.panelAlt, borderColor: theme.border }]}
          />

          {recentEmojis.length > 0 ? (
            <View style={styles.recentRow}>
              <Text style={[styles.recentLabel, { color: theme.subtext }]}>Recent</Text>
              <View style={styles.recentChips}>
                {recentEmojis.slice(0, 10).map((emoji) => (
                  <Pressable
                    key={`recent-${emoji}`}
                    onPress={() => onSelect(emoji)}
                    style={[styles.emojiCell, { backgroundColor: theme.panelAlt }]}>
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}> 
            {categories.map((category) => (
              <Pressable
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: selectedCategory === category.id ? theme.accent : theme.panelAlt,
                    borderColor: selectedCategory === category.id ? theme.accent : theme.border,
                  },
                ]}>
                <Text
                  style={{
                    color: selectedCategory === category.id ? '#0B0F1F' : theme.text,
                    fontSize: 11,
                    fontWeight: '700',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}>
                  {category.icon} {category.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <FlatList
            data={data}
            keyExtractor={(item: EmojiItem) => item.id}
            numColumns={8}
            columnWrapperStyle={styles.columnRow}
            contentContainerStyle={styles.grid}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onSelect(item.native)}
                style={[styles.emojiCell, { backgroundColor: theme.panelAlt }]}
              >
                <Text style={styles.emojiText}>{item.native}</Text>
              </Pressable>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    maxHeight: '86%',
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  closeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  closeChipText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  recentRow: {
    gap: 8,
  },
  recentLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  recentChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryRow: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  grid: {
    paddingBottom: 12,
    gap: 8,
  },
  columnRow: {
    gap: 8,
  },
  emojiCell: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 20,
  },
});
