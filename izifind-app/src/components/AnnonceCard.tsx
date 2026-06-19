import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing, fontSizes, fontWeights } from '@/constants/theme';
import type { Objet } from '@/types/api';
import { formatDate } from '@/utils/format';
import { shareObject } from '@/utils/share';

interface Props {
  objet: Objet;
  onPress?: () => void;
  onShare?: () => void;
}

export function AnnonceCard({ objet, onPress, onShare }: Props) {
  const isLost = objet.statut_id === 1;

  // Determine category icon, label and color
  let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'cube-outline';
  let categoryLabel = 'Autre objet';
  let pastelColor = colors.pastel.purple;
  let iconColor = '#A882FF';

  if (objet.categorie_id === 1) {
    iconName = 'cellphone';
    categoryLabel = 'Électronique';
    pastelColor = colors.pastel.orange;
    iconColor = colors.primary;
  } else if (objet.categorie_id === 2) {
    iconName = 'file-document-outline';
    categoryLabel = 'Documents';
    pastelColor = colors.pastel.blue;
    iconColor = '#60A5FA';
  } else if (objet.categorie_id === 3) {
    iconName = 'wallet-outline';
    categoryLabel = 'Portefeuille';
    pastelColor = colors.pastel.yellow;
    iconColor = '#FBBF24';
  } else if (objet.categorie_id === 4) {
    iconName = 'key';
    categoryLabel = 'Clés / Accessoires';
    pastelColor = colors.pastel.green;
    iconColor = '#2DD4BF';
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
      {/* Left side: Image/Icon box with overlay badge */}
      <View style={[styles.imageContainer, { backgroundColor: pastelColor }]}>
        <MaterialCommunityIcons name={iconName} size={32} color={iconColor} />
        
        {/* Absolute status badge overlay */}
        <View
          style={[
            styles.badge,
            { backgroundColor: isLost ? colors.lost : colors.primary }
          ]}
        >
          <Text style={styles.badgeText}>
            {isLost ? 'Perdu' : 'Trouvé'}
          </Text>
        </View>
      </View>

      {/* Right side: Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.category, { color: iconColor }]}>{categoryLabel}</Text>
          <Pressable
            style={styles.shareButton}
            onPress={(event) => {
              event.stopPropagation();
              if (onShare) {
                onShare();
              } else {
                shareObject(objet).catch(() => {});
              }
            }}
            hitSlop={8}
          >
            <MaterialCommunityIcons name="share-variant-outline" size={14} color={colors.textMuted} />
          </Pressable>
          {objet.recompense && (
            <View style={styles.rewardBadge}>
              <MaterialCommunityIcons name="gift-outline" size={10} color={colors.reward} />
              <Text style={styles.rewardText}>Cadeau</Text>
            </View>
          )}
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {objet.description}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="map-marker-outline" size={12} color={colors.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>
              {objet.lieu || 'Non précisé'}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="clock-outline" size={12} color={colors.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>
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
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(21, 26, 49, 0.04)',
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    shadowColor: '#151a31',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  imageContainer: {
    width: 86,
    height: 86,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: fontWeights.bold,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  category: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    flex: 1,
  },
  shareButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgAlt,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 166, 35, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    gap: 2,
  },
  rewardText: {
    fontSize: 9,
    fontWeight: fontWeights.semibold,
    color: colors.reward,
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.dark,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  metaText: {
    fontSize: 11,
    color: colors.textMuted,
  },
});

export default AnnonceCard;
