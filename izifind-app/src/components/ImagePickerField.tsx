import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing, fontSizes, fontWeights } from '@/constants/theme';

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
      <Pressable 
        style={[styles.pickerBox, uri ? styles.pickerBoxHasImage : null]} 
        onPress={onPick}
      >
        {uri ? (
          <>
            <Image source={{ uri }} style={styles.image} />
            <View style={styles.editOverlay}>
              <MaterialCommunityIcons name="camera" size={16} color={colors.white} />
              <Text style={styles.editOverlayText}>Modifier</Text>
            </View>
          </>
        ) : (
          <View style={styles.placeholderContainer}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="camera-plus-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.placeholderText}>Ajouter une photo</Text>
            <Text style={styles.placeholderSubText}>Format JPG ou PNG (max. 5Mo)</Text>
          </View>
        )}
      </Pressable>
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.dark,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
  pickerBox: {
    height: 130,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(21, 26, 49, 0.15)',
    backgroundColor: colors.white,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerBoxHasImage: {
    borderStyle: 'solid',
    borderColor: 'rgba(21, 26, 49, 0.05)',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(21, 26, 49, 0.75)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editOverlayText: {
    color: colors.white,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
  },
  placeholderContainer: {
    alignItems: 'center',
    gap: 4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(244, 149, 23, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  placeholderText: {
    color: colors.dark,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
  placeholderSubText: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
  },
  helper: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    marginTop: 2,
  },
});


