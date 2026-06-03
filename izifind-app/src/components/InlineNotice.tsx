import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

interface Props {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  message: string;
}

const tones = {
  info: { backgroundColor: 'rgba(96,165,250,0.12)', borderColor: 'rgba(96,165,250,0.3)' },
  success: { backgroundColor: 'rgba(45,212,191,0.12)', borderColor: 'rgba(45,212,191,0.3)' },
  warning: { backgroundColor: 'rgba(251,191,36,0.12)', borderColor: 'rgba(251,191,36,0.3)' },
  danger: { backgroundColor: 'rgba(248,113,113,0.12)', borderColor: 'rgba(248,113,113,0.3)' },
} as const;

export function InlineNotice({ tone = 'info', title, message }: Props) {
  return (
    <View style={[styles.box, tones[tone]]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  message: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
});

