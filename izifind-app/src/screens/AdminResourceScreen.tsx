import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/auth/AuthContext';
import { AppScreen } from '@/components/AppScreen';
import { Card } from '@/components/Card';
import { ImagePickerField } from '@/components/ImagePickerField';
import { InlineNotice } from '@/components/InlineNotice';
import { Input } from '@/components/Input';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SelectField } from '@/components/SelectField';
import { SectionHeader } from '@/components/SectionHeader';
import { colors, radius, spacing, fontSizes, fontWeights } from '@/constants/theme';
import { ADMIN_RESOURCES, getAdminResource } from '@/config/resources';
import { createResource, listResource, updateResource } from '@/services/admin';
import { http } from '@/services/http';
import { loadAdminCollections } from '@/services/collections';
import { toSelectOptions } from '@/utils/collections';
import { humanizeResourceKey, toNumberOrNull } from '@/utils/format';
import type {
  Category,
  Commissariat,
  Couleur,
  ImageObjet,
  Marque,
  ModifierObjet,
  Objet,
  Permission,
  Promesse,
  SousCategorie,
  Statut,
  Temoignage,
  TitreObjet,
} from '@/types/api';

type ResourceCollections = Awaited<ReturnType<typeof loadAdminCollections>>;

const getCollection = <K extends keyof ResourceCollections>(collections: ResourceCollections | null, key: K) =>
  collections?.[key] ?? [];

