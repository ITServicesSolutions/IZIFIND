import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing, fontSizes, fontWeights } from '@/constants/theme';

interface Props {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  value: string | number;
  label: string;
  color?: string;
  bgColor?: string;
}

export function StatBadge({ icon, value, label, color = colors.primary, bgColor = 'rgba(244, 149, 23, 0.08)' }: Props) {
  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.iconWrapper}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.value, { color }]}>{value}</Text>
        <Text style={styles.label} numberOfLines={1}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    gap: spacing.xs,
    minHeight: 68,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  value: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    lineHeight: 18,
  },
  label: {
    fontSize: 10,
    color: colors.dark,
    fontWeight: fontWeights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    marginTop: 1,
  },
});

export default StatBadge;
