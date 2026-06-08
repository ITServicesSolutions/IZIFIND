import React, { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/auth/AuthContext';
import { AppScreen } from '@/components/AppScreen';
import { Card } from '@/components/Card';
import { ImagePickerField } from '@/components/ImagePickerField';
import { InlineNotice } from '@/components/InlineNotice';
import { Input } from '@/components/Input';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SelectField } from '@/components/SelectField';
import { SectionHeader } from '@/components/SectionHeader';
import { colors, radius, spacing } from '@/constants/theme';
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

  return (
    <AppScreen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
          <SectionHeader
            title="Signaler un objet"
            subtitle="Déclarez un objet perdu ou trouvé pour le cataloguer dans notre réseau."
          />

          {/* Mode Switcher */}
          <Card style={styles.switcherCard}>
            <Text style={styles.switcherLabel}>Type de signalement :</Text>
            <View style={styles.switcherGrid}>
              <PrimaryButton
                label="J'ai perdu"
                variant={mode === 'lost' ? 'primary' : 'secondary'}
                onPress={() => {
                  setMode('lost');
                  setRewardEnabled(true);
                }}
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

          <Card>
            <View style={styles.form}>
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
                helperText={form.categorie_id ? undefined : 'Choisissez d’abord une catégorie.'}
              />
              <Input
                label="Description"
                value={form.description}
                onChangeText={(value) => setForm((current) => ({ ...current, description: value }))}
                placeholder="Décrivez l'objet (marque, signes distinctifs...)"
                multiline
              />
              <Input
                label="Date"
                value={form.date_action}
                onChangeText={(value) => setForm((current) => ({ ...current, date_action: value }))}
                placeholder="YYYY-MM-DD"
              />
              <Input
                label="Lieu"
                value={form.lieu}
                onChangeText={(value) => setForm((current) => ({ ...current, lieu: value }))}
                placeholder="Quartier, rue, repère..."
              />
              <Input
                label="Téléphone"
                value={form.contact_phone}
                onChangeText={(value) => setForm((current) => ({ ...current, contact_phone: value }))}
                keyboardType="phone-pad"
                placeholder="Ex: 0612345678"
              />
              <Input
                label="Email"
                value={form.contact_email}
                onChangeText={(value) => setForm((current) => ({ ...current, contact_email: value }))}
                keyboardType="email-address"
                placeholder="Ex: jean.dupont@mail.com"
              />

              {mode === 'lost' ? (
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
                  {rewardEnabled ? (
                    <Input
                      label="Montant de la récompense (€)"
                      value={form.montant_promesse}
                      onChangeText={(value) => setForm((current) => ({ ...current, montant_promesse: value }))}
                      keyboardType="numeric"
                      placeholder="Ex: 50"
                    />
                  ) : null}
                </View>
              ) : (
                <View style={styles.coordBox}>
                  <InlineNotice tone="info" title="Localisation" message={locationNote} />
                  <Input
                    label="Latitude"
                    value={latitude}
                    onChangeText={setLatitude}
                    keyboardType="numeric"
                    placeholder="48.8566"
                  />
                  <Input
                    label="Longitude"
                    value={longitude}
                    onChangeText={setLongitude}
                    keyboardType="numeric"
                    placeholder="2.3522"
                  />
                </View>
              )}

              <View style={styles.photosSection}>
                <Text style={styles.photosTitle}>Photos obligatoires (3 requis)</Text>
                <ImagePickerField label="Photo de profil" uri={images.profil?.uri} onPick={() => pickImage('profil')} />
                <ImagePickerField label="Photo de face" uri={images.face?.uri} onPick={() => pickImage('face')} />
                <ImagePickerField label="Photo de derrière" uri={images.derriere?.uri} onPick={() => pickImage('derriere')} />
              </View>

              {error ? <InlineNotice tone="danger" message={error} /> : null}
              {loadingCollections ? <InlineNotice tone="info" message="Chargement des référentiels..." /> : null}
              <PrimaryButton label="Soumettre la déclaration" loading={loading} onPress={handleSubmit} />
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  switcherCard: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  switcherLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  switcherGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  switcherBtn: {
    flex: 1,
  },
  form: {
    gap: spacing.md,
  },
  rewardBox: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(245, 166, 35, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.18)',
  },
  rewardTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 14,
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
  photosSection: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  photosTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
});
