import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';
import type { Objet, Statut } from '@/types/api';
import { formatDate } from '@/utils/format';

interface Props {
  objet: Objet;
  statusLabel?: string;
  onPress?: () => void;
}

export function ObjectCard({ objet, statusLabel, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}>
      <View style={styles.row}>
        <Text style={styles.badge}>{statusLabel || `Statut ${objet.statut_id}`}</Text>
        <Text style={styles.date}>{formatDate(objet.date_action)}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>{objet.description}</Text>
      <Text style={styles.meta} numberOfLines={1}>{objet.lieu || 'Lieu non précisé'}</Text>
      <View style={styles.footer}>
        <Text style={styles.footerText}>{objet.is_public ? 'Public' : 'Privé'}</Text>
        <Text style={styles.footerText}>ID {objet.id}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  badge: {
    color: colors.accentSoft,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  date: {
    color: colors.muted,
    fontSize: 12,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  footerText: {
    color: colors.muted,
    fontSize: 12,
  },
});

