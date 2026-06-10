import React from 'react';
import { ScrollView, StyleSheet, View, StyleProp, ViewStyle, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  header?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardAvoiding?: boolean;
}

export function AppScreen({ 
  children, 
  scroll = true, 
  header, 
  style, 
  contentContainerStyle,
  keyboardAvoiding = false 
}: Props) {
  const content = scroll ? (
    <ScrollView 
      style={[styles.container, style]} 
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.container, styles.nonScrollContent, style]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {header}
      {keyboardAvoiding ? (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={styles.flex}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgAlt,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
    paddingBottom: spacing.xxl * 2,
  },
  nonScrollContent: {
    padding: spacing.md,
  },
});
