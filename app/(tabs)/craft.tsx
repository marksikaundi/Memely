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
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { LayerTransform, TransformableLayer } from '@/components/meme/transformable-layer';
import { EmojiPicker } from '@/components/meme/emoji-picker';
import { defaultQuickEmojis } from '@/data/emoji-catalog';

const textPalette = ['#FFFFFF', '#0B0F1F', '#FF6B35', '#FFD23F', '#00F5D4', '#FF5D8F'];
const strokePalette = ['#000000', '#202124', '#FFFFFF'];
const backgroundPalette = ['#F8F4F0', '#0E0F12', '#FFEDE4', '#E7F0FF', '#FEF6C9', '#EAF8F3'];
const shapePalette = ['#FFFFFF', '#0B0F1F', '#FF6B35', '#FFD23F', '#00F5D4', '#9B5DE5'];

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

type ShapeKind = 'bubble' | 'arrow' | 'box';
type ShapePattern = 'solid' | 'dots' | 'stripes';

type ShapeLayer = {
  id: string;
  type: 'shape';
  shape: ShapeKind;
  pattern: ShapePattern;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  size: { width: number; height: number };
  transform: LayerTransform;
};

type CraftLayer = TextLayer | ShapeLayer;

type Background =
  | { kind: 'color'; color: string }
  | { kind: 'image'; uri: string };

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

