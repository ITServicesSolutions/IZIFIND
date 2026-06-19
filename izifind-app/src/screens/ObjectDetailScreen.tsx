import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppScreen } from '@/components/AppScreen';
import { Card } from '@/components/Card';
import { InlineNotice } from '@/components/InlineNotice';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { colors, radius, spacing, fontSizes, fontWeights } from '@/constants/theme';
import { getImages, getObjectById, getStatuts, getTemoignages, transmettreObjet, validerObjet } from '@/services/catalog';
import { createTemoignage } from '@/services/community';
import { useAuth } from '@/auth/AuthContext';
import type { ImageObjet, Objet, Statut, Temoignage } from '@/types/api';
import { formatDate } from '@/utils/format';
import { shareObject } from '@/utils/share';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GALLERY_HEIGHT = 240;
const GALLERY_IMAGE_WIDTH = SCREEN_WIDTH - spacing.md * 2;

export function ObjectDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const auth = useAuth();
  const [objet, setObjet] = useState<Objet | null>(null);
  const [images, setImages] = useState<ImageObjet[]>([]);
  const [statuts, setStatuts] = useState<Statut[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [rating, setRating] = useState(5);
  const [temoignages, setTemoignages] = useState<Temoignage[]>([]);
  const [sending, setSending] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [detail, allImages, statusList, allTemoignages] = await Promise.all([
          getObjectById(Number(id)),
          getImages(),
          getStatuts(),
          getTemoignages(),
        ]);
        if (!mounted) return;
        setObjet(detail);
        setImages(allImages.filter((image) => image.objet_id === detail.id));
        setStatuts(statusList);
        setTemoignages(allTemoignages.filter(t => t.objet_id === detail.id));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const statusLabel = useMemo(
    () => statuts.find((item) => item.id === objet?.statut_id)?.name || `Statut ${objet?.statut_id ?? ''}`,
    [objet?.statut_id, statuts]
  );

  const statutPerdu = useMemo(() => statuts.find(s => s.name.toUpperCase() === 'PERDU'), [statuts]);
  const statutTransmis = useMemo(() => statuts.find(s => s.name.toUpperCase() === 'TRANSMIS'), [statuts]);

  const isLost = useMemo(() => {
    if (statutPerdu) return objet?.statut_id === statutPerdu.id;
    return objet?.statut_id === 1;
  }, [objet?.statut_id, statutPerdu]);

  const isTransmis = useMemo(() => {
    if (statutTransmis) return objet?.statut_id === statutTransmis.id;
    return objet?.statut_id === 2;
  }, [objet?.statut_id, statutTransmis]);

  const isCommissaire = useMemo(() => {
    if (!auth.isAuthenticated || !auth.user) return false;
    return auth.user.is_superuser || auth.user.roles?.some(r => r.name === 'commissaire' || r.name === 'admin');
  }, [auth.isAuthenticated, auth.user]);

  const handleTransmettre = async () => {
    if (!objet) return;
    setActionLoading(true);
    try {
      const updated = await transmettreObjet(objet.id);
      setObjet(updated);
      Alert.alert('Succès', 'L\'objet a bien été mis en statut TRANSMIS.');
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.detail || 'Impossible de mettre à jour le statut.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleValider = async () => {
    if (!objet) return;
    setActionLoading(true);
    try {
      const updated = await validerObjet(objet.id);
      setObjet(updated);
      Alert.alert('Succès', 'L\'objet a bien été validé et mis en statut TROUVE.');
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.detail || 'Impossible de valider l\'objet.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AppScreen>
        <InlineNotice tone="info" message="Chargement du détail..." />
      </AppScreen>
    );
  }

  if (!objet) {
    return (
      <AppScreen>
        <InlineNotice tone="danger" message="Objet introuvable." />
      </AppScreen>
    );
  }

  const canPostTestimonial = auth.isAuthenticated && statusLabel.toUpperCase().includes('TROUVE');

  const handleSubmitTestimony = async () => {
    if (!note.trim()) {
      Alert.alert('Attention', 'Veuillez saisir un témoignage.');
      return;
    }

    setSending(true);
    try {
      await createTemoignage(objet.id, note.trim(), rating);
      const allTemoignages = await getTemoignages();
      setTemoignages(allTemoignages.filter(t => t.objet_id === objet.id));
      setNote('');
      setRating(5);
      Alert.alert('Succès', 'Votre témoignage a bien été envoyé.');
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.detail || 'Impossible de soumettre le témoignage.');
    } finally {
      setSending(false);
    }
  };

  // Info row helper
  const InfoRow = ({ icon, label, value }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; value: string }) => (
    <View style={styles.metaRow}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.metaTextWrapper}>
        <Text style={styles.metaLabel}>{label}</Text>
        <Text style={styles.metaValue}>{value}</Text>
      </View>
    </View>
  );

  // Custom Header Component
  const HeaderComponent = (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <MaterialCommunityIcons name="arrow-left" size={22} color={colors.dark} />
      </Pressable>
      <Text style={styles.headerTitle}>Détail de l'objet</Text>
      <Pressable onPress={() => shareObject(objet)} style={styles.shareButton}>
        <MaterialCommunityIcons name="share-variant" size={22} color={colors.dark} />
      </Pressable>
    </View>
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  return (
    <AppScreen header={HeaderComponent} contentContainerStyle={styles.scrollContent}>
      {/* Photo Gallery with Page Dots */}
      {images.length > 0 ? (
        <View style={styles.galleryWrapper}>
          <FlatList
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            data={images}
            keyExtractor={(item) => String(item.id)}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            renderItem={({ item }) => (
              <Image source={{ uri: item.image_url }} style={styles.galleryImage} />
            )}
          />
          {/* Page indicator dots */}
          {images.length > 1 && (
            <View style={styles.dotsContainer}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === activeIndex && styles.dotActive]}
                />
              ))}
            </View>
          )}
          {/* Photo count badge */}
          <View style={styles.photoCountBadge}>
            <MaterialCommunityIcons name="camera-outline" size={12} color={colors.white} />
            <Text style={styles.photoCountText}>{images.length}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.noImageCard}>
          <View style={styles.noImageIconWrapper}>
            <MaterialCommunityIcons
              name={isLost ? 'cube-outline' : 'cube-send'}
              size={44}
              color={isLost ? colors.lost : colors.primary}
            />
          </View>
          <Text style={styles.noImageText}>Aucune photo disponible</Text>
          <Text style={styles.noImageSubtext}>Les images seront affichées ici une fois ajoutées</Text>
        </View>
      )}

      {/* Main Info Card */}
      <Card style={styles.infoCard}>
        {/* Status & Reward Badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.statusBadge, { backgroundColor: isLost ? colors.lost : colors.primary }]}>
            <MaterialCommunityIcons
              name={isLost ? 'alert-circle-outline' : 'check-circle-outline'}
              size={13}
              color={colors.white}
            />
            <Text style={styles.statusBadgeText}>{isLost ? 'Perdu' : 'Trouvé'}</Text>
          </View>
          {objet.recompense && (
            <View style={styles.rewardBadge}>
              <MaterialCommunityIcons name="gift-outline" size={13} color={colors.reward} />
              <Text style={styles.rewardBadgeText}>{objet.recompense}€</Text>
            </View>
          )}
        </View>

        {/* Description Title */}
        <Text style={styles.title}>{objet.description}</Text>

        <View style={styles.separator} />

        {/* Structured Info Grid with Icons */}
        <View style={styles.metaGrid}>
          <InfoRow icon="map-marker-outline" label="Lieu signalé" value={objet.lieu || 'Non précisé'} />
          <InfoRow icon="calendar-outline" label="Date de l'événement" value={formatDate(objet.date_action)} />
          <InfoRow icon="phone-outline" label="Téléphone de contact" value={objet.contact_phone || 'Non communiqué'} />
          <InfoRow icon="email-outline" label="Email de contact" value={objet.contact_email || 'Non communiqué'} />
        </View>
      </Card>

      {/* Actions Commissaire Section */}
      {isCommissaire && (
        <Card style={styles.commissaireCard}>
          <View style={styles.commissaireHeader}>
            <View style={styles.commissaireIconCircle}>
              <MaterialCommunityIcons name="shield-account" size={18} color={colors.primary} />
            </View>
            <Text style={styles.commissaireTitle}>Actions Commissaire</Text>
          </View>
          <View style={styles.commissaireActions}>
            {isLost && (
              <PrimaryButton
                label="Marquer comme Transmis"
                loading={actionLoading}
                onPress={handleTransmettre}
                icon="swap-horizontal"
                size="md"
              />
            )}
            {isTransmis && (
              <PrimaryButton
                label="Valider au commissariat (Trouvé)"
                loading={actionLoading}
                onPress={handleValider}
                icon="check-decagram"
                size="md"
                style={{ backgroundColor: '#22c55e', borderColor: '#22c55e' }}
              />
            )}
            {!isLost && !isTransmis && (
              <Text style={styles.commissaireStatusText}>Cet objet a déjà été validé et traité.</Text>
            )}
          </View>
        </Card>
      )}

      {/* Testimonial Section */}
      <SectionHeader title="Témoignage" subtitle="Partagez votre retour d'expérience." />
      
      {/* List of existing testimonials */}
      {temoignages.length > 0 && (
        <View style={styles.testimonialsList}>
          {temoignages.map((t) => (
            <Card key={t.id} style={styles.testimonyItemCard}>
              <View style={styles.testimonyItemHeader}>
                <View style={styles.testimonyItemUserWrapper}>
                  <MaterialCommunityIcons name="account-circle" size={24} color={colors.primary} />
                  <Text style={styles.testimonyItemUser}>{t.user?.username || `Utilisateur ${t.user_id}`}</Text>
                </View>
                <View style={styles.testimonyStarsList}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <MaterialCommunityIcons
                      key={star}
                      name={star <= t.rating ? 'star' : 'star-outline'}
                      size={16}
                      color={colors.reward}
                    />
                  ))}
                </View>
              </View>
              <Text style={styles.testimonyItemContent}>{t.contenu}</Text>
              <Text style={styles.testimonyItemDate}>{formatDate(t.date)}</Text>
            </Card>
          ))}
        </View>
      )}

      {canPostTestimonial ? (
        <Card style={styles.testimonyCard}>
          <View style={styles.testimonyHeader}>
            <View style={styles.testimonyIconCircle}>
              <MaterialCommunityIcons name="message-text-outline" size={18} color={colors.primary} />
            </View>
            <Text style={styles.testimonyTitle}>Votre retour</Text>
          </View>
          
          <View style={styles.ratingSelector}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setRating(star)} style={styles.starButton}>
                <MaterialCommunityIcons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={32}
                  color={colors.reward}
                />
              </Pressable>
            ))}
          </View>

          <TextInput
            style={styles.textarea}
            value={note}
            onChangeText={setNote}
            placeholder="Écrivez un mot sur la façon dont vous avez récupéré l'objet..."
            placeholderTextColor="rgba(21, 26, 49, 0.38)"
            multiline
          />
          <PrimaryButton
            label="Envoyer le témoignage"
            loading={sending}
            onPress={handleSubmitTestimony}
            icon="send"
            size="lg"
          />
        </Card>
      ) : statusLabel.toUpperCase().includes('TROUVE') ? (
        <Card style={styles.guestNoticeCard}>
          <View style={styles.guestNoticeIcon}>
            <MaterialCommunityIcons name="lock-outline" size={24} color={colors.primary} />
          </View>
          <Text style={styles.guestNoticeTitle}>Connectez-vous pour témoigner</Text>
          <Text style={styles.guestNoticeDesc}>Vous devez être connecté pour laisser un avis sur cette restitution.</Text>
          <PrimaryButton
            label="Me connecter"
            onPress={() => router.push('/login')}
            variant="secondary"
          />
        </Card>
      ) : (
        <InlineNotice
          tone="info"
          message="Les témoignages sont activés pour les objets retrouvés."
        />
      )}
    </AppScreen>
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
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.pastel.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Gallery */
  galleryWrapper: {
    height: GALLERY_HEIGHT,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  galleryImage: {
    width: GALLERY_IMAGE_WIDTH,
    height: GALLERY_HEIGHT,
    resizeMode: 'cover',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    backgroundColor: colors.white,
    width: 20,
    borderRadius: 4,
  },
  photoCountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  photoCountText: {
    color: colors.white,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
  },

  /* No Image Fallback */
  noImageCard: {
    height: 180,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(21, 26, 49, 0.02)',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(21, 26, 49, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  noImageIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(21, 26, 49, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  noImageText: {
    fontSize: fontSizes.md,
    color: colors.dark,
    fontWeight: fontWeights.semibold,
  },
  noImageSubtext: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },

  /* Info Card */
  infoCard: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  statusBadgeText: {
    color: colors.white,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 166, 35, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    gap: 4,
  },
  rewardBadgeText: {
    color: colors.reward,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.dark,
    lineHeight: 26,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(21, 26, 49, 0.04)',
  },
  metaGrid: {
    gap: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(244, 149, 23, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaTextWrapper: {
    flex: 1,
  },
  metaLabel: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metaValue: {
    fontSize: fontSizes.md,
    color: colors.dark,
    fontWeight: fontWeights.semibold,
    marginTop: 1,
  },

  /* Testimonial */
  testimonyCard: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  testimonyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  testimonyIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(244, 149, 23, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonyTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.dark,
  },
  textarea: {
    minHeight: 90,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(21, 26, 49, 0.08)',
    backgroundColor: colors.bgAlt,
    color: colors.dark,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSizes.md,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  commissaireCard: {
    padding: spacing.lg,
    gap: spacing.md,
    borderColor: 'rgba(244, 149, 23, 0.15)',
    borderWidth: 1.5,
  },
  commissaireHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  commissaireIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(244, 149, 23, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commissaireTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.dark,
  },
  commissaireActions: {
    gap: spacing.sm,
  },
  commissaireStatusText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  ratingSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  starButton: {
    padding: 4,
  },
  testimonialsList: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  testimonyItemCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  testimonyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testimonyItemUserWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  testimonyItemUser: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.dark,
  },
  testimonyStarsList: {
    flexDirection: 'row',
    gap: 2,
  },
  testimonyItemContent: {
    fontSize: fontSizes.sm,
    color: colors.dark,
    lineHeight: 20,
  },
  testimonyItemDate: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  guestNoticeCard: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.pastel.orange,
    borderWidth: 1,
    borderColor: 'rgba(244, 149, 23, 0.2)',
  },
  guestNoticeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestNoticeTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.dark,
    textAlign: 'center',
  },
  guestNoticeDesc: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});
