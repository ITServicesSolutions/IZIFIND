import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { useAuth } from '@/auth/AuthContext';

const icon = (name: keyof typeof MaterialCommunityIcons.glyphMap) =>
  ({ color, size }: { color: string; size: number }) => <MaterialCommunityIcons name={name} color={color} size={size} />;

export default function TabLayout() {
  const auth = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentSoft,
        tabBarInactiveTintColor: 'rgba(246,243,234,0.55)',
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarIcon: icon('home-variant') }} />
      <Tabs.Screen name="catalog" options={{ title: 'Catalogue', tabBarIcon: icon('magnify') }} />
      <Tabs.Screen name="declare" options={{ title: 'Déclarer', tabBarIcon: icon('plus-circle-outline') }} />
      <Tabs.Screen name="map" options={{ title: 'Carte', tabBarIcon: icon('map-marker-outline') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: icon('account-circle-outline') }} />
      {auth.isAdmin ? <Tabs.Screen name="admin" options={{ title: 'Admin', tabBarIcon: icon('shield-account-outline') }} /> : null}
    </Tabs>
  );
}
