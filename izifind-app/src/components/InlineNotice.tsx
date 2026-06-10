import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing, fontSizes, fontWeights } from '@/constants/theme';

interface Props {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  message: string;
}

const toneStyles = {
  info: {
    backgroundColor: 'rgba(96,165,250,0.08)',
    borderColor: 'rgba(96,165,250,0.15)',
    iconColor: '#60A5FA',
    iconName: 'information-outline' as const,
  },
  success: {
    backgroundColor: 'rgba(45,212,191,0.08)',
    borderColor: 'rgba(45,212,191,0.15)',
    iconColor: '#2DD4BF',
    iconName: 'check-circle-outline' as const,
  },
  warning: {
    backgroundColor: 'rgba(251,191,36,0.08)',
    borderColor: 'rgba(251,191,36,0.15)',
    iconColor: '#FBBF24',
    iconName: 'alert-outline' as const,
  },
  danger: {
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    borderColor: 'rgba(255, 107, 107, 0.15)',
    iconColor: colors.lost,
    iconName: 'alert-circle-outline' as const,
  },
} as const;

export function InlineNotice({ tone = 'info', title, message }: Props) {
  const currentTone = toneStyles[tone];

  return (
    <View style={[styles.box, { backgroundColor: currentTone.backgroundColor, borderColor: currentTone.borderColor }]}>
      <MaterialCommunityIcons name={currentTone.iconName} size={20} color={currentTone.iconColor} style={styles.icon} />
      <View style={styles.content}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  icon: {
    marginTop: 1,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.dark,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
  },
  message: {
    color: colors.dark,
    fontSize: fontSizes.sm,
    lineHeight: 18,
  },
});


