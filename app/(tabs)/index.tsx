import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { getRandomTemplate, getTemplateById, memeTemplates } from '@/data/meme-templates';
import { getRandomTextPair } from '@/data/random-text';
import { LayerTransform, TransformableLayer } from '@/components/meme/transformable-layer';

const textPalette = ['#FFFFFF', '#FFD23F', '#00F5D4', '#FF5D8F', '#0B0F1F', '#F9F5E3'];
const strokePalette = ['#000000', '#202124', '#FFFFFF'];
const emojiStickers = ['😂', '🔥', '🤡', '✨', '💀', '😈'];

type MemeFont = 'impact' | 'bold' | 'comic';

type TextLayer = {
  id: string;
  type: 'text' | 'sticker';
  text: string;
  font: MemeFont;
  fontSize: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  align: 'left' | 'center' | 'right';
  opacity: number;
  transform: LayerTransform;
};

type EffectKind = 'confetti' | 'blur' | 'pixelate';

type ConfettiPiece = {
  id: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
};

type EffectLayer = {
  id: string;
  type: 'effect';
  effect: EffectKind;
  opacity: number;
  size: number;
  confetti?: ConfettiPiece[];
  transform: LayerTransform;
};

type MemeLayer = TextLayer | EffectLayer;

type TemplateBackground = {
  kind: 'template';
  templateId: string;
  source: number;
};

type CustomBackground = {
  kind: 'custom';
  uri: string;
  width?: number;
  height?: number;
  originalUri: string;
  originalWidth?: number;
  originalHeight?: number;
};

type Background = TemplateBackground | CustomBackground;

type Theme = {
  background: string;
  panel: string;
  panelAlt: string;
  text: string;
  subtext: string;
  accent: string;
  accentSoft: string;
  canvas: string;
  border: string;
};

const createId = () => Math.random().toString(36).slice(2, 10);

const fontFamilies: Record<MemeFont, string> = {
  impact: Platform.select({ ios: 'Impact', android: 'sans-serif-condensed', default: 'Impact' }) ?? 'System',
  bold: Platform.select({ ios: 'HelveticaNeue-CondensedBlack', android: 'sans-serif-black', default: 'System' }) ?? 'System',
  comic: Platform.select({ ios: 'ChalkboardSE-Bold', android: 'cursive', default: 'System' }) ?? 'System',
};

const makeConfetti = (): ConfettiPiece[] => {
  const pieces: ConfettiPiece[] = [];
  for (let i = 0; i < 28; i += 1) {
    pieces.push({
      id: createId(),
      x: Math.random() * 140,
      y: Math.random() * 140,
      size: 6 + Math.random() * 10,
      rotation: Math.random() * 90,
      color: textPalette[Math.floor(Math.random() * textPalette.length)],
    });
  }
  return pieces;
};

const buildTextLayer = (text: string, yOffset = 0, sticker = false): TextLayer => ({
  id: createId(),
  type: sticker ? 'sticker' : 'text',
  text,
  font: sticker ? 'bold' : 'impact',
  fontSize: sticker ? 64 : 44,
  color: sticker ? '#FFFFFF' : '#FFFFFF',
  strokeColor: sticker ? 'transparent' : '#000000',
  strokeWidth: sticker ? 0 : 4,
  align: 'center',
  opacity: 1,
  transform: { x: 0, y: yOffset, scale: 1, rotation: 0 },
});

const buildEffectLayer = (effect: EffectKind): EffectLayer => ({
  id: createId(),
  type: 'effect',
  effect,
  size: 180,
  opacity: 0.8,
  confetti: effect === 'confetti' ? makeConfetti() : undefined,
  transform: { x: 0, y: 0, scale: 1, rotation: 0 },
});

