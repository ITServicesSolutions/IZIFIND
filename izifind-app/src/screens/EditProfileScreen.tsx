import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppScreen } from '@/components/AppScreen';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, spacing, fontSizes, fontWeights, radius } from '@/constants/theme';
import { useAuth } from '@/auth/AuthContext';

export function EditProfileScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth.user) {
      setUsername(auth.user.username || '');
      setEmail(auth.user.email || '');
      setPhone(auth.user.phone || '');
    }
  }, [auth.user]);

  const handleSubmit = async () => {
    if (!username.trim() || !email.trim()) {
      Alert.alert('Validation', 'Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      await auth.updateProfile({
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      Alert.alert('Succès', 'Vos informations ont été mises à jour.');
      router.replace('/profile');
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.detail || 'Impossible de mettre à jour le profil.');
    } finally {
      setLoading(false);
    }
  };

  const HeaderComponent = (
    <View style={styles.header}>
      <Pressable onPress={() => router.replace('/profile')} style={styles.backButton}>
        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.dark} />
      </Pressable>
      <Text style={styles.headerTitle}>Modifier le profil</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  return (
    <AppScreen header={HeaderComponent} keyboardAvoiding>
      <View style={styles.container}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{username.slice(0, 2).toUpperCase()}</Text>
          </View>
        </View>

        <Card style={styles.card}>
          <Input
            label="Nom d'utilisateur"
            value={username}
            onChangeText={setUsername}
            placeholder="Nom d'utilisateur"
            leftIcon="account-outline"
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="email@exemple.com"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="email-outline"
          />
          <Input
            label="Téléphone"
            value={phone}
            onChangeText={setPhone}
            placeholder="+33100000003"
            keyboardType="phone-pad"
            leftIcon="phone-outline"
          />

          <PrimaryButton
            label="Enregistrer les modifications"
            loading={loading}
            onPress={handleSubmit}
            size="lg"
            icon="content-save"
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.pastel.orange,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(244, 149, 23, 0.2)',
  },
  avatarText: {
    fontSize: 30,
    fontWeight: fontWeights.bold,
    color: colors.primary,
  },
  card: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  submitBtn: {
    marginTop: spacing.xs,
  },
});
