import React, { useState, useRef } from 'react';
import { StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing, fontSizes, fontWeights } from '@/constants/theme';

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
  leftIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  maxLength?: number;
  style?: any;
  inputStyle?: any;
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
  leftIcon,
  autoCapitalize,
  autoCorrect,
  maxLength,
  style,
  inputStyle,
}: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handlePress = () => {
    if (editable && !readonly) {
      inputRef.current?.focus();
    }
  };

  return (
    <View style={[styles.group, style]}>
      <Text style={styles.label}>{label}</Text>
      <Pressable 
        onPress={handlePress}
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          readonly && styles.readonly,
          multiline && styles.multilineWrapper
        ]}
      >
        {leftIcon && (
          <MaterialCommunityIcons 
            name={leftIcon} 
            size={20} 
            color={isFocused ? colors.primary : colors.textMuted} 
            style={styles.leftIcon}
          />
        )}
        <TextInput
          ref={inputRef}
          style={[styles.input, multiline ? styles.multiline : null, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(21, 26, 49, 0.38)"
          multiline={multiline}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          editable={editable && !readonly}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          underlineColorAndroid="transparent"
          textAlignVertical={multiline ? 'top' : 'center'}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
        />
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(21, 26, 49, 0.1)',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  multilineWrapper: {
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.dark,
    fontSize: fontSizes.md,
    padding: 0, // Reset default padding inside wrapper
    minHeight: 50,
  },
  multiline: {
    minHeight: 50,
    textAlignVertical: 'top',
  },
  readonly: {
    backgroundColor: colors.bgAlt,
    borderColor: 'rgba(21, 26, 49, 0.05)',
  },
  helper: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    marginTop: 2,
  },
});