import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/constants/theme';
import type { Objet } from '@/types/api';
import { formatDate } from '@/utils/format';

interface Props {
  objet: Objet;
  onPress?: () => void;
}

export function AnnonceCard({ objet, onPress }: Props) {
  const isLost = objet.statut_id === 1;

  // Determine category icon and label
  let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'cube-outline';
  let categoryLabel = 'Autre objet';

  if (objet.categorie_id === 1) {
    iconName = 'cellphone';
    categoryLabel = 'Électronique';
  } else if (objet.categorie_id === 2) {
    iconName = 'file-document-outline';
    categoryLabel = 'Documents';
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Annonce de type ${isLost ? 'Perdu' : 'Trouvé'} : ${objet.description}`}
    >
      <View style={styles.cardHeader}>
        {/* Category Icon inside a rounded square */}
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: isLost ? 'rgba(255, 107, 107, 0.08)' : 'rgba(92, 214, 192, 0.08)' }
          ]}
        >
          <MaterialCommunityIcons
            name={iconName}
            size={22}
            color={isLost ? colors.lost : colors.primary}
          />
        </View>

        {/* Status Badge on the right */}
        <View
          style={[
            styles.badge,
            { backgroundColor: isLost ? '#FFF0F0' : '#E6FAF6', borderColor: isLost ? 'rgba(255, 107, 107, 0.15)' : 'rgba(92, 214, 192, 0.15)' }
          ]}
        >
          <Text style={[styles.badgeText, { color: isLost ? colors.lost : colors.primary }]}>
            {isLost ? 'Perdu' : 'Trouvé'}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.category}>{categoryLabel}</Text>
        <Text style={styles.title} numberOfLines={2}>{objet.description}</Text>
        
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="map-marker-outline" size={14} color={colors.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>
              {objet.lieu || 'Non précisé'}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="calendar-outline" size={14} color={colors.textMuted} />
            <Text style={styles.metaText}>
              {formatDate(objet.date_action)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(26, 26, 46, 0.06)',
    padding: spacing.md,
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardBody: {
    gap: 4,
  },
  category: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.dark,
    lineHeight: 20,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
export default AnnonceCard;
