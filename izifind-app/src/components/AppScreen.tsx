import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
}

export function AppScreen({ children, scroll = true }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.backgroundGlow} />
      <View style={styles.backgroundGlowAlt} />
      {scroll ? (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {children}
        </ScrollView>
      ) : (
        <View style={styles.container}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  backgroundGlow: {
    position: 'absolute',
    top: -100,
    right: -90,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(249,115,22,0.14)',
  },
  backgroundGlowAlt: {
    position: 'absolute',
    bottom: -80,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 200,
    backgroundColor: 'rgba(96,165,250,0.12)',
  },
});
