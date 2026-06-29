import React, { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { AppScreen } from '@/components/AppScreen';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { InlineNotice } from '@/components/InlineNotice';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, spacing, fontSizes, fontWeights, radius } from '@/constants/theme';
import { useAuth } from '@/auth/AuthContext';

WebBrowser.maybeCompleteAuthSession();

export function LoginScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || googleClientId || 'unconfigured';
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || googleClientId || 'unconfigured';

  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useIdTokenAuthRequest({
    clientId: googleClientId || 'unconfigured',
    androidClientId: __DEV__ ? undefined : androidClientId,
    iosClientId: __DEV__ ? undefined : iosClientId,
  });

  useEffect(() => {
    if (googleResponse?.type !== 'success') return;
    const idToken = googleResponse.params.id_token;
    if (!idToken) {
      setError('Google n\'a pas retourné de jeton de connexion.');
      return;
    }

    setError(null);
    setGoogleLoading(true);
    auth.loginWithGoogleToken(idToken)
      .then(() => router.replace('/'))
      .catch((err: any) => setError(err?.response?.data?.detail || 'Connexion Google impossible pour le moment.'))
      .finally(() => setGoogleLoading(false));
  }, [auth, googleResponse, router]);

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
              label="Téléphone, email ou username"
              value={username}
              onChangeText={setUsername}
              placeholder="+33100000001 ou admin"
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

            <Pressable
              style={[styles.googleButton, (!googleClientId || !googleRequest || googleLoading) && styles.googleButtonDisabled]}
              disabled={!googleClientId || !googleRequest || googleLoading}
              onPress={() => {
                if (googleClientId?.startsWith('dummy-')) {
                  Alert.alert("Configuration Manquante", "Le bouton SSO Google est activé, mais nécessite un vrai Client ID Google dans le fichier .env pour fonctionner.");
                } else {
                  promptGoogleAsync();
                }
              }}
            >
              <MaterialCommunityIcons name="google" size={18} color={colors.dark} />
              <Text style={styles.googleButtonText}>
                {googleLoading ? 'Connexion Google...' : 'Continuer avec Google'}
              </Text>
            </Pressable>
            
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
  googleButton: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(21, 26, 49, 0.08)',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  googleButtonDisabled: {
    opacity: 0.48,
  },
  googleButtonText: {
    color: colors.dark,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
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
