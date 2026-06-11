import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppScreen } from '@/components/AppScreen';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { InlineNotice } from '@/components/InlineNotice';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, spacing, fontSizes, fontWeights, radius } from '@/constants/theme';
import { useAuth } from '@/auth/AuthContext';

export function LoginScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await auth.login(username.trim(), password);
      router.replace('/');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Impossible de se connecter pour le moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen keyboardAvoiding>
      <View style={styles.container}>
          {/* Compact Logo + Title Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.titleBlock}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="lock-open-outline" size={22} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Connexion</Text>
                <Text style={styles.subtitle}>Reprendre votre session</Text>
              </View>
            </View>
          </View>

          {/* Form Card */}
          <Card style={styles.card}>
            <Input
              label="Nom d'utilisateur"
              value={username}
              onChangeText={setUsername}
              placeholder="admin"
              leftIcon="account-outline"
            />
            <Input
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              placeholder="Mot de passe"
              secureTextEntry
              leftIcon="lock-outline"
            />

            {error ? <InlineNotice tone="danger" message={error} /> : null}

            <PrimaryButton
              label="Se connecter"
              loading={loading}
              onPress={handleSubmit}
              size="lg"
              icon="login"
              style={styles.submitBtn}
            />
            
            <Pressable onPress={() => router.push('/forgot-password')} hitSlop={8} style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </Pressable>
          </Card>

          {/* Bottom Link */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Pas encore de compte ?</Text>
            <Pressable onPress={() => router.push('/register')} hitSlop={8}>
              <Text style={styles.registerLinkText}>Créer un compte</Text>
            </Pressable>
          </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
  header: {
    gap: spacing.lg,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 200,
    height: 130,
    borderRadius: radius.sm,
  },
  brandName: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.extrabold,
    color: colors.dark,
    letterSpacing: 1,
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(244, 149, 23, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.dark,
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    marginTop: 1,
  },
  card: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  submitBtn: {
    marginTop: spacing.xs,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  bottomText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  registerLinkText: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
  },
  forgotPasswordContainer: {
    alignSelf: 'center',
    marginTop: spacing.md,
  },
  forgotPasswordText: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
});
