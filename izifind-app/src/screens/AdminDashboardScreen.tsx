import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppScreen } from '@/components/AppScreen';
import { Card } from '@/components/Card';
import { InlineNotice } from '@/components/InlineNotice';
import { SectionHeader } from '@/components/SectionHeader';
import { colors, radius, spacing, fontSizes, fontWeights } from '@/constants/theme';
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

  // Helper function to map resource keys to icons and colors
  const getResourceMeta = (key: string) => {
    switch (key) {
      case 'categories':
        return { icon: 'shape-outline' as const, color: colors.primary };
      case 'sous-categories':
        return { icon: 'file-tree' as const, color: '#A882FF' };
      case 'marques':
        return { icon: 'tag-outline' as const, color: '#60A5FA' };
      case 'couleurs':
        return { icon: 'palette-outline' as const, color: '#2DD4BF' };
      case 'statuts':
        return { icon: 'list-status' as const, color: '#FBBF24' };
      case 'titres':
        return { icon: 'format-title' as const, color: '#A882FF' };
      case 'objets':
        return { icon: 'cube-outline' as const, color: colors.lost };
      case 'images':
        return { icon: 'image-outline' as const, color: '#60A5FA' };
      case 'modifications':
        return { icon: 'file-document-edit-outline' as const, color: colors.primary };
      case 'promesses':
        return { icon: 'hand-coin-outline' as const, color: '#FBBF24' };
      case 'temoignages':
        return { icon: 'chat-outline' as const, color: '#2DD4BF' };
      case 'commissariats':
        return { icon: 'shield-outline' as const, color: colors.primary };
      default:
        return { icon: 'database-outline' as const, color: colors.textMuted };
    }
  };

  // Custom Header
  const HeaderComponent = (
    <View style={styles.header}>
      <Pressable onPress={() => router.replace('/')} style={styles.backButton}>
        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.dark} />
      </Pressable>
      <Text style={styles.headerTitle}>Administration</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  return (
    <AppScreen header={HeaderComponent} scroll={false} style={styles.screen}>
      <SectionHeader 
        title="Dashboard" 
        subtitle="Gestion des référentiels système."
        style={{ paddingHorizontal: spacing.md }}
      />

      {/* Admin Stats Summary */}
      <View style={styles.statsRow}>
        <Card style={styles.statBox}>
          <View style={[styles.statIconCircle, { backgroundColor: 'rgba(244, 149, 23, 0.08)' }]}>
            <MaterialCommunityIcons name="database" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.statValue}>{cards.length}</Text>
            <Text style={styles.statLabel}>Ressources</Text>
          </View>
        </Card>
        
        <Card style={styles.statBox}>
          <View style={[styles.statIconCircle, { backgroundColor: 'rgba(45, 212, 191, 0.08)' }]}>
            <MaterialCommunityIcons name="shield-check-outline" size={20} color="#2DD4BF" />
          </View>
          <View>
            <Text style={styles.statValue}>Admin</Text>
            <Text style={styles.statLabel}>Session active</Text>
          </View>
        </Card>
      </View>

      {/* Grid Menu */}
      <FlatList
        data={cards}
        numColumns={2}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => {
          const meta = getResourceMeta(item.key);
          return (
            <Pressable 
              style={({ pressed }) => [
                styles.resourceCard,
                pressed && styles.resourceCardPressed
              ]} 
              onPress={() => router.push(`/admin/${item.key}`)}
            >
              <View style={[styles.resourceIconCircle, { backgroundColor: `${meta.color}10` }]}>
                <MaterialCommunityIcons name={meta.icon} size={22} color={meta.color} />
              </View>
              <Text style={styles.resourceLabel} numberOfLines={1}>{item.label}</Text>
              <Text style={styles.resourceSubtitle} numberOfLines={2}>{item.subtitle}</Text>
            </Pressable>
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(21, 26, 49, 0.04)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.dark,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  statIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    color: colors.dark,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 1,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: 80,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  resourceCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(21, 26, 49, 0.04)',
    padding: spacing.md,
    gap: 4,
    shadowColor: '#151a31',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  resourceCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
    borderColor: 'rgba(244, 149, 23, 0.15)',
    shadowOpacity: 0.04,
  },
  resourceIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  resourceLabel: {
    color: colors.dark,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
  },
  resourceSubtitle: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    lineHeight: 15,
  },
});


