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

export function RegisterScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await auth.register(form);
      await auth.login(form.username.trim(), form.password);
      router.replace('/');
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de créer le compte pour le moment.");
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
                <MaterialCommunityIcons name="account-plus-outline" size={22} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Inscription</Text>
                <Text style={styles.subtitle}>Créer votre compte IZIFIND</Text>
              </View>
            </View>
          </View>

          {/* Form Card */}
          <Card style={styles.card}>
            <Input
              label="Nom d'utilisateur"
              value={form.username}
              onChangeText={(value) => update('username', value)}
              placeholder="Ex: jean_dupont"
              leftIcon="account-outline"
            />
            <Input
              label="Email"
              value={form.email}
              onChangeText={(value) => update('email', value)}
              keyboardType="email-address"
              placeholder="Ex: jean.dupont@email.com"
              leftIcon="email-outline"
            />
            <Input
              label="Téléphone"
              value={form.phone}
              onChangeText={(value) => update('phone', value)}
              keyboardType="phone-pad"
              placeholder="Ex: +33100000003"
              leftIcon="phone-outline"
            />
            <Input
              label="Mot de passe"
              value={form.password}
              onChangeText={(value) => update('password', value)}
              secureTextEntry
              placeholder="••••••••"
              leftIcon="lock-outline"
            />

            {error ? <InlineNotice tone="danger" message={error} /> : null}

            <PrimaryButton
              label="Créer le compte"
              loading={loading}
              onPress={handleSubmit}
              size="lg"
              icon="account-check"
              style={styles.submitBtn}
            />
          </Card>

          {/* Bottom Link */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Déjà inscrit ?</Text>
            <Pressable onPress={() => router.push('/login')} hitSlop={8}>
              <Text style={styles.loginLinkText}>Se connecter</Text>
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
  loginLinkText: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
  },
});
