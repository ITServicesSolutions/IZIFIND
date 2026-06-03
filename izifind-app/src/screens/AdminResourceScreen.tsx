import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
            <Text style={styles.booleanToggleText}>{isTrue ? 'Oui' : 'Non'}</Text>
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

  return (
    <AppScreen>
      <SectionHeader
        title={title}
        subtitle={config?.subtitle || 'Ressource métier'}
        action={<PrimaryButton label="Ajouter" onPress={() => resetForm(null)} style={styles.addButton} />}
      />

      {error ? <InlineNotice tone="danger" message={error} /> : null}
      {loading ? <InlineNotice tone="info" message="Chargement de la ressource..." /> : null}

      <FlatList
        scrollEnabled={false}
        data={items}
        keyExtractor={(item, index) => String(item.id ?? index)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{config?.listLabel ? config.listLabel(item) : item.name || item.description || `Item #${item.id}`}</Text>
                <Text style={styles.itemMeta}>{JSON.stringify(item, null, 0)}</Text>
              </View>
            </View>
            <View style={styles.cardActions}>
              {config?.editable ? <PrimaryButton label="Modifier" variant="secondary" onPress={() => resetForm(item)} style={styles.cardButton} /> : null}
              {config?.deletable ? <PrimaryButton label="Supprimer" variant="ghost" onPress={() => handleDelete(item.id)} style={styles.cardButton} /> : null}
            </View>
          </Card>
        )}
      />

      <Modal visible={formVisible} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <SectionHeader title={editingItem ? 'Modifier' : 'Créer'} subtitle={title} />
              <View style={styles.form}>
                {config?.fields.map((field) => renderField(field))}
                <PrimaryButton label={editingItem ? 'Enregistrer' : 'Créer'} loading={saving} onPress={handleSubmit} />
                <PrimaryButton label="Fermer" variant="secondary" onPress={closeModal} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  addButton: {
    minWidth: 110,
  },
  list: {
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  itemTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  itemMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 6,
    lineHeight: 18,
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
    backgroundColor: 'rgba(0,0,0,0.58)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    maxHeight: '92%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.md,
  },
  modalContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  form: {
    gap: spacing.md,
  },
  fieldLabel: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  booleanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  booleanHint: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  booleanToggle: {
    minWidth: 72,
    borderRadius: 999,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  booleanToggleActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  booleanToggleText: {
    color: colors.text,
    fontWeight: '800',
  },
});
