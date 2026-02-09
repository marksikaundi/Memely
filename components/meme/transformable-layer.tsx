import React, { ReactNode, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export type LayerTransform = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

type TransformableLayerProps = {
  id: string;
  selected: boolean;
  anchor: { x: number; y: number };
  transform: LayerTransform;
  onSelect: (id: string) => void;
  onTransformEnd: (id: string, transform: LayerTransform) => void;
  children: ReactNode;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function TransformableLayer({
  id,
  selected,
  anchor,
  transform,
  onSelect,
  onTransformEnd,
  children,
}: TransformableLayerProps) {
  const translateX = useSharedValue(transform.x);
  const translateY = useSharedValue(transform.y);
  const scale = useSharedValue(transform.scale);
  const rotation = useSharedValue(transform.rotation);

  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startScale = useSharedValue(1);
  const startRotation = useSharedValue(0);

  useEffect(() => {
    translateX.value = transform.x;
    translateY.value = transform.y;
    scale.value = transform.scale;
    rotation.value = transform.rotation;
  }, [transform, translateX, translateY, scale, rotation]);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
    })
    .onEnd(() => {
      runOnJS(onTransformEnd)(id, {
        x: translateX.value,
        y: translateY.value,
        scale: scale.value,
        rotation: rotation.value,
      });
    });

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      startScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = clamp(startScale.value * event.scale, 0.3, 6);
    })
    .onEnd(() => {
      runOnJS(onTransformEnd)(id, {
        x: translateX.value,
        y: translateY.value,
        scale: scale.value,
        rotation: rotation.value,
      });
    });

  const rotationGesture = Gesture.Rotation()
    .onBegin(() => {
      startRotation.value = rotation.value;
    })
    .onUpdate((event) => {
      rotation.value = startRotation.value + event.rotation;
    })
    .onEnd(() => {
      runOnJS(onTransformEnd)(id, {
        x: translateX.value,
        y: translateY.value,
        scale: scale.value,
        rotation: rotation.value,
      });
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(onSelect)(id);
  });

  const composed = Gesture.Exclusive(tapGesture, Gesture.Simultaneous(panGesture, pinchGesture, rotationGesture));

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: anchor.x,
    top: anchor.y,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotateZ: `${rotation.value}rad` },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[animatedStyle, selected && styles.selected]}>{children}</Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  selected: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderStyle: 'dashed',
    borderRadius: 6,
    padding: 6,
  },
});
