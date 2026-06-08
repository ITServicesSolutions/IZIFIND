import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View, ScrollView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { AppScreen } from '@/components/AppScreen';
import { Card } from '@/components/Card';
import { InlineNotice } from '@/components/InlineNotice';
import { SectionHeader } from '@/components/SectionHeader';
import { colors, radius, spacing } from '@/constants/theme';
import { getCommissariats } from '@/services/catalog';
import type { Commissariat } from '@/types/api';

// Bounding box for mapping coordinates in Paris region
const MIN_LAT = 48.81;
const MAX_LAT = 48.90;
const MIN_LNG = 2.25;
const MAX_LNG = 2.45;

export function MapScreen() {
  const [commissariats, setCommissariats] = useState<Commissariat[]>([]);
  const [selectedStation, setSelectedStation] = useState<Commissariat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // User simulated coordinates
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    let mounted = true;

    // Load commissariats
    (async () => {
      try {
        const list = await getCommissariats();
        if (mounted) {
          setCommissariats(list);
          if (list.length > 0) {
            setSelectedStation(list[0]);
          }
        }
      } catch {
        if (mounted) {
          setError('Impossible de récupérer la liste des commissariats.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    // Attempt to get user coordinates
    if (Platform.OS !== 'web') {
      (async () => {
        try {
          const { granted } = await Location.requestForegroundPermissionsAsync();
          if (granted) {
            const pos = await Location.getCurrentPositionAsync({});
            if (mounted) {
              setUserLocation({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              });
            }
          }
        } catch {
          // Fallback to mock position
          if (mounted) {
            setUserLocation({ latitude: 48.8566, longitude: 2.3522 });
          }
        }
      })();
    } else {
      setUserLocation({ latitude: 48.8566, longitude: 2.3522 });
    }

    return () => {
      mounted = false;
    };
  }, []);

  // Filter list of stations
  const filteredStations = useMemo(() => {
    return commissariats.filter((item) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return (
        item.name.toLowerCase().includes(query) ||
        (item.adresse && item.adresse.toLowerCase().includes(query))
      );
    });
  }, [commissariats, searchQuery]);

  // Project coordinates (lat, lng) to map container percentages
  const getPositionStyle = (lat: number, lng: number) => {
    const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 100;
    const y = (1 - (lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * 100;
    return {
      left: `${Math.max(5, Math.min(95, x))}%`,
      top: `${Math.max(5, Math.min(95, y))}%`,
    } as any;
  };

  return (
    <AppScreen>
      <SectionHeader
        title="Commissariats Partenaires"
        subtitle="Localisez les points relais partenaires pour sécuriser et authentifier vos objets trouvés."
      />

      {error ? <InlineNotice tone="danger" message={error} /> : null}
      {loading ? <InlineNotice tone="info" message="Chargement de la carte..." /> : null}

      {!loading && !error && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Simulated Map Container */}
          <Card style={styles.mapCard}>
            <View style={styles.mapContainer}>
              {/* Map background grid lines */}
              <View style={styles.mapGridLineH1} />
              <View style={styles.mapGridLineH2} />
              <View style={styles.mapGridLineV1} />
              <View style={styles.mapGridLineV2} />
              <View style={styles.radarRing1} />
              <View style={styles.radarRing2} />

              {/* User location pin */}
              {userLocation && (
                <View
                  style={[
                    styles.userPinWrapper,
                    getPositionStyle(userLocation.latitude, userLocation.longitude),
                  ]}
                >
                  <View style={styles.userPinPulse} />
                  <View style={styles.userPinDot} />
                </View>
              )}

              {/* Station pins */}
              {commissariats.map((station) => {
                const isSelected = selectedStation?.id === station.id;
                return (
                  <Pressable
                    key={station.id}
                    style={[
                      styles.pinWrapper,
                      getPositionStyle(station.latitude, station.longitude),
                    ]}
                    onPress={() => setSelectedStation(station)}
                  >
                    <MaterialCommunityIcons
                      name="shield"
                      size={isSelected ? 26 : 20}
                      color={isSelected ? colors.accentSoft : colors.primary}
                      style={styles.pinShadow}
                    />
                    {isSelected && <View style={styles.selectedPinRing} />}
                  </Pressable>
                );
              })}
            </View>

            {/* Map Legend */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
                <Text style={styles.legendText}>Sélectionné</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                <Text style={styles.legendText}>Commissariat</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
                <Text style={styles.legendText}>Votre position</Text>
              </View>
            </View>
          </Card>

          {/* Selected Station detail drawer */}
          {selectedStation && (
            <Card style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <View style={styles.detailTitleWrapper}>
                  <MaterialCommunityIcons name="shield-check" size={24} color={colors.primary} />
                  <Text style={styles.detailTitle}>{selectedStation.name}</Text>
                </View>
                <View style={styles.coordsBadge}>
                  <Text style={styles.coordsBadgeText}>
                    {selectedStation.latitude.toFixed(4)}, {selectedStation.longitude.toFixed(4)}
                  </Text>
                </View>
              </View>
              <Text style={styles.detailAddress}>
                {selectedStation.adresse || 'Adresse non renseignée'}
              </Text>
              <View style={styles.detailActions}>
                <Pressable style={styles.detailActionBtn}>
                  <MaterialCommunityIcons name="navigation" size={16} color={colors.primary} />
                  <Text style={styles.detailActionText}>Itinéraire</Text>
                </Pressable>
                <Pressable style={styles.detailActionBtn}>
                  <MaterialCommunityIcons name="phone" size={16} color={colors.primary} />
                  <Text style={styles.detailActionText}>Contacter</Text>
                </Pressable>
              </View>
            </Card>
          )}

          {/* Stations Search and Directory */}
          <Card style={styles.listCard}>
            <Text style={styles.listCardTitle}>Annuaire des commissariats</Text>
            <View style={styles.searchWrapper}>
              <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Rechercher par nom ou adresse..."
                placeholderTextColor="rgba(246,243,234,0.45)"
              />
            </View>

            <FlatList
              scrollEnabled={false}
              data={filteredStations}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => {
                const isSelected = selectedStation?.id === item.id;
                return (
                  <Pressable
                    style={[styles.listItem, isSelected && styles.listItemSelected]}
                    onPress={() => setSelectedStation(item)}
                  >
                    <View style={styles.listItemTextWrapper}>
                      <Text style={[styles.listItemName, isSelected && styles.listItemTextSelected]}>
                        {item.name}
                      </Text>
                      <Text style={styles.listItemAddress} numberOfLines={1}>
                        {item.adresse}
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name={isSelected ? 'circle-slice-8' : 'chevron-right'}
                      size={20}
                      color={isSelected ? colors.accentSoft : colors.border}
                    />
                  </Pressable>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Aucun commissariat ne correspond.</Text>
              }
            />
          </Card>
        </ScrollView>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  mapCard: {
    padding: 0,
    overflow: 'hidden',
  },
  mapContainer: {
    height: 250,
    backgroundColor: '#0F172A', // Deep space dark map container
    position: 'relative',
    overflow: 'hidden',
  },
  mapGridLineH1: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '33%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  mapGridLineH2: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '66%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  mapGridLineV1: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '33%',
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  mapGridLineV2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '66%',
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  radarRing1: {
    position: 'absolute',
    top: '25%',
    left: '35%',
    width: 100,
    height: 100,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(92, 214, 192, 0.05)',
  },
  radarRing2: {
    position: 'absolute',
    top: '10%',
    left: '25%',
    width: 180,
    height: 180,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(92, 214, 192, 0.03)',
  },
  pinWrapper: {
    position: 'absolute',
    transform: [{ translateX: -10 }, { translateY: -10 }],
    zIndex: 10,
  },
  pinShadow: {
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  selectedPinRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.accentSoft,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  userPinWrapper: {
    position: 'absolute',
    width: 16,
    height: 16,
    transform: [{ translateX: -8 }, { translateY: -8 }],
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  userPinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
  userPinPulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  detailCard: {
    gap: spacing.sm,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  detailTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  coordsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(92, 214, 192, 0.08)',
    borderRadius: 8,
  },
  coordsBadgeText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700',
  },
  detailAddress: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    paddingLeft: spacing.xl,
  },
  detailActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingLeft: spacing.xl,
  },
  detailActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(92, 214, 192, 0.25)',
  },
  detailActionText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  listCard: {
    gap: spacing.md,
  },
  listCardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: colors.text,
    fontSize: 14,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  listItemSelected: {
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
  },
  listItemTextWrapper: {
    flex: 1,
    paddingRight: spacing.md,
  },
  listItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  listItemTextSelected: {
    color: colors.accentSoft,
  },
  listItemAddress: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  listSeparator: {
    height: 1,
    backgroundColor: colors.border,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.muted,
    paddingVertical: spacing.lg,
  },
});
