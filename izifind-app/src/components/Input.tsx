import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

interface Props {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  secureTextEntry?: boolean;
  helperText?: string;
  editable?: boolean;
  readonly?: boolean;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType = 'default',
  secureTextEntry,
  helperText,
  editable = true,
  readonly = false,
}: Props) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline ? styles.multiline : null, readonly ? styles.readonly : null]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(246,243,234,0.42)"
        multiline={multiline}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        editable={editable && !readonly}
      />
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
  input: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  readonly: {
    opacity: 0.92,
  },
  helper: {
    color: colors.muted,
    fontSize: 12,
  },
});