export default function MemeEditorScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { templateId, random, seed } = useLocalSearchParams<{ templateId?: string; random?: string; seed?: string }>();

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [background, setBackground] = useState<Background>(() => ({
    kind: 'template',
    templateId: memeTemplates[0].id,
    source: memeTemplates[0].source,
  }));
  const [layers, setLayers] = useState<MemeLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);

  const canvasRef = useRef<View>(null);

  const theme: Theme = useMemo(
    () =>
      colorScheme === 'dark'
        ? {
            background: '#0E0F12',
            panel: '#1A1D23',
            panelAlt: '#262A33',
            text: '#F5F5F7',
            subtext: '#A7AEBC',
            accent: '#FFB000',
            accentSoft: 'rgba(255, 176, 0, 0.15)',
            canvas: '#141821',
            border: '#2E3442',
          }
        : {
            background: '#F6F1EB',
            panel: '#FFFFFF',
            panelAlt: '#F0E7DD',
            text: '#101217',
            subtext: '#5B6472',
            accent: '#FF6B35',
            accentSoft: 'rgba(255, 107, 53, 0.18)',
            canvas: '#F8F4F0',
            border: '#D6CFC6',
          },
    [colorScheme]
  );

  const selectedLayer = useMemo(() => layers.find((layer) => layer.id === selectedLayerId) ?? null, [layers, selectedLayerId]);

  const updateLayer = useCallback((id: string, updater: Partial<MemeLayer>) => {
    setLayers((current) => current.map((layer) => (layer.id === id ? { ...layer, ...updater } : layer)));
  }, []);

  const updateLayerTransform = useCallback((id: string, transform: LayerTransform) => {
    setLayers((current) => current.map((layer) => (layer.id === id ? { ...layer, transform } : layer)));
  }, []);

  const addTextLayer = useCallback(
    (text = 'TYPE YOUR CHAOS') => {
      const newLayer = buildTextLayer(text);
      setLayers((current) => [...current, newLayer]);
      setSelectedLayerId(newLayer.id);
    },
    []
  );

  const addStickerLayer = useCallback((emoji: string) => {
    const newLayer = buildTextLayer(emoji, 0, true);
    setLayers((current) => [...current, newLayer]);
    setSelectedLayerId(newLayer.id);
  }, []);

  const addEffectLayer = useCallback((effect: EffectKind) => {
    const newLayer = buildEffectLayer(effect);
    setLayers((current) => [...current, newLayer]);
    setSelectedLayerId(newLayer.id);
  }, []);

  const resetLayers = useCallback(() => {
    setLayers([]);
    setSelectedLayerId(null);
  }, []);

  const applyTemplate = useCallback((id: string) => {
    const template = getTemplateById(id);
    if (!template) return;
    setBackground({ kind: 'template', templateId: template.id, source: template.source });
    setFlipX(false);
    setFlipY(false);
  }, []);

  const randomizeMeme = useCallback(() => {
    const template = getRandomTemplate();
    const textPair = getRandomTextPair();
    setBackground({ kind: 'template', templateId: template.id, source: template.source });
    setFlipX(false);
    setFlipY(false);
    setLayers([
      buildTextLayer(textPair.top, -140),
      buildTextLayer(textPair.bottom, 140),
    ]);
    setSelectedLayerId(null);
  }, []);

  const handlePickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need access to your gallery to import photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: false,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    setBackground({
      kind: 'custom',
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      originalUri: asset.uri,
      originalWidth: asset.width,
      originalHeight: asset.height,
    });
    setFlipX(false);
    setFlipY(false);
  }, []);

  const cropToSquare = useCallback(async () => {
    if (background.kind !== 'custom' || !background.width || !background.height) return;
    const size = Math.min(background.width, background.height);
    const originX = Math.round((background.width - size) / 2);
    const originY = Math.round((background.height - size) / 2);

    const result = await ImageManipulator.manipulateAsync(
      background.uri,
      [{ crop: { originX, originY, width: size, height: size } }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );

    setBackground({
      ...background,
      uri: result.uri,
      width: size,
      height: size,
    });
  }, [background]);

  const resetCrop = useCallback(() => {
    if (background.kind !== 'custom') return;
    setBackground({
      ...background,
      uri: background.originalUri,
      width: background.originalWidth,
      height: background.originalHeight,
    });
  }, [background]);

  const captureCanvas = useCallback(async () => {
    if (!canvasRef.current) return null;
    return captureRef(canvasRef, { format: 'png', quality: 1 });
  }, []);

  const handleSave = useCallback(async () => {
    const uri = await captureCanvas();
    if (!uri) return;

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to save your meme.');
      return;
    }

    await MediaLibrary.saveToLibraryAsync(uri);
    Alert.alert('Saved', 'Your meme is now in your gallery.');
  }, [captureCanvas]);

  const handleShare = useCallback(async () => {
    const uri = await captureCanvas();
    if (!uri) return;

    const available = await Sharing.isAvailableAsync();
    if (!available) {
      Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
      return;
    }

    await Sharing.shareAsync(uri);
  }, [captureCanvas]);

  const randomizeStyle = useCallback(() => {
    if (!selectedLayer || selectedLayer.type === 'effect') return;
    const randomFont = (['impact', 'bold', 'comic'] as MemeFont[])[Math.floor(Math.random() * 3)];
    const randomColor = textPalette[Math.floor(Math.random() * textPalette.length)];
    const randomStroke = strokePalette[Math.floor(Math.random() * strokePalette.length)];
    updateLayer(selectedLayer.id, {
      font: randomFont,
      color: randomColor,
      strokeColor: randomStroke,
    });
  }, [selectedLayer, updateLayer]);

  useEffect(() => {
    if (canvasSize.width === 0 || layers.length > 0) return;
    setLayers([buildTextLayer('TOP TEXT', -140), buildTextLayer('BOTTOM TEXT', 140)]);
  }, [canvasSize.width, layers.length]);

  useEffect(() => {
    if (random) {
      randomizeMeme();
      return;
    }

    if (!templateId) return;
    if (Array.isArray(templateId)) return;
    applyTemplate(templateId);
  }, [templateId, random, seed, applyTemplate, randomizeMeme]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Memely</Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>Offline meme forge</Text>
        </View>
        <Pressable
          style={[styles.randomButton, { backgroundColor: theme.accent }]}
          onPress={randomizeMeme}>
          <Text style={styles.randomButtonText}>Random</Text>
        </Pressable>
      </View>

      <View style={styles.canvasWrap}>
        <View
          ref={canvasRef}
          style={[styles.canvas, { backgroundColor: theme.canvas, borderColor: theme.border }]}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setCanvasSize({ width, height });
          }}>
          {background.kind === 'template' ? (
            <Image
              source={background.source}
              style={[styles.canvasImage, { transform: [{ scaleX: flipX ? -1 : 1 }, { scaleY: flipY ? -1 : 1 }] }]}
              contentFit="cover"
            />
          ) : (
            <Image
              source={{ uri: background.uri }}
              style={[styles.canvasImage, { transform: [{ scaleX: flipX ? -1 : 1 }, { scaleY: flipY ? -1 : 1 }] }]}
              contentFit="cover"
            />
          )}

          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setSelectedLayerId(null)}
          />

          {layers.map((layer) => (
            <TransformableLayer
              key={layer.id}
              id={layer.id}
              selected={layer.id === selectedLayerId}
              anchor={{ x: canvasSize.width / 2, y: canvasSize.height / 2 }}
              transform={layer.transform}
              onSelect={setSelectedLayerId}
              onTransformEnd={updateLayerTransform}>
              {layer.type === 'effect' ? (
                <EffectLayerView layer={layer} />
              ) : (
                <Text
                  style={{
                    fontFamily: fontFamilies[layer.font],
                    fontSize: layer.fontSize,
                    color: layer.color,
                    textAlign: layer.align,
                    opacity: layer.opacity,
                    textTransform: layer.type === 'text' ? 'uppercase' : 'none',
                    textShadowColor: layer.strokeColor,
                    textShadowRadius: layer.strokeWidth,
                    textShadowOffset: { width: 0, height: 0 },
                  }}>
                  {layer.text}
                </Text>
              )}
            </TransformableLayer>
          ))}
        </View>
      </View>

      <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent} showsVerticalScrollIndicator={false}>
        <View style={styles.actionRow}>
          <ActionButton label="Templates" onPress={() => router.navigate('/(tabs)/explore')} theme={theme} />
          <ActionButton label="Upload" onPress={handlePickImage} theme={theme} />
          <ActionButton label="Add Text" onPress={() => addTextLayer()} theme={theme} />
          <ActionButton label="Stickers" onPress={() => addStickerLayer(emojiStickers[0])} theme={theme} />
          <ActionButton label="Effects" onPress={() => addEffectLayer('confetti')} theme={theme} />
          <ActionButton label="Reset" onPress={resetLayers} theme={theme} />
        </View>

        <View style={styles.actionRow}>
          <ActionButton label={flipX ? 'Unflip X' : 'Flip X'} onPress={() => setFlipX((prev) => !prev)} theme={theme} />
          <ActionButton label={flipY ? 'Unflip Y' : 'Flip Y'} onPress={() => setFlipY((prev) => !prev)} theme={theme} />
          <ActionButton label="Square Crop" onPress={cropToSquare} theme={theme} />
          <ActionButton label="Reset Crop" onPress={resetCrop} theme={theme} />
          <ActionButton label="Shuffle" onPress={randomizeStyle} theme={theme} disabled={!selectedLayer || selectedLayer.type === 'effect'} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Stickers</Text>
          <View style={styles.actionRow}>
            {emojiStickers.map((emoji) => (
              <Pressable
                key={emoji}
                style={[styles.emojiButton, { backgroundColor: theme.panelAlt }]}
                onPress={() => addStickerLayer(emoji)}>
                <Text style={styles.emojiText}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Effects</Text>
          <View style={styles.actionRow}>
            <ActionButton label="Confetti" onPress={() => addEffectLayer('confetti')} theme={theme} />
            <ActionButton label="Blur Block" onPress={() => addEffectLayer('blur')} theme={theme} />
            <ActionButton label="Pixelate" onPress={() => addEffectLayer('pixelate')} theme={theme} />
          </View>
        </View>

        {selectedLayer && selectedLayer.type !== 'effect' ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Text Edit</Text>
            <TextInput
              value={selectedLayer.text}
              onChangeText={(text) => updateLayer(selectedLayer.id, { text })}
              placeholder="Say the thing"
              placeholderTextColor={theme.subtext}
              style={[styles.textInput, { color: theme.text, backgroundColor: theme.panel, borderColor: theme.border }]}
            />

            <View style={styles.actionRow}>
              {(['impact', 'bold', 'comic'] as MemeFont[]).map((font) => (
                <ActionButton
                  key={font}
                  label={font.toUpperCase()}
                  onPress={() => updateLayer(selectedLayer.id, { font })}
                  theme={theme}
                  active={selectedLayer.font === font}
                />
              ))}
            </View>

            <View style={styles.actionRow}>
              <ActionButton label="A-" onPress={() => updateLayer(selectedLayer.id, { fontSize: Math.max(18, selectedLayer.fontSize - 4) })} theme={theme} />
              <ActionButton label="A+" onPress={() => updateLayer(selectedLayer.id, { fontSize: Math.min(96, selectedLayer.fontSize + 4) })} theme={theme} />
              <ActionButton label="Left" onPress={() => updateLayer(selectedLayer.id, { align: 'left' })} theme={theme} active={selectedLayer.align === 'left'} />
              <ActionButton label="Center" onPress={() => updateLayer(selectedLayer.id, { align: 'center' })} theme={theme} active={selectedLayer.align === 'center'} />
              <ActionButton label="Right" onPress={() => updateLayer(selectedLayer.id, { align: 'right' })} theme={theme} active={selectedLayer.align === 'right'} />
            </View>

            <View style={styles.actionRow}>
              {textPalette.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => updateLayer(selectedLayer.id, { color })}
                  style={[
                    styles.colorSwatch,
                    {
                      backgroundColor: color,
                      borderColor: selectedLayer.color === color ? theme.accent : 'transparent',
                    },
                  ]}
                />
              ))}
            </View>

            <View style={styles.actionRow}>
              {strokePalette.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => updateLayer(selectedLayer.id, { strokeColor: color })}
                  style={[
                    styles.colorSwatch,
                    {
                      backgroundColor: color,
                      borderColor: selectedLayer.strokeColor === color ? theme.accent : 'transparent',
                    },
                  ]}
                />
              ))}
              <ActionButton
                label="Stroke-"
                onPress={() => updateLayer(selectedLayer.id, { strokeWidth: Math.max(0, selectedLayer.strokeWidth - 1) })}
                theme={theme}
              />
              <ActionButton
                label="Stroke+"
                onPress={() => updateLayer(selectedLayer.id, { strokeWidth: Math.min(12, selectedLayer.strokeWidth + 1) })}
                theme={theme}
              />
            </View>

            <View style={styles.actionRow}>
              <ActionButton
                label="Fade"
                onPress={() => updateLayer(selectedLayer.id, { opacity: Math.max(0.2, selectedLayer.opacity - 0.1) })}
                theme={theme}
              />
              <ActionButton
                label="Boost"
                onPress={() => updateLayer(selectedLayer.id, { opacity: Math.min(1, selectedLayer.opacity + 0.1) })}
                theme={theme}
              />
              <ActionButton
                label="Delete"
                onPress={() => {
                  setLayers((current) => current.filter((layer) => layer.id !== selectedLayer.id));
                  setSelectedLayerId(null);
                }}
                theme={theme}
                tone="danger"
              />
            </View>
          </View>
        ) : null}

        {selectedLayer && selectedLayer.type === 'effect' ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Effect Controls</Text>
            <View style={styles.actionRow}>
              <ActionButton
                label="Opacity-"
                onPress={() => updateLayer(selectedLayer.id, { opacity: Math.max(0.2, selectedLayer.opacity - 0.1) })}
                theme={theme}
              />
              <ActionButton
                label="Opacity+"
                onPress={() => updateLayer(selectedLayer.id, { opacity: Math.min(1, selectedLayer.opacity + 0.1) })}
                theme={theme}
              />
              <ActionButton
                label="Size-"
                onPress={() => updateLayer(selectedLayer.id, { size: Math.max(80, selectedLayer.size - 20) })}
                theme={theme}
              />
              <ActionButton
                label="Size+"
                onPress={() => updateLayer(selectedLayer.id, { size: Math.min(320, selectedLayer.size + 20) })}
                theme={theme}
              />
              <ActionButton
                label="Delete"
                onPress={() => {
                  setLayers((current) => current.filter((layer) => layer.id !== selectedLayer.id));
                  setSelectedLayerId(null);
                }}
                theme={theme}
                tone="danger"
              />
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Export</Text>
          <View style={styles.actionRow}>
            <ActionButton label="Save" onPress={handleSave} theme={theme} tone="primary" />
            <ActionButton label="Share" onPress={handleShare} theme={theme} tone="primary" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  theme: Theme;
  tone?: 'default' | 'primary' | 'danger';
  active?: boolean;
  disabled?: boolean;
};

