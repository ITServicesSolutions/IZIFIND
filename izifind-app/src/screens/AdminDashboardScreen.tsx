import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { Card } from '@/components/Card';
import { InlineNotice } from '@/components/InlineNotice';
import { SectionHeader } from '@/components/SectionHeader';
import { colors, radius, spacing } from '@/constants/theme';
import { ADMIN_RESOURCES } from '@/config/resources';
import { useAuth } from '@/auth/AuthContext';

export function AdminDashboardScreen() {
  const router = useRouter();
  const auth = useAuth();

  const cards = useMemo(
    () => ADMIN_RESOURCES.filter((resource) => resource.key !== 'permissions' || auth.isAdmin),
    [auth.isAdmin]
  );

  if (!auth.isAuthenticated) {
    return (
      <AppScreen>
        <InlineNotice tone="warning" title="Accès restreint" message="Vous devez être connecté pour accéder à l'administration." />
      </AppScreen>
    );
  }

  if (!auth.isAdmin) {
    return (
      <AppScreen>
        <InlineNotice tone="danger" title="Accès refusé" message="Votre compte n’a pas les droits nécessaires pour l’administration." />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <SectionHeader title="Administration" subtitle="Gérez les ressources métier et les déclarations." />
      <Card>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{cards.length}</Text>
            <Text style={styles.statLabel}>Ressources</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>OK</Text>
            <Text style={styles.statLabel}>Accès admin</Text>
          </View>
        </View>
      </Card>

      <FlatList
        scrollEnabled={false}
        data={cards}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={styles.resourceCard} onPress={() => router.push(`/admin/${item.key}`)}>
            <Text style={styles.resourceLabel}>{item.label}</Text>
            <Text style={styles.resourceSubtitle}>{item.subtitle}</Text>
          </Pressable>
        )}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statBox: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    color: colors.accentSoft,
    fontSize: 26,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.text,
    fontSize: 12,
    marginTop: 4,
  },
  list: {
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  resourceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 4,
  },
  resourceLabel: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  resourceSubtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
});
