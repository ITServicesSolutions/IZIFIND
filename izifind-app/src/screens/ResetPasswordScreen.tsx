import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppScreen } from '@/components/AppScreen';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, spacing, fontSizes, fontWeights, radius } from '@/constants/theme';
import { useAuth } from '@/auth/AuthContext';

export function ResetPasswordScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Validation', 'Veuillez remplir tous les champs.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Validation', 'Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Validation', 'Les mots de passe ne correspondent pas.');
      return;
    }

    if (!token) {
      Alert.alert('Erreur', 'Token de réinitialisation manquant.');
      return;
    }

    setLoading(true);
    try {
      await auth.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.detail || 'Impossible de réinitialiser le mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AppScreen>
        <View style={styles.container}>
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <MaterialCommunityIcons name="check-circle" size={48} color={colors.primary} />
            </View>
            <Text style={styles.successTitle}>Mot de passe réinitialisé !</Text>
            <Text style={styles.successText}>
              Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </Text>
            <PrimaryButton
              label="Se connecter"
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
            <MaterialCommunityIcons name="key-plus" size={22} color={colors.primary} />
          </View>
          <Text style={styles.title}>Nouveau mot de passe</Text>
          <Text style={styles.subtitle}>Choisissez un nouveau mot de passe sécurisé</Text>
        </View>

        <Card style={styles.card}>
          <Input
            label="Nouveau mot de passe"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••"
            secureTextEntry
            leftIcon="lock-outline"
          />
          <Input
            label="Confirmer le mot de passe"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            secureTextEntry
            leftIcon="lock-check-outline"
          />

          <PrimaryButton
            label="Réinitialiser le mot de passe"
            loading={loading}
            onPress={handleSubmit}
            size="lg"
            icon="check"
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