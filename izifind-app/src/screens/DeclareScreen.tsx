import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/auth/AuthContext';
import { AppScreen } from '@/components/AppScreen';
import { Card } from '@/components/Card';
import { InlineNotice } from '@/components/InlineNotice';
import { Input } from '@/components/Input';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SelectField } from '@/components/SelectField';
import { SectionHeader } from '@/components/SectionHeader';
import { colors, radius, spacing, fontSizes, fontWeights } from '@/constants/theme';
import { getCategories, getSousCategoriesByCategorie } from '@/services/catalog';
import { createFoundDeclaration, createLostDeclaration } from '@/services/declarations';
import type { Category, SousCategorie } from '@/types/api';
import { todayIso } from '@/utils/format';
import { toUploadFile } from '@/services/upload';
import { toSelectOptions } from '@/utils/collections';

type PickedImage = {
  uri: string;
  name: string;
  type: string;
};

export function DeclareScreen() {
  const router = useRouter();
  const auth = useAuth();

  // Retrieve initial mode from query params ('lost' or 'found')
  const { type } = useLocalSearchParams<{ type?: string }>();
  const initialMode = type === 'found' ? 'found' : 'lost';

  const [mode, setMode] = useState<'lost' | 'found'>(initialMode);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sousCategories, setSousCategories] = useState<SousCategorie[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rewardEnabled, setRewardEnabled] = useState(initialMode === 'lost');

  const [latitude, setLatitude] = useState('48.8566');
  const [longitude, setLongitude] = useState('2.3522');
  const [locationNote, setLocationNote] = useState<string>('Localisation non récupérée');

  const [form, setForm] = useState({
    categorie_id: null as number | null,
    souscategorie_id: null as number | null,
    description: '',
    date_action: todayIso(),
    lieu: '',
    contact_phone: '',
    contact_email: '',
    montant_promesse: '',
  });

  const [images, setImages] = useState<Record<'profil' | 'face' | 'derriere', PickedImage | null>>({
    profil: null,
    face: null,
    derriere: null,
  });

  // Sync mode state with route parameters when they change
  useEffect(() => {
    if (type === 'found' || type === 'lost') {
      setMode(type);
      setRewardEnabled(type === 'lost');
    }
  }, [type]);

  // Handle geolocation when in found mode
  useEffect(() => {
    let mounted = true;
    if (mode === 'found' && Platform.OS !== 'web') {
      (async () => {
        try {
          const permission = await Location.requestForegroundPermissionsAsync();
          if (permission.granted) {
            const current = await Location.getCurrentPositionAsync({});
            if (mounted) {
              setLatitude(String(current.coords.latitude));
              setLongitude(String(current.coords.longitude));
              setLocationNote('Localisation détectée automatiquement');
            }
          } else if (mounted) {
            setLocationNote('Permission de localisation refusée, saisissez vos coordonnées manuellement.');
          }
        } catch {
          if (mounted) {
            setLocationNote('Impossible de récupérer la position actuelle.');
          }
        }
      })();
    }
    return () => {
      mounted = false;
    };
  }, [mode]);

  // Authentication check & category loading
  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.replace('/login');
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const categoryList = await getCategories();
        if (mounted) {
          setCategories(categoryList);
        }
      } catch {
        if (mounted) {
          setError('Impossible de charger les catégories.');
        }
      } finally {
        if (mounted) {
          setLoadingCollections(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [auth.isAuthenticated, router]);

  // Load subcategories dynamically
  useEffect(() => {
    let mounted = true;
    if (!form.categorie_id) {
      setSousCategories([]);
      return;
    }

    (async () => {
      try {
        const subcategories = await getSousCategoriesByCategorie(form.categorie_id as number);
        if (mounted) {
          setSousCategories(subcategories);
        }
      } catch {
        if (mounted) {
          setSousCategories([]);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [form.categorie_id]);

  const categoryOptions = useMemo(() => toSelectOptions(categories, 'name'), [categories]);
  const subcategoryOptions = useMemo(() => toSelectOptions(sousCategories, 'name'), [sousCategories]);

  const pickImage = async (slot: keyof typeof images) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
      aspect: [4, 3],
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];
    setImages((current) => ({
      ...current,
      [slot]: {
        uri: asset.uri,
        name: asset.fileName || `${slot}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      },
    }));
  };

  const handleSubmit = async () => {
    if (!auth.isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!form.description.trim()) {
      Alert.alert('Validation', 'La description est obligatoire.');
      return;
    }

    if (!form.date_action) {
      Alert.alert('Validation', 'La date est obligatoire.');
      return;
    }

    if (!images.profil || !images.face || !images.derriere) {
      Alert.alert('Validation', 'Veuillez ajouter les 3 photos demandées.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (mode === 'lost') {
        await createLostDeclaration({
          categorie_id: form.categorie_id,
          souscategorie_id: form.souscategorie_id,
          description: form.description.trim(),
          date_action: form.date_action,
          lieu: form.lieu.trim() || undefined,
          contact_phone: form.contact_phone.trim() || undefined,
          contact_email: form.contact_email.trim() || undefined,
          montant_promesse: rewardEnabled && form.montant_promesse.trim() ? Number(form.montant_promesse) : null,
          photo_profil: toUploadFile(images.profil, 'photo_profil.jpg'),
          photo_face: toUploadFile(images.face, 'photo_face.jpg'),
          photo_derriere: toUploadFile(images.derriere, 'photo_derriere.jpg'),
        });
      } else {
        await createFoundDeclaration({
          categorie_id: form.categorie_id,
          souscategorie_id: form.souscategorie_id,
          description: form.description.trim(),
          date_action: form.date_action,
          lieu: form.lieu.trim() || undefined,
          contact_phone: form.contact_phone.trim() || undefined,
          contact_email: form.contact_email.trim() || undefined,
          latitude_user: Number(latitude),
          longitude_user: Number(longitude),
          photo_profil: toUploadFile(images.profil, 'photo_profil.jpg'),
          photo_face: toUploadFile(images.face, 'photo_face.jpg'),
          photo_derriere: toUploadFile(images.derriere, 'photo_derriere.jpg'),
        });
      }

      Alert.alert('Succès', mode === 'lost' ? 'Objet perdu déclaré avec succès.' : 'Objet trouvé déclaré avec succès.');
      router.push('/catalog');
    } catch (err: any) {
      const message = err?.response?.data?.detail || "Erreur lors de l'enregistrement.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Local photo slot component with improved grid layout
  const PhotoSlot = ({ label, icon, uri, onPick }: { label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; uri?: string | null; onPick: () => void }) => (
    <Pressable style={[styles.photoSlot, uri ? styles.photoSlotHasImage : null]} onPress={onPick}>
      {uri ? (
        <>
          <Image source={{ uri }} style={styles.photoImage} />
          <View style={styles.photoLabelOverlay}>
            <MaterialCommunityIcons name="check-circle" size={10} color={colors.white} />
            <Text style={styles.photoLabelText} numberOfLines={1}>{label}</Text>
          </View>
        </>
      ) : (
        <View style={styles.photoPlaceholder}>
          <View style={styles.photoIconCircle}>
            <MaterialCommunityIcons name={icon} size={22} color={colors.primary} />
          </View>
          <Text style={styles.photoLabelTextPlaceholder} numberOfLines={1}>{label}</Text>
        </View>
      )}
    </Pressable>
  );

  // Custom Header
  const HeaderComponent = (
    <View style={styles.headerBar}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <MaterialCommunityIcons name="arrow-left" size={22} color={colors.dark} />
      </Pressable>
      <Text style={styles.headerTitle}>Signaler un objet</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  return (
    <AppScreen header={HeaderComponent} keyboardAvoiding style={styles.screen} contentContainerStyle={styles.scrollContent}>
      {/* Mode Switcher */}
          <Card style={styles.switcherCard}>
            <Text style={styles.switcherLabel}>Type de signalement</Text>
            <View style={styles.switcherGrid}>
              <PrimaryButton
                label="J'ai perdu"
                variant={mode === 'lost' ? 'primary' : 'secondary'}
                onPress={() => {
                  setMode('lost');
                  setRewardEnabled(true);
                }}
                icon="magnify"
                style={[
                  styles.switcherBtn,
                  mode === 'lost' && { backgroundColor: colors.lost, borderColor: colors.lost }
                ]}
              />
              <PrimaryButton
                label="J'ai trouvé"
                variant={mode === 'found' ? 'primary' : 'secondary'}
                onPress={() => {
                  setMode('found');
                  setRewardEnabled(false);
                }}
                icon="hand-heart"
                style={[
                  styles.switcherBtn,
                  mode === 'found' && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
              />
            </View>
          </Card>

          {!auth.isAuthenticated ? (
            <InlineNotice
              tone="warning"
              title="Connexion requise"
              message="Cette déclaration nécessite une session active. Vous allez être redirigé vers l'écran de connexion."
            />
          ) : null}

          {/* Section 1: 📦 L'objet */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconCircle}>
              <MaterialCommunityIcons name="cube-outline" size={18} color={colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Caractéristiques de l'objet</Text>
          </View>
          <Card style={styles.sectionCard}>
            <SelectField
              label="Catégorie"
              value={form.categorie_id}
              options={categoryOptions}
              onChange={(value) => setForm((current) => ({ ...current, categorie_id: typeof value === 'number' ? value : null, souscategorie_id: null }))}
            />
            <SelectField
              label="Sous-catégorie"
              value={form.souscategorie_id}
              options={subcategoryOptions}
              onChange={(value) => setForm((current) => ({ ...current, souscategorie_id: typeof value === 'number' ? value : null }))}
              helperText={form.categorie_id ? undefined : 'Choisissez d\'abord une catégorie.'}
            />
            <Input
              label="Description"
              value={form.description}
              onChangeText={(value) => setForm((current) => ({ ...current, description: value }))}
              placeholder="Marque, signes distinctifs, inscriptions..."
              multiline
              leftIcon="text"
            />
            <Input
              label="Date de l'événement"
              value={form.date_action}
              onChangeText={(value) => setForm((current) => ({ ...current, date_action: value }))}
              placeholder="AAAA-MM-JJ"
              leftIcon="calendar"
            />
          </Card>

          {/* Section 2: 📍 Localisation */}
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconCircle, { backgroundColor: colors.pastel.blue }]}>
              <MaterialCommunityIcons name="map-marker-outline" size={18} color="#60A5FA" />
            </View>
            <Text style={styles.sectionTitle}>Localisation</Text>
          </View>
          <Card style={styles.sectionCard}>
            <Input
              label="Lieu ou repère"
              value={form.lieu}
              onChangeText={(value) => setForm((current) => ({ ...current, lieu: value }))}
              placeholder="Adresse, station, repère..."
              leftIcon="map-marker-outline"
            />
            {mode === 'found' && (
              <View style={styles.coordBox}>
                <InlineNotice tone="info" title="Position GPS" message={locationNote} />
                <View style={styles.coordsRow}>
                  <View style={styles.flex}>
                    <Input
                      label="Latitude"
                      value={latitude}
                      onChangeText={setLatitude}
                      keyboardType="numeric"
                      placeholder="48.8566"
                    />
                  </View>
                  <View style={styles.flex}>
                    <Input
                      label="Longitude"
                      value={longitude}
                      onChangeText={setLongitude}
                      keyboardType="numeric"
                      placeholder="2.3522"
                    />
                  </View>
                </View>
              </View>
            )}
          </Card>

          {/* Section 3: 📞 Contact & Récompense */}
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconCircle, { backgroundColor: colors.pastel.green }]}>
              <MaterialCommunityIcons name="phone-outline" size={18} color="#2DD4BF" />
            </View>
            <Text style={styles.sectionTitle}>Contact & Récompense</Text>
          </View>
          <Card style={styles.sectionCard}>
            <Input
              label="Numéro de téléphone"
              value={form.contact_phone}
              onChangeText={(value) => setForm((current) => ({ ...current, contact_phone: value }))}
              keyboardType="phone-pad"
              placeholder="Ex: 0612345678"
              leftIcon="phone-outline"
            />
            <Input
              label="Email de contact"
              value={form.contact_email}
              onChangeText={(value) => setForm((current) => ({ ...current, contact_email: value }))}
              keyboardType="email-address"
              placeholder="Ex: jean.dupont@mail.com"
              leftIcon="email-outline"
            />

            {mode === 'lost' && (
              <View style={styles.rewardBox}>
                <Text style={styles.rewardTitle}>Souhaitez-vous offrir une récompense ?</Text>
                <View style={styles.rewardActions}>
                  <PrimaryButton
                    label="Oui"
                    variant={rewardEnabled ? 'primary' : 'secondary'}
                    onPress={() => setRewardEnabled(true)}
                    style={[styles.rewardButton, rewardEnabled && { backgroundColor: colors.reward, borderColor: colors.reward }]}
                  />
                  <PrimaryButton
                    label="Non"
                    variant={!rewardEnabled ? 'primary' : 'secondary'}
                    onPress={() => setRewardEnabled(false)}
                    style={styles.rewardButton}
                  />
                </View>
                {rewardEnabled && (
                  <Input
                    label="Montant de la récompense (€)"
                    value={form.montant_promesse}
                    onChangeText={(value) => setForm((current) => ({ ...current, montant_promesse: value }))}
                    keyboardType="numeric"
                    placeholder="Ex: 50"
                    leftIcon="cash-multiple"
                  />
                )}
              </View>
            )}
          </Card>

          {/* Section 4: 📸 Photos (3-column grid) */}
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconCircle, { backgroundColor: colors.pastel.purple }]}>
              <MaterialCommunityIcons name="camera-outline" size={18} color="#A882FF" />
            </View>
            <Text style={styles.sectionTitle}>Photos requises (3 angles)</Text>
          </View>
          <Card style={styles.sectionCard}>
            <View style={styles.photosGrid}>
              <PhotoSlot label="Profil" icon="account-outline" uri={images.profil?.uri} onPick={() => pickImage('profil')} />
              <PhotoSlot label="Face" icon="image-outline" uri={images.face?.uri} onPick={() => pickImage('face')} />
              <PhotoSlot label="Derrière" icon="image-multiple-outline" uri={images.derriere?.uri} onPick={() => pickImage('derriere')} />
            </View>
            <Text style={styles.photosHint}>Touchez chaque cadre pour ajouter une photo</Text>
          </Card>

          {error ? <InlineNotice tone="danger" message={error} /> : null}
          {loadingCollections ? <InlineNotice tone="info" message="Chargement des référentiels..." /> : null}

      <PrimaryButton
        label="Soumettre la déclaration"
        loading={loading}
        onPress={handleSubmit}
        size="lg"
        icon="send"
        style={styles.submitButton}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 0,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl * 2,
  },
  headerBar: {
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
  switcherCard: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  switcherLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.dark,
  },
  switcherGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  switcherBtn: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: 2,
    paddingHorizontal: spacing.xs,
  },
  sectionIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.pastel.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.dark,
  },
  sectionCard: {
    padding: spacing.md,
    gap: spacing.md,
  },
  rewardBox: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(245, 166, 35, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.15)',
    marginTop: spacing.xs,
  },
  rewardTitle: {
    color: colors.dark,
    fontWeight: fontWeights.bold,
    fontSize: fontSizes.sm,
  },
  rewardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rewardButton: {
    flex: 1,
  },
  coordBox: {
    gap: spacing.sm,
  },
  coordsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  photosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  photoSlot: {
    flex: 1,
    height: 100,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(21, 26, 49, 0.12)',
    backgroundColor: colors.bgAlt,
    overflow: 'hidden',
  },
  photoSlotHasImage: {
    borderStyle: 'solid',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoLabelOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(21, 26, 49, 0.7)',
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  photoLabelText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: fontWeights.semibold,
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    gap: 6,
  },
  photoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(244, 149, 23, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLabelTextPlaceholder: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    fontWeight: fontWeights.semibold,
  },
  photosHint: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: -spacing.xs,
  },
  submitButton: {
    marginTop: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
});