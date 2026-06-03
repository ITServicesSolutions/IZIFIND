import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';
import { PrimaryButton } from './PrimaryButton';

interface Props {
  label: string;
  uri?: string | null;
  onPick: () => Promise<void> | void;
  helperText?: string;
}

export function ImagePickerField({ label, uri, onPick, helperText }: Props) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.preview} onPress={onPick}>
        {uri ? <Image source={{ uri }} style={styles.image} /> : <Text style={styles.placeholder}>Ajouter une photo</Text>}
      </Pressable>
      <PrimaryButton label={uri ? 'Changer la photo' : 'Choisir une photo'} onPress={onPick} variant="secondary" />
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  preview: {
    minHeight: 120,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 180,
  },
  placeholder: {
    color: 'rgba(246,243,234,0.5)',
    fontWeight: '600',
  },
  helper: {
    color: colors.muted,
    fontSize: 12,
  },
});