const buildTextLayer = (text: string, yOffset = 0, sticker = false): CraftLayer => ({
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

const buildShapeLayer = (shape: ShapeKind): ShapeLayer => ({
  id: createId(),
  type: 'shape',
  shape,
  pattern: 'solid',
  fill: '#FFFFFF',
  stroke: '#0B0F1F',
  strokeWidth: 2,
  opacity: 1,
  size:
    shape === 'arrow'
      ? { width: 180, height: 64 }
      : shape === 'bubble'
        ? { width: 200, height: 140 }
        : { width: 200, height: 120 },
  transform: { x: 0, y: 0, scale: 1, rotation: 0 },
});

export default function CraftScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [background, setBackground] = useState<Background>({ kind: 'color', color: backgroundPalette[0] });
  const [layers, setLayers] = useState<CraftLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [recentStickers, setRecentStickers] = useState<string[]>([]);
  const [stickerPickerOpen, setStickerPickerOpen] = useState(false);
  const [canvasRatio, setCanvasRatio] = useState(1);
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

  const selectedLayer = useMemo(
    () => layers.find((layer) => layer.id === selectedLayerId) ?? null,
    [layers, selectedLayerId]
  );

  type LayerUpdater = Partial<TextLayer> | Partial<ShapeLayer>;

  const updateLayer = useCallback((id: string, updater: LayerUpdater) => {
    setLayers((current): CraftLayer[] =>
      current.map((layer) => {
        if (layer.id !== id) return layer;
        if (layer.type === 'shape') {
          return { ...layer, ...(updater as Partial<ShapeLayer>) };
        }
        return { ...layer, ...(updater as Partial<TextLayer>) };
      })
    );
  }, []);

  const updateLayerTransform = useCallback((id: string, transform: LayerTransform) => {
    setLayers((current) => current.map((layer) => (layer.id === id ? { ...layer, transform } : layer)));
  }, []);

  const addTextLayer = useCallback(
    (text = 'YOUR TEXT HERE') => {
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
    setRecentStickers((current) => {
      const next = [emoji, ...current.filter((item) => item !== emoji)];
      return next.slice(0, 8);
    });
  }, []);

  const addShapeLayer = useCallback((shape: ShapeKind) => {
    const newLayer = buildShapeLayer(shape);
    setLayers((current) => [...current, newLayer]);
    setSelectedLayerId(newLayer.id);
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
    setBackground({ kind: 'image', uri: asset.uri });
  }, []);

  const resetCanvas = useCallback(() => {
    setBackground({ kind: 'color', color: backgroundPalette[0] });
    setLayers([]);
    setSelectedLayerId(null);
  }, []);

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

  useEffect(() => {
    if (canvasSize.width === 0 || layers.length > 0) return;
    setLayers([buildTextLayer('MAKE IT YOURS', -140), buildTextLayer('PURE CHAOS', 140)]);
  }, [canvasSize.width, layers.length]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
      <View style={[styles.header, { paddingTop: Math.max(16, insets.top + 8) }]}> 
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Craft Lab</Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>Blank canvas. Big energy.</Text>
        </View>
        <Pressable style={[styles.randomButton, { backgroundColor: theme.accent }]} onPress={() => addTextLayer()}>
          <Text style={styles.randomButtonText}>Add Text</Text>
        </Pressable>
      </View>

      <View style={styles.canvasWrap}>
        <View
          ref={canvasRef}
          style={[styles.canvas, { backgroundColor: theme.canvas, borderColor: theme.border, aspectRatio: canvasRatio }]}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setCanvasSize({ width, height });
          }}>
          {background.kind === 'image' ? (
            <Image source={{ uri: background.uri }} style={styles.canvasImage} contentFit="cover" />
          ) : (
            <View style={[styles.canvasFill, { backgroundColor: background.color }]} />
          )}

          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedLayerId(null)} />

          {layers.map((layer) => (
            <TransformableLayer
              key={layer.id}
              id={layer.id}
              selected={layer.id === selectedLayerId}
              anchor={{ x: canvasSize.width / 2, y: canvasSize.height / 2 }}
              transform={layer.transform}
              onSelect={setSelectedLayerId}
              onTransformEnd={updateLayerTransform}>
              {layer.type === 'shape' ? (
                <ShapeLayerView layer={layer} />
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
          <ActionButton label="Upload" onPress={handlePickImage} theme={theme} />
          <ActionButton label="Add Text" onPress={() => addTextLayer()} theme={theme} />
          <ActionButton label="Shapes" onPress={() => addShapeLayer('bubble')} theme={theme} />
          <ActionButton label="Stickers" onPress={() => setStickerPickerOpen(true)} theme={theme} />
          <ActionButton label="Clear" onPress={resetCanvas} theme={theme} tone="danger" />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Canvas Size</Text>
          <View style={styles.actionRow}>
            <ActionButton label="Square" onPress={() => setCanvasRatio(1)} theme={theme} active={canvasRatio === 1} />
            <ActionButton label="Story" onPress={() => setCanvasRatio(9 / 16)} theme={theme} active={canvasRatio === 9 / 16} />
            <ActionButton label="Wide" onPress={() => setCanvasRatio(16 / 9)} theme={theme} active={canvasRatio === 16 / 9} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Background</Text>
          <View style={styles.actionRow}>
            {backgroundPalette.map((color) => (
              <Pressable
                key={color}
                onPress={() => setBackground({ kind: 'color', color })}
                style={[
                  styles.colorSwatch,
                  {
                    backgroundColor: color,
                    borderColor: background.kind === 'color' && background.color === color ? theme.accent : 'transparent',
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Shapes</Text>
          <View style={styles.actionRow}>
            <ActionButton label="Bubble" onPress={() => addShapeLayer('bubble')} theme={theme} />
            <ActionButton label="Arrow" onPress={() => addShapeLayer('arrow')} theme={theme} />
            <ActionButton label="Box" onPress={() => addShapeLayer('box')} theme={theme} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Stickers</Text>
          <View style={styles.actionRow}>
            {(recentStickers.length > 0 ? recentStickers : defaultQuickEmojis.slice(0, 6)).map((emoji) => (
              <Pressable
                key={emoji}
                style={[styles.emojiButton, { backgroundColor: theme.panelAlt }]}
                onPress={() => addStickerLayer(emoji)}>
                <Text style={styles.emojiText}>{emoji}</Text>
              </Pressable>
            ))}
            <Pressable
              style={[styles.allStickerButton, { borderColor: theme.border, backgroundColor: theme.panel }]}
              onPress={() => setStickerPickerOpen(true)}>
              <Text style={[styles.allStickerText, { color: theme.text }]}>All</Text>
            </Pressable>
          </View>
        </View>

        {selectedLayer && selectedLayer.type !== 'shape' ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Text Style</Text>
            <TextInput
              value={selectedLayer.text}
              onChangeText={(text) => updateLayer(selectedLayer.id, { text })}
              placeholder="Type something"
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

        {selectedLayer && selectedLayer.type === 'shape' ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Shape Style</Text>
            <View style={styles.actionRow}>
              {shapePalette.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => updateLayer(selectedLayer.id, { fill: color })}
                  style={[
                    styles.colorSwatch,
                    {
                      backgroundColor: color,
                      borderColor: selectedLayer.fill === color ? theme.accent : 'transparent',
                    },
                  ]}
                />
              ))}
            </View>
            <View style={styles.actionRow}>
              {strokePalette.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => updateLayer(selectedLayer.id, { stroke: color })}
                  style={[
                    styles.colorSwatch,
                    {
                      backgroundColor: color,
                      borderColor: selectedLayer.stroke === color ? theme.accent : 'transparent',
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
                label="Solid"
                onPress={() => updateLayer(selectedLayer.id, { pattern: 'solid' })}
                theme={theme}
                active={selectedLayer.pattern === 'solid'}
              />
              <ActionButton
                label="Dots"
                onPress={() => updateLayer(selectedLayer.id, { pattern: 'dots' })}
                theme={theme}
                active={selectedLayer.pattern === 'dots'}
              />
              <ActionButton
                label="Stripes"
                onPress={() => updateLayer(selectedLayer.id, { pattern: 'stripes' })}
                theme={theme}
                active={selectedLayer.pattern === 'stripes'}
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

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Export</Text>
          <View style={styles.actionRow}>
            <ActionButton label="Save" onPress={handleSave} theme={theme} tone="primary" />
            <ActionButton label="Share" onPress={handleShare} theme={theme} tone="primary" />
          </View>
        </View>
      </ScrollView>

      <EmojiPicker
        visible={stickerPickerOpen}
        onClose={() => setStickerPickerOpen(false)}
        onSelect={(emoji) => {
          addStickerLayer(emoji);
          setStickerPickerOpen(false);
        }}
        theme={theme}
        recentEmojis={recentStickers}
      />
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

type ShapeLayerViewProps = {
  layer: ShapeLayer;
};

type PatternOverlayProps = {
  pattern: ShapePattern;
  color: string;
};

function PatternOverlay({ pattern, color }: PatternOverlayProps) {
  if (pattern === 'solid') return null;

  if (pattern === 'dots') {
    const dots = Array.from({ length: 30 }).map((_, index) => index);
    return (
      <View style={[styles.patternFill, styles.patternFillDots]}>
        {dots.map((index) => (
          <View key={index} style={[styles.patternDot, { backgroundColor: color }]} />
        ))}
      </View>
    );
  }

  const stripes = Array.from({ length: 8 }).map((_, index) => index);
  return (
    <View style={[styles.patternFill, styles.patternFillStripes]}>
      {stripes.map((index) => (
        <View key={index} style={[styles.patternStripe, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

function ShapeLayerView({ layer }: ShapeLayerViewProps) {
  const tailSize = 14;
  const outerSize = tailSize + layer.strokeWidth;

  if (layer.shape === 'box') {
    return (
      <View
        style={{
          width: layer.size.width,
          height: layer.size.height,
          backgroundColor: layer.fill,
          borderColor: layer.stroke,
          borderWidth: layer.strokeWidth,
          borderRadius: 14,
          opacity: layer.opacity,
          overflow: 'hidden',
        }}
      >
        <PatternOverlay pattern={layer.pattern} color={layer.stroke} />
      </View>
    );
  }

  if (layer.shape === 'arrow') {
    return (
      <View style={{ width: layer.size.width, height: layer.size.height, opacity: layer.opacity }}>
          <View style={styles.arrowRow}>
            <View style={[styles.arrowLine, { backgroundColor: layer.fill, borderColor: layer.stroke, borderWidth: layer.strokeWidth }]}>
              <PatternOverlay pattern={layer.pattern} color={layer.stroke} />
            </View>
          <View
            style={[
              styles.arrowHead,
              {
                borderLeftColor: layer.fill,
                borderTopWidth: 18 + layer.strokeWidth,
                borderBottomWidth: 18 + layer.strokeWidth,
                borderLeftWidth: 26 + layer.strokeWidth,
              },
            ]}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={{ width: layer.size.width, height: layer.size.height, opacity: layer.opacity }}>
      <View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: layer.fill,
          borderColor: layer.stroke,
          borderWidth: layer.strokeWidth,
          borderRadius: 22,
          overflow: 'hidden',
        }}>
        <PatternOverlay pattern={layer.pattern} color={layer.stroke} />
      </View>
      <View
        style={[
          styles.bubbleTailOuter,
          {
            borderTopColor: layer.stroke,
            borderTopWidth: outerSize,
            borderLeftWidth: outerSize,
            borderRightWidth: outerSize,
            bottom: -outerSize + 6,
          },
        ]}
      />
      <View
        style={[
          styles.bubbleTailInner,
          {
            borderTopColor: layer.fill,
            borderTopWidth: tailSize,
            borderLeftWidth: tailSize,
            borderRightWidth: tailSize,
            bottom: -tailSize + 6 + layer.strokeWidth,
            left: 28 + layer.strokeWidth,
          },
        ]}
      />
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
  canvasFill: {
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
  allStickerButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  allStickerText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderWidth: 2,
  },
  arrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  arrowLine: {
    flex: 1,
    height: 10,
    borderRadius: 6,
    overflow: 'hidden',
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderTopWidth: 18,
    borderBottomWidth: 18,
    borderLeftWidth: 26,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  bubbleTailOuter: {
    position: 'absolute',
    left: 24,
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  bubbleTailInner: {
    position: 'absolute',
    left: 28,
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  patternFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternFillDots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 10,
    opacity: 0.35,
  },
  patternDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  patternFillStripes: {
    justifyContent: 'space-evenly',
    paddingVertical: 8,
    opacity: 0.35,
  },
  patternStripe: {
    width: '100%',
    height: 8,
    borderRadius: 6,
  },
});
