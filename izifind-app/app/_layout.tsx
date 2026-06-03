import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/auth/AuthContext';
import { AppScreen } from '@/components/AppScreen';
import { InlineNotice } from '@/components/InlineNotice';

function RootNavigator() {
  const auth = useAuth();

  if (!auth.isReady) {
    return (
      <AppScreen>
        <InlineNotice tone="info" message="Initialisation de l'application..." />
      </AppScreen>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="object/[id]" />
    </Stack>
  );
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

