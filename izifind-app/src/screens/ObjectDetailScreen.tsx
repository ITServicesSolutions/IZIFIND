import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { Card } from '@/components/Card';
import { InlineNotice } from '@/components/InlineNotice';
import { ObjectCard } from '@/components/ObjectCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { colors, radius, spacing } from '@/constants/theme';
import { getImages, getObjectById, getStatuts } from '@/services/catalog';
import { createTemoignage } from '@/services/community';
import { useAuth } from '@/auth/AuthContext';
import type { ImageObjet, Objet, Statut } from '@/types/api';
import { formatDate } from '@/utils/format';

export function ObjectDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const auth = useAuth();
  const [objet, setObjet] = useState<Objet | null>(null);
  const [images, setImages] = useState<ImageObjet[]>([]);
  const [statuts, setStatuts] = useState<Statut[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [detail, allImages, statusList] = await Promise.all([
          getObjectById(Number(id)),
          getImages(),
          getStatuts(),
        ]);
        if (!mounted) return;
        setObjet(detail);
        setImages(allImages.filter((image) => image.objet_id === detail.id));
        setStatuts(statusList);
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
      await createTemoignage(objet.id, note.trim());
      setNote('');
      Alert.alert('Succès', 'Votre témoignage a bien été envoyé.');
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.detail || 'Impossible de soumettre le témoignage.');
    } finally {
      setSending(false);
    }
  };

  return (
    <AppScreen>
      <SectionHeader title="Détail de l'objet" subtitle={`Statut : ${statusLabel}`} />

      <Card>
        <Text style={styles.title}>{objet.description}</Text>
        <Text style={styles.meta}>Date signalée: {formatDate(objet.date_action)}</Text>
        <Text style={styles.meta}>Lieu: {objet.lieu || 'Non précisé'}</Text>
        <Text style={styles.meta}>Contact: {objet.contact_phone || objet.contact_email || '-'}</Text>
        <Text style={styles.meta}>Visibilité: {objet.is_public ? 'Public' : 'Privé'}</Text>
      </Card>

      {images.length > 0 ? (
        <Card>
          <Text style={styles.section}>Photos</Text>
          <FlatList
            horizontal
            data={images}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.imageRow}
            renderItem={({ item }) => <Image source={{ uri: item.image_url }} style={styles.image} />}
          />
        </Card>
      ) : null}

      {canPostTestimonial ? (
        <Card>
          <Text style={styles.section}>Laisser un témoignage</Text>
          <TextInput
            style={styles.textarea}
            value={note}
            onChangeText={setNote}
            placeholder="Partagez votre retour après récupération de l'objet"
            placeholderTextColor="rgba(246,243,234,0.45)"
            multiline
          />
          <PrimaryButton label="Envoyer" loading={sending} onPress={handleSubmitTestimony} />
        </Card>
      ) : (
        <InlineNotice tone="info" message="Le témoignage est disponible quand l'objet a été retrouvé et que vous êtes connecté." />
      )}

      <PrimaryButton label="Retour au catalogue" onPress={() => router.back()} variant="secondary" />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: spacing.xs,
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  section: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  imageRow: {
    gap: spacing.sm,
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  textarea: {
    minHeight: 110,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
});

