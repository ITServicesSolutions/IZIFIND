import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { Card } from '@/components/Card';
import { InlineNotice } from '@/components/InlineNotice';
import { AnnonceCard } from '@/components/AnnonceCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { colors, radius, spacing } from '@/constants/theme';
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
        if (!mounted) {
          return;
        }
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
    return items.filter((item) => {
      const matchesStatus = activeStatus === 'all' || item.statut_id === activeStatus;
      const haystack = normalizeText(`${item.description} ${item.lieu ?? ''}`);
      return matchesStatus && (!needle || haystack.includes(needle));
    });
  }, [activeStatus, items, query]);

  const statusLabel = (id: number) => statuts.find((item) => item.id === id)?.name || `Statut ${id}`;

  return (
    <AppScreen>
      <SectionHeader title="Catalogue" subtitle="Recherchez les objets publics par mot-clé ou statut." />

      <Card>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.search}
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher par description ou lieu"
            placeholderTextColor="rgba(246,243,234,0.45)"
          />
        </View>
        <View style={styles.filters}>
          <Pressable
            onPress={() => setActiveStatus('all')}
            style={[styles.filterChip, activeStatus === 'all' ? styles.filterChipActive : null]}
          >
            <Text style={styles.filterText}>Tous</Text>
          </Pressable>
          {statuts.map((status) => (
            <Pressable
              key={status.id}
              onPress={() => setActiveStatus(status.id)}
              style={[styles.filterChip, activeStatus === status.id ? styles.filterChipActive : null]}
            >
              <Text style={styles.filterText}>{status.name}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {error ? <InlineNotice tone="danger" message={error} /> : null}
      {loading ? <InlineNotice tone="info" message="Chargement des objets..." /> : null}

      {!loading && filtered.length === 0 ? (
        <InlineNotice tone="warning" message="Aucun objet ne correspond à cette recherche." />
      ) : null}

      <FlatList
        scrollEnabled={false}
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <AnnonceCard objet={item} onPress={() => router.push(`/object/${item.id}`)} />
        )}
      />

      <PrimaryButton label="Déclarer un objet perdu" onPress={() => router.push('/declare?type=lost')} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    gap: spacing.sm,
  },
  search: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    paddingHorizontal: spacing.md,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
});
