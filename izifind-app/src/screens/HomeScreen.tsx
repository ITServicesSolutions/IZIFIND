import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, Image, Pressable, ActivityIndicator, Alert, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppScreen } from '@/components/AppScreen';
import { Card } from '@/components/Card';
import { AnnonceCard } from '@/components/AnnonceCard';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { SearchBar } from '@/components/SearchBar';
import { StatBadge } from '@/components/StatBadge';
import { colors, radius, spacing, fontSizes, fontWeights } from '@/constants/theme';
import { useAuth } from '@/auth/AuthContext';
import { getObjects, getStatistics } from '@/services/catalog';
import type { Objet } from '@/types/api';
import { normalizeText } from '@/utils/format';

export function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [stats, setStats] = useState({ perdus: 0, trouves: 0, postes: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentItems, setRecentItems] = useState<Objet[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getStatistics();
        if (mounted) setStats(data);
      } catch (err) {
        console.error('Failed to load statistics', err);
      } finally {
        if (mounted) setLoadingStats(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getObjects({ limit: 12 });
        if (mounted) setRecentItems(data);
      } catch {
        if (mounted) setFeedError('Impossible de charger les déclarations récentes.');
      } finally {
        if (mounted) setLoadingFeed(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filteredItems = useMemo(() => {
    const needle = normalizeText(query);
    if (!needle) return recentItems;
    return recentItems.filter((item) => normalizeText(`${item.description} ${item.lieu ?? ''}`).includes(needle));
  }, [query, recentItems]);

  // ── Feed entry animation ────────────────────────────────
  const feedAnimations = useRef<Animated.Value[]>([]).current;

  // Grow the anim-value pool whenever filteredItems grows
  useEffect(() => {
    while (feedAnimations.length < filteredItems.length) {
      feedAnimations.push(new Animated.Value(0));
    }
  }, [filteredItems.length, feedAnimations]);

  // Stagger animate when the feed loads
  useEffect(() => {
    if (!loadingFeed && filteredItems.length > 0) {
      // Reset
      feedAnimations.forEach((a) => a.setValue(0));
      const staggered = filteredItems.map((_, i) =>
        Animated.timing(feedAnimations[i] ?? new Animated.Value(1), {
          toValue: 1,
          duration: 380,
          delay: i * 70,
          useNativeDriver: true,
        }),
      );
      Animated.stagger(0, staggered).start();
    }
  }, [loadingFeed, filteredItems, feedAnimations]);

  const handleSearchPress = () => {
    router.push('/catalog');
  };

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'Vous n\'avez aucune nouvelle notification pour le moment.');
  };

  // Custom Header Component
  const HeaderComponent = (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Image 
          source={require('../../assets/images/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>
            {isAuthenticated ? `Bonjour, ${user?.username}` : 'Bienvenue sur'}
          </Text>
          <Text style={styles.appName}>IZIFIND</Text>
        </View>
      </View>
      <Pressable style={styles.notificationButton} onPress={handleNotificationPress}>
        <MaterialCommunityIcons name="bell-outline" size={22} color={colors.dark} />
        {/* Only show badge if there are notifications */}
        {false && <View style={styles.notificationBadge} />}
      </Pressable>
    </View>
  );

  return (
    <AppScreen header={HeaderComponent} contentContainerStyle={styles.scrollContent}>
      {/* Hero Banner */}
      <View style={styles.hero}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Objets perdus ou trouvés ?</Text>
          <Text style={styles.heroSubtitle}>Déclarez-les en moins de 2 minutes pour accélérer les recherches.</Text>
          <PrimaryButton 
            label={isAuthenticated ? 'Déclarer un objet' : 'Se connecter pour déclarer'} 
            onPress={() => router.push(isAuthenticated ? '/declare?type=lost' : '/login')} 
            variant="secondary"
            size="sm"
            pill
            icon="plus"
            style={styles.heroButton}
          />
        </View>
        <View style={styles.heroGraphic}>
          <Text style={styles.heroEmoji}>🔍📦</Text>
        </View>
      </View>

      <SearchBar value={query} onChangeText={setQuery} placeholder="Rechercher dans les déclarations récentes..." />

      {/* Quick Access Grid (2x2) */}
      <SectionHeader title="Accès rapides" subtitle="Les raccourcis essentiels pour naviguer." />
      <View style={styles.grid}>
        <Pressable style={styles.gridCard} onPress={() => router.push('/catalog')}>
          <View style={[styles.gridIconCircle, { backgroundColor: colors.pastel.orange }]}>
            <MaterialCommunityIcons name="database-search" size={24} color={colors.primary} />
          </View>
          <Text style={styles.gridTitle}>Catalogue</Text>
          <Text style={styles.gridDesc}>Consulter les objets signalés</Text>
        </Pressable>

        <Pressable style={styles.gridCard} onPress={() => router.push(isAuthenticated ? '/declare?type=lost' : '/login')}>
          <View style={[styles.gridIconCircle, { backgroundColor: colors.pastel.purple }]}>
            <MaterialCommunityIcons name="plus-circle-outline" size={24} color="#A882FF" />
          </View>
          <Text style={styles.gridTitle}>Déclarer</Text>
          <Text style={styles.gridDesc}>Signaler un objet perdu</Text>
        </Pressable>

        <Pressable style={styles.gridCard} onPress={() => router.push('/map')}>
          <View style={[styles.gridIconCircle, { backgroundColor: colors.pastel.blue }]}>
            <MaterialCommunityIcons name="map-marker-radius" size={24} color="#60A5FA" />
          </View>
          <Text style={styles.gridTitle}>Carte</Text>
          <Text style={styles.gridDesc}>Trouver un commissariat</Text>
        </Pressable>

        <Pressable style={styles.gridCard} onPress={() => router.push(isAuthenticated ? '/profile' : '/login')}>
          <View style={[styles.gridIconCircle, { backgroundColor: colors.pastel.green }]}>
            <MaterialCommunityIcons name="account-circle-outline" size={24} color="#2DD4BF" />
          </View>
          <Text style={styles.gridTitle}>{isAuthenticated ? 'Profil' : 'Connexion'}</Text>
          <Text style={styles.gridDesc}>
            {isAuthenticated ? 'Gérer votre compte' : 'Se connecter'}
          </Text>
        </Pressable>
      </View>

      {/* Admin Section (if applicable) */}
      {isAdmin && (
        <View style={styles.adminSection}>
          <SectionHeader title="Administration" subtitle="Espace réservé aux agents autorisés." />
          <Card style={styles.adminCard}>
            <View style={styles.adminHeader}>
              <MaterialCommunityIcons name="security" size={24} color={colors.primary} />
              <View style={styles.adminHeaderText}>
                <Text style={styles.adminTitle}>Espace Administrateur</Text>
                <Text style={styles.adminDesc}>Gérer les déclarations, les commissariats et les catégories.</Text>
              </View>
            </View>
            <PrimaryButton 
              label="Ouvrir le Dashboard" 
              onPress={() => router.push('/admin')} 
              variant="primary"
              size="sm"
              style={styles.adminButton}
            />
          </Card>
        </View>
      )}

      <SectionHeader title="Déclarations récentes" subtitle="Objets publics signalés par la communauté." />
      <View style={styles.feed}>
        {loadingFeed ? (
          <View style={styles.feedState}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.feedStateText}>Chargement des annonces...</Text>
          </View>
        ) : feedError ? (
          <InlineFeedNotice message={feedError} />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon="database-search"
            title="Aucune déclaration"
            description="Aucune annonce publique ne correspond à votre recherche."
            actionLabel="Voir le catalogue"
            onAction={() => router.push('/catalog')}
          />
        ) : (
          filteredItems.map((item, index) => {
            const anim = feedAnimations[index];
            const animOpacity = anim ? anim : new Animated.Value(1);
            const animTranslateY = anim
              ? anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] })
              : 0;
            return (
              <Animated.View
                key={item.id}
                style={{ opacity: animOpacity, transform: [{ translateY: animTranslateY }] }}
              >
                <AnnonceCard
                  objet={item}
                  onPress={() => router.push(`/object/${item.id}`)}
                />
              </Animated.View>
            );
          })
        )}
      </View>

      {/* Statistics Section */}
      <SectionHeader title="Statistiques" subtitle="Activité globale de la communauté." />
      <View style={styles.statsRow}>
        {loadingStats ? (
          <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
        ) : (
          <>
            <StatBadge 
              icon="cube-outline" 
              value={String(stats.perdus)} 
              label="Perdus" 
              color={colors.lost} 
              bgColor={colors.pastel.red} 
            />
            <StatBadge 
              icon="cube-send" 
              value={String(stats.trouves)} 
              label="Trouvés" 
              color={colors.primary} 
              bgColor={colors.pastel.orange} 
            />
            <StatBadge 
              icon="shield-check-outline" 
              value={String(stats.postes)} 
              label="Postes" 
              color="#2DD4BF"
              bgColor={colors.pastel.green} 
            />
          </>
        )}
      </View>
    </AppScreen>
  );
}

