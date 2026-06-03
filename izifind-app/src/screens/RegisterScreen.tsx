import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { InlineNotice } from '@/components/InlineNotice';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/auth/AuthContext';

export function RegisterScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
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
      router.replace('/profile');
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de créer le compte pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Inscription</Text>
          <Text style={styles.title}>Créer votre compte pour suivre les objets.</Text>
        </View>

        <Card>
          <View style={styles.form}>
            <Input label="Nom d'utilisateur" value={form.username} onChangeText={(value) => update('username', value)} />
            <Input label="Email" value={form.email} onChangeText={(value) => update('email', value)} keyboardType="email-address" />
            <Input label="Mot de passe" value={form.password} onChangeText={(value) => update('password', value)} secureTextEntry />
            {error ? <InlineNotice tone="danger" message={error} /> : null}
            <PrimaryButton label="Créer le compte" loading={loading} onPress={handleSubmit} />
            <PrimaryButton label="J'ai déjà un compte" variant="secondary" onPress={() => router.push('/login')} />
          </View>
        </Card>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  kicker: {
    color: colors.accentSoft,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
  },
  form: {
    gap: spacing.md,
  },
});