export function AdminResourceScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { resource } = useLocalSearchParams<{ resource: string }>();
  const config = getAdminResource(resource);
  const baseEndpoint = useMemo(() => (config ? config.endpoint.split('?')[0] : ''), [config]);
  const [collections, setCollections] = useState<ResourceCollections | null>(null);
  const [items, setItems] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string, any> | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const title = config?.label || humanizeResourceKey(resource);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (!auth.isAdmin) {
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const [collectionsData, list] = await Promise.all([loadAdminCollections(), config ? listResource(config.endpoint) : Promise.resolve([])]);
        if (!mounted) {
          return;
        }
        setCollections(collectionsData);
        setItems(list as Record<string, any>[]);
      } catch (err: any) {
        if (mounted) {
          setError(err?.response?.data?.detail || 'Impossible de charger la ressource.');
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
  }, [auth.isAdmin, auth.isAuthenticated, config, resource, router]);

  const optionMap = useMemo(() => {
    if (!collections) {
      return {};
    }

    return {
      categories: toSelectOptions<Category>(getCollection(collections, 'categories') as Category[], 'name'),
      sousCategories: toSelectOptions<SousCategorie>(getCollection(collections, 'sousCategories') as SousCategorie[], 'name'),
      marques: toSelectOptions<Marque>(getCollection(collections, 'marques') as Marque[], 'name'),
      couleurs: toSelectOptions<Couleur>(getCollection(collections, 'couleurs') as Couleur[], 'name'),
      statuts: toSelectOptions<Statut>(getCollection(collections, 'statuts') as Statut[], 'name'),
      titres: toSelectOptions<TitreObjet>(getCollection(collections, 'titres') as TitreObjet[], 'name'),
      objets: toSelectOptions<Objet>(getCollection(collections, 'objets') as Objet[], 'description'),
      images: toSelectOptions<ImageObjet>(getCollection(collections, 'images') as ImageObjet[], 'name'),
      modifications: toSelectOptions<ModifierObjet>(getCollection(collections, 'modifications') as ModifierObjet[], 'change'),
      promesses: toSelectOptions<Promesse>(getCollection(collections, 'promesses') as Promesse[], 'montant' as any),
      temoignages: toSelectOptions<Temoignage>(getCollection(collections, 'temoignages') as Temoignage[], 'contenu'),
      commissariats: toSelectOptions<Commissariat>(getCollection(collections, 'commissariats') as Commissariat[], 'name'),
      permissions: toSelectOptions<Permission>(getCollection(collections, 'permissions') as Permission[], 'name'),
    };
  }, [collections]);

  const resetForm = (item: Record<string, any> | null = null) => {
    setEditingItem(item);
    setImageUri(null);
    const nextForm: Record<string, string> = {};

    if (config) {
      for (const field of config.fields) {
        const rawValue = item?.[field.name];
        nextForm[field.name] = rawValue === undefined || rawValue === null ? '' : String(rawValue);
      }
    }

    setForm(nextForm);
    setFormVisible(true);
  };

  const closeModal = () => {
    setFormVisible(false);
    setEditingItem(null);
    setImageUri(null);
    setForm({});
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const buildPayload = () => {
    if (!config) {
      return null;
    }

    if (config.key === 'images') {
      const payload = new FormData();
      payload.append('objet_id', String(toNumberOrNull(form.objet_id) ?? 0));
      payload.append('name', form.name || 'Image');
      if (form.caption) payload.append('caption', form.caption);
      if (imageUri) {
      payload.append('file', {
          uri: imageUri,
          name: 'image.jpg',
          type: 'image/jpeg',
        } as any);
      }
      return payload;
    }

    const payload: Record<string, any> = {};
    for (const field of config.fields) {
      const raw = form[field.name];
      if (field.type === 'boolean') {
        payload[field.name] = raw === 'true' || raw === '1' || raw === 'yes';
      } else if (field.type === 'number') {
        const value = toNumberOrNull(raw);
        payload[field.name] = value;
      } else if (field.type === 'select') {
        payload[field.name] = toNumberOrNull(raw);
      } else if (raw !== '') {
        payload[field.name] = raw;
      }
    }

    return payload;
  };

  const handleSubmit = async () => {
    if (!config) {
      return;
    }

    const missingRequired = config.fields.some((field) => {
      if (!field.required) {
        return false;
      }

      if (field.type === 'image') {
        return !imageUri;
      }

      return !String(form[field.name] ?? '').trim();
    });

    if (missingRequired) {
      Alert.alert('Validation', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload();
      if (!payload) {
        return;
      }

      if (editingItem) {
        if (!config.editable) {
          Alert.alert('Non supporté', 'Cette ressource ne permet pas la modification depuis l’application.');
          return;
        }
        await updateResource(baseEndpoint, editingItem.id, payload);
      } else {
        if (!config.creatable) {
          Alert.alert('Non supporté', 'Cette ressource ne permet pas la création depuis l’application.');
          return;
        }
        await createResource(config.key === 'images' ? '/images' : baseEndpoint, payload);
      }

      const refreshed = await listResource(config.endpoint);
      setItems(refreshed as Record<string, any>[]);
      closeModal();
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.detail || 'Impossible d’enregistrer la ressource.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!config?.deletable || !config.deletePath) {
      Alert.alert('Non supporté', 'La suppression n’est pas disponible pour cette ressource.');
      return;
    }

    Alert.alert('Supprimer', 'Confirmez-vous la suppression ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await http.delete(config.deletePath!(id));
            const refreshed = await listResource(config.endpoint);
            setItems(refreshed as Record<string, any>[]);
          } catch (err: any) {
            Alert.alert('Erreur', err?.response?.data?.detail || 'Impossible de supprimer.');
          }
        },
      },
    ]);
  };

  const renderField = (field: (typeof ADMIN_RESOURCES)[number]['fields'][number]) => {
    const value = form[field.name] ?? '';
    if (field.type === 'textarea') {
      return (
        <Input
          key={field.name}
          label={field.label}
          value={value}
          onChangeText={(text) => setForm((current) => ({ ...current, [field.name]: text }))}
          placeholder={field.placeholder}
          multiline
        />
      );
    }

    if (field.type === 'number') {
      return (
        <Input
          key={field.name}
          label={field.label}
          value={value}
          onChangeText={(text) => setForm((current) => ({ ...current, [field.name]: text }))}
          placeholder={field.placeholder}
          keyboardType="numeric"
        />
      );
    }

    if (field.type === 'boolean') {
      const isTrue = value === 'true' || value === '1' || value === 'yes';
      return (
        <View key={field.name} style={styles.booleanRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <Text style={styles.booleanHint}>{field.helperText || 'Basculer la valeur'}</Text>
          </View>
          <Pressable
            style={[styles.booleanToggle, isTrue ? styles.booleanToggleActive : null]}
            onPress={() => setForm((current) => ({ ...current, [field.name]: isTrue ? 'false' : 'true' }))}
          >
            <Text style={[styles.booleanToggleText, isTrue ? styles.booleanToggleTextActive : null]}>
              {isTrue ? 'Oui' : 'Non'}
            </Text>
          </Pressable>
        </View>
      );
    }

    if (field.type === 'select') {
      const optionsKey = field.optionsKey || 'categories';
      const options = (optionMap as any)[optionsKey] || [];
      return (
        <SelectField
          key={field.name}
          label={field.label}
          value={toNumberOrNull(value)}
          options={options}
          onChange={(nextValue) => setForm((current) => ({ ...current, [field.name]: String(nextValue ?? '') }))}
          helperText={field.helperText}
        />
      );
    }

    if (field.type === 'image') {
      return (
        <ImagePickerField
          key={field.name}
          label={field.label}
          uri={imageUri}
          onPick={handlePickImage}
          helperText={field.helperText}
        />
      );
    }

    return (
      <Input
        key={field.name}
        label={field.label}
        value={value}
        onChangeText={(text) => setForm((current) => ({ ...current, [field.name]: text }))}
        placeholder={field.placeholder}
      />
    );
  };

  if (!auth.isAuthenticated) {
    return (
      <AppScreen>
        <InlineNotice tone="warning" title="Connexion requise" message="Veuillez vous connecter pour accéder à l'administration." />
      </AppScreen>
    );
  }

  if (!auth.isAdmin) {
    return (
      <AppScreen>
        <InlineNotice tone="danger" title="Accès refusé" message="Votre compte n’a pas les permissions nécessaires." />
      </AppScreen>
    );
  }

  // Custom Header
  const HeaderComponent = (
    <View style={styles.header}>
      <Pressable onPress={() => router.replace('/admin')} style={styles.backButton}>
        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.dark} />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  const formatItemMeta = (item: Record<string, any>) => {
    const skip = ['id', 'name', 'description', 'created_at', 'updated_at'];
    const entries = Object.entries(item).filter(
      ([k, v]) => !skip.includes(k) && v !== null && v !== undefined && v !== ''
    );
    if (entries.length === 0) return 'Aucune donnée supplémentaire';
    return entries
      .map(([k, v]) => {
        const keyText = k.replace(/_id$/, '').replace('_', ' ').toUpperCase();
        const valText = typeof v === 'boolean' ? (v ? 'Oui' : 'Non') : String(v);
        return `${keyText}: ${valText}`;
      })
      .join('\n');
  };

  return (
    <AppScreen header={HeaderComponent} scroll={false} style={styles.screen}>
      <View style={styles.container}>
        <SectionHeader
          title={title}
          subtitle={config?.subtitle || 'Ressource métier'}
          action={
            config?.creatable ? (
              <PrimaryButton 
                label="Ajouter" 
                onPress={() => resetForm(null)} 
                variant="primary" 
                size="sm"
                icon="plus"
                style={styles.addButton} 
              />
            ) : null
          }
        />

        {error ? <InlineNotice tone="danger" message={error} /> : null}
        {loading ? <InlineNotice tone="info" message="Chargement de la ressource..." /> : null}

        <FlatList
          data={items}
          keyExtractor={(item, index) => String(item.id ?? index)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.itemCard}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>
                    {config?.listLabel ? config.listLabel(item) : item.name || item.description || `ID #${item.id}`}
                  </Text>
                  <Text style={styles.itemMeta} numberOfLines={8}>
                    {formatItemMeta(item)}
                  </Text>
                </View>
              </View>
              <View style={styles.cardActions}>
                {config?.editable ? (
                  <PrimaryButton 
                    label="Modifier" 
                    variant="secondary" 
                    size="sm" 
                    icon="pencil"
                    onPress={() => resetForm(item)} 
                    style={styles.cardButton} 
                  />
                ) : null}
                {config?.deletable ? (
                  <PrimaryButton 
                    label="Supprimer" 
                    variant="ghost" 
                    size="sm" 
                    icon="trash-can-outline"
                    onPress={() => handleDelete(item.id)} 
                    style={styles.cardButton} 
                  />
                ) : null}
              </View>
            </Card>
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading ? (
              <InlineNotice tone="info" message="Aucun élément enregistré pour le moment." />
            ) : null
          }
        />
      </View>

      <Modal visible={formVisible} transparent animationType="slide" onRequestClose={closeModal}>
        <Pressable style={styles.modalBackdrop} onPress={closeModal}>
          <Pressable style={styles.modalSheet} onPress={() => undefined}>
            <View style={styles.grabHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingItem ? 'Modifier' : 'Créer'} — {title}</Text>
              <Pressable onPress={closeModal} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={20} color={colors.dark} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.form}>
                {config?.fields.map((field) => renderField(field))}
                
                <View style={styles.formActions}>
                  <PrimaryButton 
                    label={editingItem ? 'Enregistrer' : 'Créer'} 
                    loading={saving} 
                    onPress={handleSubmit} 
                    size="lg"
                    style={styles.formSubmitBtn}
                  />
                </View>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
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
  addButton: {
    minWidth: 100,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: 40,
  },
  itemCard: {
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  itemTitle: {
    color: colors.dark,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
  },
  itemMeta: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    marginTop: 6,
    lineHeight: 16,
    backgroundColor: colors.bgAlt,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cardButton: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(21, 26, 49, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    maxHeight: '85%',
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    shadowColor: '#151a31',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 20,
  },
  grabHandle: {
    width: 38,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(21, 26, 49, 0.1)',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  modalTitle: {
    color: colors.dark,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    paddingBottom: 40,
  },
  form: {
    gap: spacing.md,
  },
  formActions: {
    marginTop: spacing.md,
  },
  formSubmitBtn: {
    width: '100%',
  },
  fieldLabel: {
    color: colors.dark,
    fontWeight: fontWeights.semibold,
    fontSize: fontSizes.sm,
  },
  booleanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  booleanHint: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    marginTop: 2,
  },
  booleanToggle: {
    minWidth: 72,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bgAlt,
    borderWidth: 1,
    borderColor: 'rgba(21, 26, 49, 0.08)',
    alignItems: 'center',
  },
  booleanToggleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  booleanToggleText: {
    color: colors.dark,
    fontWeight: fontWeights.bold,
    fontSize: fontSizes.sm,
  },
  booleanToggleTextActive: {
    color: colors.white,
  },
});

