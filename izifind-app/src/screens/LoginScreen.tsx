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
      router.replace('/profile');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Impossible de se connecter pour le moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Connexion</Text>
          <Text style={styles.title}>Reprendre votre session sur IZIFIND.</Text>
        </View>

        <Card>
          <View style={styles.form}>
            <Input label="Nom d'utilisateur ou email" value={username} onChangeText={setUsername} placeholder="admin" />
            <Input label="Mot de passe" value={password} onChangeText={setPassword} placeholder="Mot de passe" secureTextEntry />
            {error ? <InlineNotice tone="danger" message={error} /> : null}
            <PrimaryButton label="Se connecter" loading={loading} onPress={handleSubmit} />
            <PrimaryButton label="Créer un compte" variant="secondary" onPress={() => router.push('/register')} />
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

