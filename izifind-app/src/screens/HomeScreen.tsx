import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/auth/AuthContext';

const stats = [
  { label: 'Objets perdus', value: '500+' },
  { label: 'Objets trouvés', value: '400+' },
  { label: 'Partenaires', value: '20' },
];

export function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>IZIFIND</Text>
        <Text style={styles.title}>Retrouver, déclarer et suivre les objets plus vite.</Text>
        <Text style={styles.subtitle}>
          Une app mobile pour signaler un objet perdu ou trouvé, consulter le catalogue public et accéder à l'espace
          admin.
        </Text>

        <View style={styles.actions}>
          <PrimaryButton label="J'ai perdu" onPress={() => router.push('/declare?type=lost')} />
          <PrimaryButton label="J'ai trouvé" onPress={() => router.push('/declare?type=found')} variant="secondary" />
        </View>
      </View>

      <SectionHeader title="Accès rapides" subtitle="Les parcours les plus utilisés sont à portée de main." />
      <View style={styles.quickGrid}>
        <Card>
          <Text style={styles.quickTitle}>Catalogue</Text>
          <Text style={styles.quickText}>Consulter les objets publics et filtrer les annonces.</Text>
          <PrimaryButton label="Ouvrir" onPress={() => router.push('/catalog')} style={styles.cardButton} />
        </Card>
        <Card>
          <Text style={styles.quickTitle}>{isAuthenticated ? 'Profil' : 'Connexion'}</Text>
          <Text style={styles.quickText}>
            {isAuthenticated ? 'Retrouver vos informations de compte.' : 'Se connecter ou créer un compte.'}
          </Text>
          <PrimaryButton
            label={isAuthenticated ? 'Mon profil' : 'Se connecter'}
            onPress={() => router.push(isAuthenticated ? '/profile' : '/login')}
            style={styles.cardButton}
          />
        </Card>
      </View>

      {isAdmin ? (
        <>
          <SectionHeader title="Administration" subtitle="Accès réservé aux comptes autorisés." />
          <Card>
            <Text style={styles.quickTitle}>Dashboard admin</Text>
            <Text style={styles.quickText}>Gérer les ressources métier et les objets non publics.</Text>
            <PrimaryButton label="Accéder" onPress={() => router.push('/admin')} style={styles.cardButton} />
          </Card>
        </>
      ) : null}

      <SectionHeader title="Statistiques" subtitle="Un aperçu simple de la plateforme." />
      <View style={styles.statsRow}>
        {stats.map((item) => (
          <Card key={item.label}>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kicker: {
    color: colors.accentSoft,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  quickGrid: {
    gap: spacing.md,
  },
  quickTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  quickText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  cardButton: {
    alignSelf: 'flex-start',
    minWidth: 120,
  },
  statsRow: {
    gap: spacing.md,
  },
  statValue: {
    color: colors.accentSoft,
    fontSize: 28,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.text,
    marginTop: 2,
    fontSize: 13,
  },
});

