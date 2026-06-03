import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/auth/AuthContext';

export function ProfileScreen() {
  const router = useRouter();
  const auth = useAuth();
  const roles = auth.user?.roles?.map((role) => role.name).join(', ') || 'Aucun rôle';

  return (
    <AppScreen>
      <SectionHeader title="Profil" subtitle="Vos informations de compte et vos raccourcis." />
      <Card>
        <View style={styles.block}>
          <Text style={styles.label}>Nom d'utilisateur</Text>
          <Text style={styles.value}>{auth.user?.username || '-'}</Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{auth.user?.email || '-'}</Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.label}>Roles</Text>
          <Text style={styles.value}>{roles}</Text>
        </View>
      </Card>

      <View style={styles.actions}>
        <PrimaryButton label="Catalogue" onPress={() => router.push('/catalog')} />
        <PrimaryButton label="J'ai perdu" onPress={() => router.push('/lost')} variant="secondary" />
        {auth.isAdmin ? <PrimaryButton label="Administration" onPress={() => router.push('/admin')} variant="secondary" /> : null}
        <PrimaryButton
          label="Déconnexion"
          variant="ghost"
          onPress={async () => {
            await auth.logout();
            router.replace('/login');
          }}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 4,
    marginBottom: spacing.md,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  value: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
});

