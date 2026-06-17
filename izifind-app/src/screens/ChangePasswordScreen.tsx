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

export function ChangePasswordScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Validation', 'Veuillez remplir tous les champs.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Validation', 'Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Validation', 'Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    if (oldPassword === newPassword) {
      Alert.alert('Validation', 'Le nouveau mot de passe doit être différent de l\'ancien.');
      return;
    }

    setLoading(true);
    try {
      await auth.changePassword(oldPassword, newPassword);
      Alert.alert('Succès', 'Votre mot de passe a été changé avec succès.');
      router.replace('/profile');
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.detail || 'Impossible de changer le mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  const HeaderComponent = (
    <View style={styles.header}>
      <Pressable onPress={() => router.replace('/profile')} style={styles.backButton}>
        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.dark} />
      </Pressable>
      <Text style={styles.headerTitle}>Changer le mot de passe</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  return (
    <AppScreen header={HeaderComponent} keyboardAvoiding>
      <View style={styles.container}>
        <View style={styles.titleBlock}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="lock-reset" size={22} color={colors.primary} />
          </View>
          <Text style={styles.title}>Sécurité du compte</Text>
          <Text style={styles.subtitle}>Choisissez un mot de passe fort et unique</Text>
        </View>

        <Card style={styles.card}>
          <Input
            label="Ancien mot de passe"
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder="••••••••"
            secureTextEntry
            leftIcon="lock-outline"
          />
          <Input
            label="Nouveau mot de passe"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••"
            secureTextEntry
            leftIcon="lock-plus"
          />
          <Input
            label="Confirmer le nouveau mot de passe"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            secureTextEntry
            leftIcon="lock-check"
          />

          <PrimaryButton
            label="Changer le mot de passe"
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(21, 26, 49, 0.04)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.dark,
  },
  container: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
  titleBlock: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
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
});