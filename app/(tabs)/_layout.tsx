import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 72,
          paddingTop: 8,
          paddingBottom: 12,
          borderTopWidth: 0,
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="sparkles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Templates',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="photo.stack.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="craft"
        options={{
          title: 'Craft',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="pencil.and.scribble" color={color} />,
        }}
      />
    </Tabs>
  );
}
