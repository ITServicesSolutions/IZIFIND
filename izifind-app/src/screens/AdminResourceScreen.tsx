import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { SearchBar } from '@/components/SearchBar';
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
  Role,
  SousCategorie,
  Statut,
  Temoignage,
  TitreObjet,
  User,
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
  const [filteredItems, setFilteredItems] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string, any> | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'stats'>('list');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedItem, setSelectedItem] = useState<Record<string, any> | null>(null);

  const title = config?.label || humanizeResourceKey(resource);

  // Filter items based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems(items);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = items.filter(item => {
        return Object.values(item).some(value => 
          value && String(value).toLowerCase().includes(query)
        );
      });
      setFilteredItems(filtered);
    }
  }, [searchQuery, items]);

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
        setFilteredItems(list as Record<string, any>[]);
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
    setCollapsedGroups({});
    const nextForm: Record<string, string> = {};

    if (config) {
      for (const field of config.fields) {
        if (field.type === 'multicheck') {
          // For multicheck fields, extract IDs from the related objects
          // e.g. for permission_ids, read from item.permissions[].id
          const relationKey = field.name.replace(/_ids$/, 's'); // permission_ids -> permissions
          const related = item?.[relationKey];
          if (Array.isArray(related)) {
            nextForm[field.name] = related.map((r: any) => String(r.id)).join(',');
          } else {
            nextForm[field.name] = '';
          }
        } else {
          const rawValue = item?.[field.name];
          nextForm[field.name] = rawValue === undefined || rawValue === null ? '' : String(rawValue);
        }
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
      if (field.type === 'multicheck') {
        // Convert comma-separated IDs to array of numbers
        payload[field.name] = raw
          ? raw.split(',').map(Number).filter((n) => !isNaN(n) && n > 0)
          : [];
      } else if (field.type === 'boolean') {
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

    if (field.type === 'multicheck') {
      const optionsKey = field.optionsKey || 'permissions';
      const allOptions: Permission[] = (collections as any)?.[optionsKey] ?? [];
      const selectedIds = new Set(
        value ? value.split(',').map(Number).filter((n) => !isNaN(n) && n > 0) : []
      );

      // Group permissions by table name (e.g. create_users -> "users")
      const groups: Record<string, Permission[]> = {};
      for (const opt of allOptions) {
        const parts = opt.name.split('_');
        const groupName = parts.length > 1 ? parts.slice(1).join('_') : 'other';
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push(opt);
      }

      const togglePermission = (id: number) => {
        setForm((current) => {
          const currentIds = new Set(
            current[field.name]
              ? current[field.name].split(',').map(Number).filter((n) => !isNaN(n) && n > 0)
              : []
          );
          if (currentIds.has(id)) {
            currentIds.delete(id);
          } else {
            currentIds.add(id);
          }
          return { ...current, [field.name]: Array.from(currentIds).join(',') };
        });
      };

      const toggleGroup = (groupPerms: Permission[], selectAll: boolean) => {
        setForm((current) => {
          const currentIds = new Set(
            current[field.name]
              ? current[field.name].split(',').map(Number).filter((n) => !isNaN(n) && n > 0)
              : []
          );
          for (const p of groupPerms) {
            if (selectAll) {
              currentIds.add(p.id);
            } else {
              currentIds.delete(p.id);
            }
          }
          return { ...current, [field.name]: Array.from(currentIds).join(',') };
        });
      };

      const toggleCollapse = (groupName: string) => {
        setCollapsedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
      };

      const sortedGroupNames = Object.keys(groups).sort();
      const operationLabels: Record<string, string> = {
        create: 'Créer',
        read: 'Lire',
        update: 'Modifier',
        delete: 'Supprimer',
      };

      return (
        <View key={field.name} style={mStyles.container}>
          <View style={mStyles.headerRow}>
            <Text style={mStyles.label}>{field.label}</Text>
            <View style={mStyles.countBadge}>
              <Text style={mStyles.countText}>{selectedIds.size} / {allOptions.length}</Text>
            </View>
          </View>

          {sortedGroupNames.map((groupName) => {
            const groupPerms = groups[groupName];
            const isCollapsed = !!collapsedGroups[groupName];
            const groupSelectedCount = groupPerms.filter((p) => selectedIds.has(p.id)).length;
            const allGroupSelected = groupSelectedCount === groupPerms.length;
            const displayName = groupName.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

            return (
              <View key={groupName} style={mStyles.group}>
                <Pressable style={mStyles.groupHeader} onPress={() => toggleCollapse(groupName)}>
                  <View style={mStyles.groupHeaderLeft}>
                    <MaterialCommunityIcons
                      name={isCollapsed ? 'chevron-right' : 'chevron-down'}
                      size={20}
                      color={colors.dark}
                    />
                    <Text style={mStyles.groupTitle}>{displayName}</Text>
                    <View style={[
                      mStyles.groupCountBadge,
                      allGroupSelected && mStyles.groupCountBadgeAll,
                    ]}>
                      <Text style={[
                        mStyles.groupCountText,
                        allGroupSelected && mStyles.groupCountTextAll,
                      ]}>{groupSelectedCount}/{groupPerms.length}</Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleGroup(groupPerms, !allGroupSelected);
                    }}
                    hitSlop={8}
                  >
                    <MaterialCommunityIcons
                      name={allGroupSelected ? 'checkbox-multiple-marked' : 'checkbox-multiple-blank-outline'}
                      size={22}
                      color={allGroupSelected ? colors.primary : colors.textMuted}
                    />
                  </Pressable>
                </Pressable>

                {!isCollapsed && (
                  <View style={mStyles.checkboxGrid}>
                    {groupPerms.map((perm) => {
                      const isChecked = selectedIds.has(perm.id);
                      const parts = perm.name.split('_');
                      const operation = parts[0];
                      const opLabel = operationLabels[operation] || operation;

                      return (
                        <Pressable
                          key={perm.id}
                          style={[mStyles.checkboxItem, isChecked && mStyles.checkboxItemChecked]}
                          onPress={() => togglePermission(perm.id)}
                        >
                          <MaterialCommunityIcons
                            name={isChecked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                            size={20}
                            color={isChecked ? colors.primary : colors.textMuted}
                          />
                          <Text style={[mStyles.checkboxLabel, isChecked && mStyles.checkboxLabelChecked]}>
                            {opLabel}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>
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
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.dark} />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <Pressable onPress={() => {}} style={styles.refreshButton}>
        <MaterialCommunityIcons name="refresh" size={24} color={colors.dark} />
      </Pressable>
    </View>
  );

  const formatItemMeta = (item: Record<string, any>) => {
    const skip = ['id', 'name', 'description', 'created_at', 'updated_at'];
    const entries = Object.entries(item).filter(
      ([k, v]) => !skip.includes(k) && v !== null && v !== undefined && v !== ''
    );
    if (entries.length === 0) return '';
    return entries
      .map(([k, v]) => {
        const keyText = k.replace(/_id$/, '').replace('_', ' ').toUpperCase();
        let valText;
        if (typeof v === 'boolean') {
          valText = v ? 'Oui' : 'Non';
        } else if (Array.isArray(v)) {
          valText = v.map((item: any) => item.name || String(item)).join(', ');
        } else {
          valText = String(v);
        }
        return `${keyText}: ${valText}`;
      })
      .join('\n');
  };

  // Stats component
  const StatsView = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{items.length}</Text>
        <Text style={styles.statLabel}>Total</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{filteredItems.length}</Text>
        <Text style={styles.statLabel}>Affichés</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{config?.creatable ? '✓' : '✗'}</Text>
        <Text style={styles.statLabel}>Création</Text>
      </View>
    </View>
  );

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

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Pressable 
            style={[styles.tab, activeTab === 'list' && styles.activeTab]}
            onPress={() => setActiveTab('list')}
          >
            <MaterialCommunityIcons 
              name="format-list-bulleted" 
              size={20} 
              color={activeTab === 'list' ? colors.primary : colors.textMuted} 
            />
            <Text style={[styles.tabText, activeTab === 'list' && styles.activeTabText]}>
              Liste
            </Text>
          </Pressable>
          <Pressable 
            style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
            onPress={() => setActiveTab('stats')}
          >
            <MaterialCommunityIcons 
              name="chart-bar" 
              size={20} 
              color={activeTab === 'stats' ? colors.primary : colors.textMuted} 
            />
            <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
              Statistiques
            </Text>
          </Pressable>
        </View>

        {error ? <InlineNotice tone="danger" message={error} /> : null}
        {loading ? <InlineNotice tone="info" message="Chargement de la ressource..." /> : null}

        {activeTab === 'stats' ? (
          <StatsView />
        ) : (
          <>
            {/* Search Bar */}
            {!loading && items.length > 0 && (
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Rechercher..."
              />
            )}

            <FlatList
              key={`flatlist-2cols`}
              data={filteredItems}
              keyExtractor={(item, index) => String(item.id ?? index)}
              contentContainerStyle={styles.list}
              numColumns={2}
              columnWrapperStyle={styles.userRow}
              renderItem={({ item, index }) => {
                // Special rendering for users
                if (config?.key === 'users') {
                  const user = item as User;
                  
                  return (
                    <Card style={styles.userCard}>
                      <Pressable 
                        style={styles.userHeader}
                        onPress={() => setSelectedUser(user)}
                      >
                        <View style={styles.userAvatar}>
                          <MaterialCommunityIcons name="account" size={32} color={colors.white} />
                        </View>
                        <View style={styles.userInfo}>
                          <Text style={styles.userName} numberOfLines={1}>{user.username}</Text>
                          <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
                          <View style={styles.userBadges}>
                            {user.is_active && (
                              <View style={[styles.badge, styles.badgeActive]}>
                                <Text style={styles.badgeText}>Actif</Text>
                              </View>
                            )}
                            {user.is_superuser && (
                              <View style={[styles.badge, styles.badgeSuperuser]}>
                                <Text style={styles.badgeText}>Admin</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </Pressable>
                    </Card>
                  );
                }
                
                // Rendering for all other resources
                const getItemIcon = () => {
                  switch(config?.key) {
                    case 'roles': return 'shield-account';
                    case 'categories': return 'folder';
                    case 'sous-categories': return 'folder-multiple';
                    case 'permissions': return 'key';
                    case 'commissariats': return 'office-building';
                    case 'temoignages': return 'comment-text';
                    case 'promesses': return 'handshake';
                    case 'modifications': return 'pencil';
                    case 'images': return 'image';
                    case 'objets': return 'package-variant';
                    case 'titres': return 'tag';
                    case 'statuts': return 'checkbox-marked';
                    case 'couleurs': return 'palette';
                    case 'marques': return 'tag-multiple';
                    default: return 'folder';
                  }
                };
                
                const getItemTitle = () => {
                  return item.name || item.description || item.contenu || `ID #${item.id}`;
                };
                
                const getItemSubtitle = () => {
                  if (config?.key === 'objets' && item.description) return item.description;
                  if (config?.key === 'temoignages' && item.contenu) return item.contenu;
                  if (config?.key === 'promesses' && item.montant) return `Montant: ${item.montant}`;
                  if (item.description) return item.description;
                  return null;
                };
                
                return (
                  <Card style={styles.userCard}>
                    <Pressable 
                      style={styles.userHeader}
                      onPress={() => setSelectedItem(item)}
                    >
                      <View style={styles.userAvatar}>
                        <MaterialCommunityIcons name={getItemIcon()} size={32} color={colors.white} />
                      </View>
                      <View style={styles.userInfo}>
                        <Text style={styles.userName} numberOfLines={1}>{getItemTitle()}</Text>
                        {getItemSubtitle() && (
                          <Text style={styles.userEmail} numberOfLines={2}>{getItemSubtitle()}</Text>
                        )}
                      </View>
                    </Pressable>
                  </Card>
                );
              }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                !loading ? (
                  <InlineNotice 
                    tone="info" 
                    message={searchQuery ? 'Aucun résultat pour votre recherche.' : 'Aucun élément enregistré pour le moment.'} 
                  />
                ) : null
              }
            />
          </>
        )}
      </View>

      {/* User Details Modal */}
      <Modal visible={!!selectedUser} transparent animationType="fade" onRequestClose={() => setSelectedUser(null)}>
        <Pressable style={styles.userModalBackdrop} onPress={() => setSelectedUser(null)}>
          <Pressable style={styles.userModalContent} onPress={() => undefined}>
            <View style={styles.userModalHeader}>
              <View style={styles.userModalAvatar}>
                <MaterialCommunityIcons name="account" size={48} color={colors.white} />
              </View>
              <Text style={styles.userModalName}>{selectedUser?.username}</Text>
              <Text style={styles.userModalEmail}>{selectedUser?.email}</Text>
            </View>
            
            <ScrollView style={styles.userModalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.userModalSection}>
                <View style={styles.userModalDetailRow}>
                  <Text style={styles.userModalDetailLabel}>ID:</Text>
                  <Text style={styles.userModalDetailValue}>{selectedUser?.id}</Text>
                </View>
                <View style={styles.userModalDetailRow}>
                  <Text style={styles.userModalDetailLabel}>Statut:</Text>
                  <Text style={[styles.userModalDetailValue, selectedUser?.is_active ? styles.textActive : styles.textInactive]}>
                    {selectedUser?.is_active ? 'Actif' : 'Inactif'}
                  </Text>
                </View>
                <View style={styles.userModalDetailRow}>
                  <Text style={styles.userModalDetailLabel}>Super utilisateur:</Text>
                  <Text style={styles.userModalDetailValue}>
                    {selectedUser?.is_superuser ? 'Oui' : 'Non'}
                  </Text>
                </View>
                <View style={styles.userModalDetailRow}>
                  <Text style={styles.userModalDetailLabel}>Commissariat:</Text>
                  <Text style={styles.userModalDetailValue}>
                    {selectedUser?.commissariat_id ? 
                      getCollection(collections, 'commissariats').find(c => c.id === selectedUser.commissariat_id)?.name || selectedUser.commissariat_id 
                      : 'Non assigné'
                    }
                  </Text>
                </View>
                {selectedUser?.roles && selectedUser.roles.length > 0 && (
                  <View style={styles.userModalDetailRow}>
                    <Text style={styles.userModalDetailLabel}>Rôles:</Text>
                    <Text style={styles.userModalDetailValue}>
                      {selectedUser.roles.map((r: Role) => r.name).join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
            
            <View style={styles.userModalActions}>
              {config?.editable && selectedUser && (
                <PrimaryButton 
                  label="Modifier" 
                  variant="secondary" 
                  size="md" 
                  icon="pencil"
                  onPress={() => {
                    resetForm(selectedUser);
                    setSelectedUser(null);
                  }} 
                  style={styles.userModalActionBtn} 
                />
              )}
              {config?.deletable && selectedUser && (
                <PrimaryButton 
                  label="Supprimer" 
                  variant="ghost" 
                  size="md" 
                  icon="trash-can-outline"
                  onPress={() => {
                    handleDelete(selectedUser.id);
                    setSelectedUser(null);
                  }} 
                  style={styles.userModalActionBtn} 
                />
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Generic Item Details Modal */}
      <Modal visible={!!selectedItem} transparent animationType="fade" onRequestClose={() => setSelectedItem(null)}>
        <Pressable style={styles.userModalBackdrop} onPress={() => setSelectedItem(null)}>
          <Pressable style={styles.userModalContent} onPress={() => undefined}>
            <View style={styles.userModalHeader}>
              <View style={styles.userModalAvatar}>
                <MaterialCommunityIcons 
                  name={config?.key === 'roles' ? 'shield-account' : config?.key === 'categories' ? 'folder' : 'folder-multiple'} 
                  size={48} 
                  color={colors.white} 
                />
              </View>
              <Text style={styles.userModalName}>{selectedItem?.name}</Text>
              {selectedItem?.description && (
                <Text style={styles.userModalEmail}>{selectedItem.description}</Text>
              )}
            </View>
            
            <ScrollView style={styles.userModalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.userModalSection}>
                <View style={styles.userModalDetailRow}>
                  <Text style={styles.userModalDetailLabel}>ID:</Text>
                  <Text style={styles.userModalDetailValue}>{selectedItem?.id}</Text>
                </View>
                {Object.entries(selectedItem || {}).map(([key, value]) => {
                  if (['id', 'name', 'description'].includes(key)) return null;
                  if (value === null || value === undefined || value === '') return null;
                  
                  let displayValue = String(value);
                  
                  // Handle category lookup for sous-categories
                  if (key === 'categorie_id' && collections) {
                    const category = getCollection(collections, 'categories').find(c => c.id === value);
                    if (category) displayValue = category.name;
                  }
                  
                  // Handle sous-category lookup for marques
                  if (key === 'souscategorie_id' && collections) {
                    const sousCategory = getCollection(collections, 'sousCategories').find(c => c.id === value);
                    if (sousCategory) displayValue = sousCategory.name;
                  }
                  
                  // Handle permissions for roles
                  if (key === 'permissions' && Array.isArray(value)) {
                    return (
                      <View key={key} style={styles.permissionsDetailBlock}>
                        <Text style={styles.permissionsDetailLabel}>Permissions :</Text>
                        {value.length === 0 ? (
                          <Text style={[styles.userModalDetailValue, { textAlign: 'center', margin: spacing.sm }]}>
                            Aucune permission
                          </Text>
                        ) : (
                          <View style={styles.permissionsGrid}>
                            {value.map((p: any) => (
                              <View key={p.id} style={styles.permissionBadge}>
                                <MaterialCommunityIcons name="key" size={12} color={colors.primary} />
                                <Text style={styles.permissionBadgeText}>{p.name}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    );
                  }
                  
                  const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                  
                  return (
                    <View key={key} style={styles.userModalDetailRow}>
                      <Text style={styles.userModalDetailLabel}>{displayKey}:</Text>
                      <Text style={styles.userModalDetailValue}>{displayValue}</Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
            
            <View style={styles.userModalActions}>
              {config?.editable && selectedItem && (
                <PrimaryButton 
                  label="Modifier" 
                  variant="secondary" 
                  size="md" 
                  icon="pencil"
                  onPress={() => {
                    resetForm(selectedItem);
                    setSelectedItem(null);
                  }} 
                  style={styles.userModalActionBtn} 
                />
              )}
              {config?.deletable && selectedItem && (
                <PrimaryButton 
                  label="Supprimer" 
                  variant="ghost" 
                  size="md" 
                  icon="trash-can-outline"
                  onPress={() => {
                    handleDelete(selectedItem.id);
                    setSelectedItem(null);
                  }} 
                  style={styles.userModalActionBtn} 
                />
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Form Modal */}
      <Modal visible={formVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <Pressable style={styles.userModalBackdrop} onPress={closeModal}>
          <Pressable style={styles.userModalContent} onPress={() => undefined}>
            <View style={styles.userModalHeader}>
              <Text style={styles.userModalName}>{editingItem ? 'Modifier' : 'Créer'}</Text>
              <Text style={styles.userModalEmail}>{title}</Text>
            </View>
            
            <ScrollView style={styles.userModalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.form}>
                {config?.fields.map((field) => renderField(field))}
              </View>
            </ScrollView>
            
            <View style={styles.userModalActions}>
              <PrimaryButton 
                label={editingItem ? 'Enregistrer' : 'Créer'} 
                loading={saving} 
                onPress={handleSubmit} 
                size="md"
                style={styles.userModalActionBtn}
              />
            </View>
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
  refreshButton: {
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.xs,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    gap: spacing.xs,
  },
  activeTab: {
    backgroundColor: 'rgba(244, 149, 23, 0.08)',
  },
  tabText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textMuted,
  },
  activeTabText: {
    color: colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(21, 26, 49, 0.04)',
  },
  searchInput: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.dark,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: 40,
  },
  itemCard: {
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  itemIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(244, 149, 23, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIndexText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    color: colors.primary,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    color: colors.dark,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
  },
  itemId: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    marginTop: 2,
  },
  itemMeta: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    marginTop: spacing.sm,
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
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(21, 26, 49, 0.04)',
  },
  statNumber: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  // User card styles
  userRow: {
    gap: spacing.sm,
  },
  userCard: {
    flex: 1,
    padding: 0,
    overflow: 'hidden',
  },
  userHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.dark,
  },
  userEmail: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  userBadges: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  badgeSuperuser: {
    backgroundColor: 'rgba(244, 149, 23, 0.1)',
  },
  badgeText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
  },
  textActive: {
    color: '#22c55e',
  },
  textInactive: {
    color: '#ef4444',
  },
  // User Modal styles
  userModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  userModalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  userModalHeader: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    alignItems: 'center',
  },
  userModalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  userModalName: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
  userModalEmail: {
    fontSize: fontSizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
  userModalBody: {
    padding: spacing.lg,
  },
  userModalSection: {
    gap: spacing.md,
  },
  userModalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(21, 26, 49, 0.08)',
  },
  userModalDetailLabel: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    fontWeight: fontWeights.medium,
  },
  userModalDetailValue: {
    fontSize: fontSizes.sm,
    color: colors.dark,
    fontWeight: fontWeights.semibold,
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.md,
  },
  userModalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    paddingTop: 0,
  },
  userModalActionBtn: {
    flex: 1,
  },
  permissionsDetailBlock: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(21, 26, 49, 0.08)',
  },
  permissionsDetailLabel: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    fontWeight: fontWeights.medium,
    marginBottom: spacing.sm,
  },
  permissionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  permissionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 149, 23, 0.08)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(244, 149, 23, 0.2)',
  },
  permissionBadgeText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
  },
});

// ═══════════════════════════════════════════════════════════
//  Multicheck field styles
// ═══════════════════════════════════════════════════════════
const mStyles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.dark,
    fontWeight: fontWeights.semibold as any,
    fontSize: fontSizes.sm,
  },
  countBadge: {
    backgroundColor: 'rgba(244, 149, 23, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  countText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold as any,
    color: colors.primary,
  },
  group: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(21, 26, 49, 0.06)',
    overflow: 'hidden',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(21, 26, 49, 0.02)',
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  groupTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold as any,
    color: colors.dark,
  },
  groupCountBadge: {
    backgroundColor: 'rgba(21, 26, 49, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
    marginLeft: spacing.xs,
  },
  groupCountBadgeAll: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  groupCountText: {
    fontSize: 10,
    fontWeight: fontWeights.bold as any,
    color: colors.textMuted,
  },
  groupCountTextAll: {
    color: '#16a34a',
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(21, 26, 49, 0.03)',
    minWidth: '45%' as any,
  },
  checkboxItemChecked: {
    backgroundColor: 'rgba(244, 149, 23, 0.08)',
  },
  checkboxLabel: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    fontWeight: fontWeights.medium as any,
  },
  checkboxLabelChecked: {
    color: colors.dark,
    fontWeight: fontWeights.semibold as any,
  },
});