import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { memeCategories, memeTemplates, MemeCategory, MemeTemplate } from '@/data/meme-templates';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TemplatesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [selectedCategory, setSelectedCategory] = useState<MemeCategory>('Classic');

  const theme = useMemo(
    () =>
      colorScheme === 'dark'
        ? {
            background: '#0E0F12',
            panel: '#1A1D23',
            panelAlt: '#232732',
            panelGlow: 'rgba(255, 176, 0, 0.16)',
            text: '#F5F5F7',
            subtext: '#A7AEBC',
            accent: '#FFB000',
            accentSoft: 'rgba(255, 176, 0, 0.2)',
            border: '#2D3340',
          }
        : {
            background: '#F6F1EB',
            panel: '#FFFFFF',
            panelAlt: '#F0E7DD',
            panelGlow: 'rgba(255, 107, 53, 0.2)',
            text: '#101217',
            subtext: '#5B6472',
            accent: '#FF6B35',
            accentSoft: 'rgba(255, 107, 53, 0.2)',
            border: '#D6CFC6',
          },
    [colorScheme]
  );

  const filteredTemplates = useMemo(
    () => memeTemplates.filter((template) => template.category === selectedCategory),
    [selectedCategory]
  );

  const totalCount = memeTemplates.length;

  const handleTemplatePress = (template: MemeTemplate) => {
    router.push({
      pathname: '/',
      params: { templateId: template.id, seed: String(Date.now()) },
    });
  };

  const handleRandomPress = () => {
    router.push({
      pathname: '/',
      params: { random: '1', seed: String(Date.now()) },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={filteredTemplates}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnRow}
        contentContainerStyle={styles.grid}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <View style={styles.heroRow}>
              <View>
                <Text style={[styles.title, { color: theme.text }]}>Template Vault</Text>
                <Text style={[styles.subtitle, { color: theme.subtext }]}>Pick a vibe, then wreck it.</Text>
              </View>
              <Pressable
                style={[styles.randomButton, { backgroundColor: theme.accent }]}
                onPress={handleRandomPress}>
                <Text style={styles.randomButtonText}>Random</Text>
              </Pressable>
            </View>

            <View style={[styles.heroCard, { backgroundColor: theme.panel, borderColor: theme.border }]}
            >
              <View>
                <Text style={[styles.heroTitle, { color: theme.text }]}>Offline + Loaded</Text>
                <Text style={[styles.heroMeta, { color: theme.subtext }]}>No internet, no problem.</Text>
              </View>
              <View style={[styles.heroBadge, { backgroundColor: theme.accentSoft }]}
              >
                <Text style={[styles.heroBadgeText, { color: theme.text }]}>{filteredTemplates.length} / {totalCount}</Text>
                <Text style={[styles.heroBadgeLabel, { color: theme.subtext }]}>Templates</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}>
              {memeCategories.map((category) => (
                <Pressable
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: selectedCategory === category ? theme.accent : theme.panelAlt,
                      borderColor: selectedCategory === category ? theme.accent : theme.border,
                    },
                  ]}>
                  <Text
                    style={{
                      color: selectedCategory === category ? '#0B0F1F' : theme.text,
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: 1.2,
                      fontSize: 11,
                    }}>
                    {category}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleTemplatePress(item)}
            style={[styles.card, { backgroundColor: theme.panel, borderColor: theme.border }]}>
            <View style={[styles.cardGlow, { backgroundColor: theme.panelGlow }]} />
            <Image source={item.source} style={styles.cardImage} contentFit="cover" />
            <View style={styles.cardOverlay}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.cardMeta, { color: theme.subtext }]}>{item.category}</Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBlock: {
    paddingBottom: 8,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  subtitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  randomButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  randomButtonText: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#0B0F1F',
  },
  heroCard: {
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  heroMeta: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    marginTop: 4,
  },
  heroBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: 'flex-end',
  },
  heroBadgeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  heroBadgeLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  categoryRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  columnRow: {
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: 18,
    padding: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  cardOverlay: {
    marginTop: 8,
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 13,
  },
  cardMeta: {
    marginTop: 2,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
