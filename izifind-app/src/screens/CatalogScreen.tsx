import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, ScrollView, ActivityIndicator, LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppScreen } from '@/components/AppScreen';
import { SearchBar } from '@/components/SearchBar';
import { EmptyState } from '@/components/EmptyState';
import { AnnonceCard } from '@/components/AnnonceCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { colors, radius, spacing, fontSizes, fontWeights } from '@/constants/theme';
import { getObjects, getStatuts } from '@/services/catalog';
import type { Objet, Statut } from '@/types/api';
import { normalizeText } from '@/utils/format';

export function CatalogScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Objet[]>([]);
  const [statuts, setStatuts] = useState<Statut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<'all' | number>('all');

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [objects, statusList] = await Promise.all([getObjects(), getStatuts()]);
        if (!mounted) return;
        setItems(objects);
        setStatuts(statusList);
      } catch {
        if (mounted) {
          setError('Impossible de charger le catalogue pour le moment.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = normalizeText(query);
    const result = items.filter((item) => {
      const matchesStatus = activeStatus === 'all' || item.statut_id === activeStatus;
      const haystack = normalizeText(`${item.description} ${item.lieu ?? ''}`);
      return matchesStatus && (!needle || haystack.includes(needle));
    });
    // Trigger layout animation when filtered list changes
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    return result;
  }, [activeStatus, items, query]);

  // Custom Header
  const HeaderComponent = (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <MaterialCommunityIcons name="arrow-left" size={22} color={colors.dark} />
      </Pressable>
      <Text style={styles.headerTitle}>Catalogue</Text>
      <View style={styles.countBadge}>
        <Text style={styles.countBadgeText}>{filtered.length}</Text>
      </View>
    </View>
  );

  // Chip icon helper
  const getChipIcon = (key: string): keyof typeof MaterialCommunityIcons.glyphMap => {
    const lower = key.toLowerCase();
    if (lower.includes('perdu')) return 'alert-circle-outline';
    if (lower.includes('trouv')) return 'check-circle-outline';
    if (lower.includes('restitu')) return 'hand-heart';
    return 'circle-outline';
  };



  return (
    <AppScreen header={HeaderComponent} scroll={false} style={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <View style={styles.searchWrapper}>
              <SearchBar value={query} onChangeText={setQuery} placeholder="Rechercher par description ou lieu..." />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}
            >
              <Pressable
                onPress={() => setActiveStatus('all')}
                style={[styles.chip, activeStatus === 'all' && styles.chipActive]}
              >
                <MaterialCommunityIcons
                  name="view-grid-outline"
                  size={14}
                  color={activeStatus === 'all' ? colors.white : colors.dark}
                />
                <Text style={[styles.chipText, activeStatus === 'all' && styles.chipTextActive]}>
                  Tous
                </Text>
              </Pressable>
              {statuts.map((status) => {
                const isActive = activeStatus === status.id;
                return (
                  <Pressable
                    key={status.id}
                    onPress={() => setActiveStatus(status.id)}
                    style={[styles.chip, isActive && styles.chipActive]}
                  >
                    <MaterialCommunityIcons
                      name={getChipIcon(status.name)}
                      size={14}
                      color={isActive ? colors.white : colors.dark}
                    />
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                      {status.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>
                {filtered.length} objet{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
              </Text>
              {query.length > 0 && (
                <Pressable onPress={() => { setQuery(''); setActiveStatus('all'); }} hitSlop={8}>
                  <Text style={styles.clearText}>Réinitialiser</Text>
                </Pressable>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="search-web"
              title="Aucun objet trouvé"
              description="Nous n'avons trouvé aucun objet correspondant à vos critères de recherche."
              actionLabel="Réinitialiser les filtres"
              onAction={() => {
                setQuery('');
                setActiveStatus('all');
              }}
            />
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Chargement du catalogue...</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <AnnonceCard objet={item} onPress={() => router.push(`/object/${item.id}`)} />
          </View>
        )}
      />

      {/* Floating Bottom Button Container */}
      <View style={styles.footer}>
        <PrimaryButton
          label="Déclarer un objet"
          onPress={() => router.push('/declare?type=lost')}
          variant="primary"
          size="lg"
          icon="plus-circle"
          style={styles.floatingButton}
        />
      </View>
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
  countBadge: {
    minWidth: 32,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  countBadgeText: {
    color: colors.white,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
  },
  headerContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  searchWrapper: {
    marginBottom: spacing.xs,
  },
  chipsScroll: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(21, 26, 49, 0.06)',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.dark,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
  chipTextActive: {
    color: colors.white,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.xs,
  },
  resultLabel: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    fontWeight: fontWeights.medium,
  },
  clearText: {
    fontSize: fontSizes.xs,
    color: colors.primary,
    fontWeight: fontWeights.bold,
  },
  list: {
    paddingBottom: 110,
    gap: spacing.xs,
  },
  cardWrapper: {
    paddingHorizontal: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl * 2,
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(250, 249, 246, 0.92)',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(21, 26, 49, 0.04)',
  },
  floatingButton: {
    width: '100%',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
});