function InlineFeedNotice({ message }: { message: string }) {
  return (
    <Card style={styles.feedNotice}>
      <MaterialCommunityIcons name="alert-circle-outline" size={18} color={colors.lost} />
      <Text style={styles.feedNoticeText}>{message}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: spacing.sm,
    gap: spacing.md,
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
  logo: {
    width: 180,
    height: 90,
    borderRadius: radius.sm,
  },
  greetingContainer: {
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  appName: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.dark,
    lineHeight: 18,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.lost,
  },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  heroContent: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  heroTitle: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    marginBottom: 4,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: fontSizes.sm,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
  },
  heroGraphic: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 40,
  },
  searchPressable: {
    marginBottom: spacing.xs,
  },
  feed: {
    gap: spacing.xs,
  },
  feedState: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  feedStateText: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
  },
  feedNotice: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  feedNoticeText: {
    flex: 1,
    color: colors.dark,
    fontSize: fontSizes.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gridCard: {
    width: '47%',
    aspectRatio: 1.15,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(21, 26, 49, 0.04)',
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#151a31',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  gridIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  gridTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.dark,
    textAlign: 'center',
  },
  gridDesc: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  adminSection: {
    gap: spacing.xs,
  },
  adminCard: {
    gap: spacing.md,
    padding: spacing.md,
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  adminHeaderText: {
    flex: 1,
  },
  adminTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.dark,
  },
  adminDesc: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 1,
  },
  adminButton: {
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