function ActionButton({ label, onPress, theme, tone = 'default', active, disabled }: ActionButtonProps) {
  const backgroundColor =
    tone === 'primary'
      ? theme.accent
      : tone === 'danger'
        ? '#D64545'
        : active
          ? theme.accentSoft
          : theme.panelAlt;
  const textColor = tone === 'primary' ? '#0B0F1F' : theme.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.actionButton,
        { backgroundColor, opacity: disabled ? 0.5 : 1 },
      ]}>
      <Text style={[styles.actionButtonText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

type EffectLayerViewProps = {
  layer: EffectLayer;
};

function EffectLayerView({ layer }: EffectLayerViewProps) {
  if (layer.effect === 'confetti') {
    return (
      <View
        style={{
          width: layer.size,
          height: layer.size,
          opacity: layer.opacity,
        }}>
        {layer.confetti?.map((piece) => (
          <View
            key={piece.id}
            style={{
              position: 'absolute',
              left: piece.x,
              top: piece.y,
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              transform: [{ rotateZ: `${piece.rotation}deg` }],
              borderRadius: 2,
            }}
          />
        ))}
      </View>
    );
  }

  if (layer.effect === 'blur') {
    return (
      <View
        style={{
          width: layer.size,
          height: layer.size,
          borderRadius: layer.size / 5,
          backgroundColor: 'rgba(255,255,255,0.45)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.55)',
          opacity: layer.opacity,
        }}
      />
    );
  }

  return (
    <View
      style={{
        width: layer.size,
        height: layer.size,
        opacity: layer.opacity,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 8,
        overflow: 'hidden',
      }}>
      <PixelGrid />
    </View>
  );
}

function PixelGrid() {
  const pixels = Array.from({ length: 36 }).map((_, index) => index);
  return (
    <View style={styles.pixelGrid}>
      {pixels.map((index) => (
        <View key={index} style={styles.pixel} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  subtitle: {
    fontSize: 13,
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
  canvasWrap: {
    paddingHorizontal: 16,
  },
  canvas: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  canvasImage: {
    width: '100%',
    height: '100%',
  },
  panel: {
    flex: 1,
  },
  panelContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    fontWeight: '700',
  },
  textInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  emojiButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  emojiText: {
    fontSize: 22,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderWidth: 2,
  },
  pixelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pixel: {
    width: '16.66%',
    height: '16.66%',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});
