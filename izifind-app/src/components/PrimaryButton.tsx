import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle, StyleProp, TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/constants/theme';

interface Props {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({ 
  label, 
  onPress, 
  loading, 
  disabled, 
  variant = 'primary', 
  size = 'md',
  pill = false,
  icon,
  style 
}: Props) {
  const getLoaderColor = () => {
    if (variant === 'ghost') return colors.text;
    if (variant === 'secondary') return colors.primary;
    return colors.white;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[size],
        pill && { borderRadius: radius.pill },
        pressed && !disabled && !loading ? styles.pressed : null,
        (disabled || loading) ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getLoaderColor()} />
      ) : (
        <>
          {icon && !loading && (
            <MaterialCommunityIcons 
              name={icon} 
              size={size === 'sm' ? 16 : size === 'lg' ? 22 : 19} 
              color={variant === 'ghost' ? colors.text : (variant === 'secondary' ? colors.primary : colors.white)}
              style={styles.icon}
            />
          )}
          <Text style={[
            styles.label, 
            styles[`label_${size}` as keyof typeof styles] as StyleProp<TextStyle>,
            variant === 'ghost' ? styles.labelGhost : null,
            variant === 'secondary' ? styles.labelSecondary : null
          ]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
  },
  // Sizes
  sm: {
    minHeight: 38,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
  },
  md: {
    minHeight: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  lg: {
    minHeight: 54,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
  },
  // Variants
  primary: {
    backgroundColor: colors.accent,
  },
  accent: {
    backgroundColor: colors.primary, // Orange primaire
  },
  secondary: {
    backgroundColor: 'rgba(244, 149, 23, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(244, 149, 23, 0.2)',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  // Labels
  label: {
    color: colors.white,
    fontWeight: '700',
  },
  labelGhost: {
    color: colors.text,
  },
  labelSecondary: {
    color: colors.primary,
  },
  label_sm: {
    fontSize: 13,
  },
  label_md: {
    fontSize: 15,
  },
  label_lg: {
    fontSize: 17,
  },
  icon: {
    marginRight: 8,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});


