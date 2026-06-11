import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppScreen } from '@/components/AppScreen';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, spacing, fontSizes, fontWeights, radius } from '@/constants/theme';
import { useAuth } from '@/auth/AuthContext';

export function ForgotPasswordScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Validation', 'Veuillez saisir votre email.');
      return;
    }

    setLoading(true);
    try {
      await auth.forgotPassword(email.trim());
      setEmailSent(true);
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.detail || 'Impossible d\'envoyer l\'email.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <AppScreen>
        <View style={styles.container}>
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <MaterialCommunityIcons name="email-check" size={48} color={colors.primary} />
            </View>
            <Text style={styles.successTitle}>Email envoyé !</Text>
            <Text style={styles.successText}>
              Un email avec les instructions pour réinitialiser votre mot de passe a été envoyé à {email}.
            </Text>
            <PrimaryButton
              label="Retour à la connexion"
              onPress={() => router.replace('/login')}
              size="lg"
              style={styles.backButton}
            />
          </View>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen keyboardAvoiding>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButtonHeader}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.dark} />
          </Pressable>
          <View style={styles.logoRow}>
            <Text style={styles.brandName}>IZIFIND</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.titleBlock}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="key-outline" size={22} color={colors.primary} />
          </View>
          <Text style={styles.title}>Mot de passe oublié</Text>
          <Text style={styles.subtitle}>Entrez votre email pour réinitialiser votre mot de passe</Text>
        </View>

        <Card style={styles.card}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="votre@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="email-outline"
          />

          <PrimaryButton
            label="Envoyer les instructions"
            loading={loading}
            onPress={handleSubmit}
            size="lg"
            icon="send"
            style={styles.submitBtn}
          />
        </Card>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  backButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  brandName: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.extrabold,
    color: colors.dark,
    letterSpacing: 1,
  },
  titleBlock: {
    alignItems: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  submitBtn: {
    marginTop: spacing.xs,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(244, 149, 23, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    color: colors.dark,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
  },
  successText: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  backButton: {
    width: '100%',
  },
});