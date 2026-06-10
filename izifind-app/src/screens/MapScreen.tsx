import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View, Platform, Linking, Share, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { AppScreen } from '@/components/AppScreen';
import { Card } from '@/components/Card';
import { InlineNotice } from '@/components/InlineNotice';
import { colors, radius, spacing, fontSizes, fontWeights } from '@/constants/theme';
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
  const [bottomSheetExpanded, setBottomSheetExpanded] = useState(false);

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

  const handleNavigate = (station: Commissariat) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${station.name}@${station.latitude},${station.longitude}`,
      android: `geo:0,0?q=${station.latitude},${station.longitude}(${station.name})`,
      web: `https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`,
    });
    if (url) Linking.openURL(url);
  };

  const handleCall = () => {
    Alert.alert('Contact', 'Le numéro de ce commissariat n\'est pas renseigné dans la base de données.');
  };

  const handleShare = async (station: Commissariat) => {
    try {
      await Share.share({
        message: `Retrouvez vos objets au ${station.name}\nAdresse: ${station.adresse || 'Non renseignée'}\nLocalisation: https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`,
      });
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  // Custom Header
  const HeaderComponent = (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.headerIconCircle}>
          <MaterialCommunityIcons name="shield-check" size={20} color={colors.primary} />
        </View>
        <View>
          <Text style={styles.headerTitle}>Commissariats</Text>
          <Text style={styles.headerSubtitle}>{commissariats.length} points de dépôt</Text>
        </View>
      </View>
      <Pressable
        style={styles.expandBtn}
        onPress={() => setBottomSheetExpanded(!bottomSheetExpanded)}
      >
        <MaterialCommunityIcons
          name={bottomSheetExpanded ? 'chevron-down' : 'format-list-bulleted'}
          size={20}
          color={colors.dark}
        />
      </Pressable>
    </View>
  );

  return (
    <AppScreen header={HeaderComponent} scroll={false} style={styles.screen}>
      {error ? <InlineNotice tone="danger" message={error} /> : null}
      {loading ? <InlineNotice tone="info" message="Chargement de la carte..." /> : null}

      {!loading && !error && (
        <View style={styles.container}>
          {/* Large Map Container (takes remaining space) */}
          <View style={[styles.mapContainer, bottomSheetExpanded && styles.mapContainerCompact]}>
            {/* Map background elements */}
            <View style={styles.mapGridLineH1} />
            <View style={styles.mapGridLineH2} />
            <View style={styles.mapGridLineH3} />
            <View style={styles.mapGridLineV1} />
            <View style={styles.mapGridLineV2} />
            <View style={styles.mapGridLineV3} />
            <View style={styles.radarRing1} />
            <View style={styles.radarRing2} />
            <View style={styles.radarRing3} />

            {/* Map legend */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
                <Text style={styles.legendText}>Vous</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                <Text style={styles.legendText}>Poste</Text>
              </View>
            </View>

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
                  <View style={[styles.pinBackground, isSelected && styles.pinBackgroundSelected]}>
                    <MaterialCommunityIcons
                      name="shield"
                      size={isSelected ? 18 : 14}
                      color={isSelected ? colors.white : colors.primary}
                    />
                  </View>
                  {isSelected && <View style={styles.selectedPinRing} />}
                </Pressable>
              );
            })}

            {/* Floating Station Detail Bottom Sheet */}
            {selectedStation && (
              <Card style={styles.detailCard}>
                <View style={styles.detailGrab} />
                <View style={styles.detailHeader}>
                  <View style={styles.detailTitleWrapper}>
                    <View style={styles.detailIconCircle}>
                      <MaterialCommunityIcons name="shield-check" size={18} color={colors.primary} />
                    </View>
                    <View style={styles.detailTitleTextWrapper}>
                      <Text style={styles.detailTitle} numberOfLines={1}>{selectedStation.name}</Text>
                      <Text style={styles.detailAddress} numberOfLines={1}>
                        {selectedStation.adresse || 'Adresse non renseignée'}
                      </Text>
                    </View>
                  </View>
                  <Pressable onPress={() => setSelectedStation(null)} style={styles.closeBtn}>
                    <MaterialCommunityIcons name="close" size={14} color={colors.textMuted} />
                  </Pressable>
                </View>
                <View style={styles.detailActions}>
                  <Pressable style={styles.detailActionBtn} onPress={() => handleNavigate(selectedStation)}>
                    <MaterialCommunityIcons name="navigation-variant-outline" size={16} color={colors.primary} />
                    <Text style={styles.detailActionText}>Itinéraire</Text>
                  </Pressable>
                  <Pressable style={styles.detailActionBtn} onPress={handleCall}>
                    <MaterialCommunityIcons name="phone-outline" size={16} color={colors.primary} />
                    <Text style={styles.detailActionText}>Contacter</Text>
                  </Pressable>
                  <Pressable style={styles.detailActionBtn} onPress={() => handleShare(selectedStation)}>
                    <MaterialCommunityIcons name="share-variant-outline" size={16} color={colors.primary} />
                    <Text style={styles.detailActionText}>Partager</Text>
                  </Pressable>
                </View>
              </Card>
            )}
          </View>

          {/* Scrollable Station Directory (Bottom Sheet Style) */}
          {bottomSheetExpanded && (
            <Card style={styles.directoryCard}>
              <View style={styles.directoryGrab} />
              <View style={styles.directoryHeader}>
                <Text style={styles.directoryTitle}>Annuaire</Text>
                <Text style={styles.directoryCount}>{filteredStations.length} résultat{filteredStations.length > 1 ? 's' : ''}</Text>
              </View>
              <View style={styles.searchWrapper}>
                <MaterialCommunityIcons name="magnify" size={18} color={colors.textMuted} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Rechercher par nom ou adresse..."
                  placeholderTextColor="rgba(21, 26, 49, 0.38)"
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                    <MaterialCommunityIcons name="close-circle" size={16} color={colors.textMuted} />
                  </Pressable>
                )}
              </View>

              <FlatList
                data={filteredStations}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => {
                  const isSelected = selectedStation?.id === item.id;
                  return (
                    <Pressable
                      style={[styles.listItem, isSelected && styles.listItemSelected]}
                      onPress={() => setSelectedStation(item)}
                    >
                      <View style={[styles.listIconCircle, { backgroundColor: isSelected ? 'rgba(255,107,107,0.08)' : colors.pastel.orange }]}>
                        <MaterialCommunityIcons
                          name="shield"
                          size={16}
                          color={isSelected ? colors.lost : colors.primary}
                        />
                      </View>
                      <View style={styles.listItemTextWrapper}>
                        <Text style={[styles.listItemName, isSelected && styles.listItemTextSelected]}>
                          {item.name}
                        </Text>
                        <Text style={styles.listItemAddress} numberOfLines={1}>
                          {item.adresse}
                        </Text>
                      </View>
                      <MaterialCommunityIcons
                        name={isSelected ? 'check-circle' : 'chevron-right'}
                        size={18}
                        color={isSelected ? colors.lost : 'rgba(21, 26, 49, 0.2)'}
                      />
                    </Pressable>
                  );
                }}
                ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>Aucun commissariat trouvé.</Text>
                }
                showsVerticalScrollIndicator={false}
              />
            </Card>
          )}
        </View>
      )}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.pastel.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.dark,
  },
  headerSubtitle: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  expandBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: radius.xl,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(21, 26, 49, 0.08)',
  },
  mapContainerCompact: {
    flex: 0,
    height: 260,
  },
  // Grid lines
  mapGridLineH1: { position: 'absolute', left: 0, right: 0, top: '25%', height: 1, backgroundColor: 'rgba(255,255,255,0.04)' },
  mapGridLineH2: { position: 'absolute', left: 0, right: 0, top: '50%', height: 1, backgroundColor: 'rgba(255,255,255,0.04)' },
  mapGridLineH3: { position: 'absolute', left: 0, right: 0, top: '75%', height: 1, backgroundColor: 'rgba(255,255,255,0.04)' },
  mapGridLineV1: { position: 'absolute', top: 0, bottom: 0, left: '25%', width: 1, backgroundColor: 'rgba(255,255,255,0.04)' },
  mapGridLineV2: { position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, backgroundColor: 'rgba(255,255,255,0.04)' },
  mapGridLineV3: { position: 'absolute', top: 0, bottom: 0, left: '75%', width: 1, backgroundColor: 'rgba(255,255,255,0.04)' },
  radarRing1: { position: 'absolute', top: '30%', left: '35%', width: 80, height: 80, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.06)' },
  radarRing2: { position: 'absolute', top: '20%', left: '25%', width: 150, height: 150, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.04)' },
  radarRing3: { position: 'absolute', top: '10%', left: '15%', width: 220, height: 220, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.02)' },
  // Legend
  legend: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
    fontWeight: fontWeights.semibold,
  },
  // Pins
  pinWrapper: {
    position: 'absolute',
    transform: [{ translateX: -14 }, { translateY: -14 }],
    zIndex: 10,
  },
  pinBackground: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(244, 149, 23, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBackgroundSelected: {
    backgroundColor: colors.lost,
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  selectedPinRing: {
    position: 'absolute',
    top: -5,
    left: -5,
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 107, 107, 0.4)',
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
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
    borderWidth: 2,
    borderColor: colors.white,
  },
  userPinPulse: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
  },
  // Detail Card (Bottom Sheet on Map)
  detailCard: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    zIndex: 20,
    padding: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  detailGrab: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(21,26,49,0.1)',
    alignSelf: 'center',
    marginBottom: spacing.xs,
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
  detailIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.pastel.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTitleTextWrapper: {
    flex: 1,
  },
  detailTitle: {
    color: colors.dark,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
  },
  detailAddress: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.bgAlt,
  },
  detailActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  detailActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: 'rgba(244, 149, 23, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(244, 149, 23, 0.1)',
  },
  detailActionText: {
    color: colors.primary,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
  },
  // Directory Bottom Sheet
  directoryCard: {
    flex: 1,
    padding: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    maxHeight: 320,
  },
  directoryGrab: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(21,26,49,0.1)',
    alignSelf: 'center',
    marginBottom: spacing.xs,
  },
  directoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  directoryTitle: {
    color: colors.dark,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
  },
  directoryCount: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    fontWeight: fontWeights.medium,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(21, 26, 49, 0.06)',
    borderRadius: radius.md,
    backgroundColor: colors.bgAlt,
    paddingHorizontal: spacing.md,
    height: 42,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: colors.dark,
    fontSize: fontSizes.sm,
  },
  list: {
    gap: 0,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
  },
  listItemSelected: {
    backgroundColor: 'rgba(255, 107, 107, 0.04)',
  },
  listIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemTextWrapper: {
    flex: 1,
  },
  listItemName: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.dark,
  },
  listItemTextSelected: {
    color: colors.lost,
  },
  listItemAddress: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  listSeparator: {
    height: 1,
    backgroundColor: 'rgba(21, 26, 49, 0.04)',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    paddingVertical: spacing.md,
  },
});
