import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

interface Props {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({ label, onPress, loading, disabled, variant = 'primary', style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !disabled && !loading ? styles.pressed : null,
        (disabled || loading) ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={variant === 'ghost' ? colors.text : colors.white} /> : <Text style={[styles.label, variant === 'ghost' ? styles.labelGhost : null]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  danger: {
    backgroundColor: colors.danger,
  },
  label: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  labelGhost: {
    color: colors.text,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
});

