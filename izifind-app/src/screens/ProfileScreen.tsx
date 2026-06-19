import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppScreen } from '@/components/AppScreen';
import { Card } from '@/components/Card';
import { colors, spacing, radius, fontSizes, fontWeights } from '@/constants/theme';
import { useAuth } from '@/auth/AuthContext';

export function ProfileScreen() {
  const router = useRouter();
  const auth = useAuth();
  const roles = auth.user?.roles?.map((role) => role.name).join(', ') || 'Utilisateur';

  // Get initial letters for avatar
  const initials = auth.user?.username ? auth.user.username.slice(0, 2).toUpperCase() : 'U';

  // Helper menu row component
  const MenuRow = ({ icon, label, subtitle, onPress, color = colors.primary }: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
    subtitle?: string;
    onPress: () => void;
    color?: string;
  }) => (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <View style={styles.menuRowLeft}>
        <View style={[styles.menuIconCircle, { backgroundColor: `${color}14` }]}>
          <MaterialCommunityIcons name={icon} size={20} color={color} />
        </View>
        <View style={styles.menuRowTextContainer}>
          <Text style={styles.menuRowLabel}>{label}</Text>
          {subtitle && <Text style={styles.menuRowSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(21, 26, 49, 0.2)" />
    </Pressable>
  );

  // Custom Header
  const HeaderComponent = (
    <View style={styles.header}>
      <View style={{ width: 40 }} />
      <Text style={styles.headerTitle}>Mon Profil</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  if (!auth.isAuthenticated) {
    return (
      <AppScreen header={HeaderComponent}>
        <Card style={styles.authCard}>
          <View style={styles.authIconCircle}>
            <MaterialCommunityIcons name="account-lock-outline" size={26} color={colors.primary} />
          </View>
          <Text style={styles.authTitle}>Connexion requise</Text>
          <Text style={styles.authText}>Connectez-vous pour gérer votre profil et suivre vos déclarations.</Text>
          <Pressable style={styles.authButton} onPress={() => router.push('/login')}>
            <MaterialCommunityIcons name="login" size={18} color={colors.white} />
            <Text style={styles.authButtonText}>Se connecter</Text>
          </Pressable>
        </Card>
      </AppScreen>
    );
  }

  return (
    <AppScreen header={HeaderComponent}>
      <View style={styles.container}>
        {/* Avatar Section with Gradient-like Background */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarOuter}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            {/* Online indicator */}
            <View style={styles.onlineDot} />
          </View>
          <Text style={styles.username}>{auth.user?.username || 'Utilisateur IZIFIND'}</Text>
          <Text style={styles.email}>{auth.user?.email || 'email@izifind.com'}</Text>

          {/* Role badge */}
          <View style={styles.roleBadge}>
            <MaterialCommunityIcons name="shield-account-outline" size={14} color={colors.primary} />
            <Text style={styles.roleBadgeText}>{roles}</Text>
          </View>
        </View>

        {/* User Account Details Card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <MaterialCommunityIcons name="shield-account-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Statut / Rôles</Text>
              <Text style={styles.infoValue}>{roles}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <View style={[styles.infoIconCircle, { backgroundColor: colors.pastel.green }]}>
              <MaterialCommunityIcons name="check-decagram-outline" size={18} color="#2DD4BF" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Compte vérifié</Text>
              <Text style={styles.infoValue}>{auth.user?.is_active ? 'Oui (Actif)' : 'Non'}</Text>
            </View>
          </View>
        </Card>

        {/* Action Menu List */}
        <Text style={styles.menuSectionTitle}>Paramètres du compte</Text>
        <Card style={styles.menuCard}>
          <MenuRow
            icon="account-edit"
            label="Modifier le profil"
            subtitle="Mettre à jour vos informations"
            onPress={() => router.push('/edit-profile')}
            color={colors.primary}
          />
          <View style={styles.menuSeparator} />
          <MenuRow
            icon="key-change"
            label="Changer le mot de passe"
            subtitle="Sécuriser votre compte"
            onPress={() => router.push('/change-password')}
            color="#A882FF"
          />
        </Card>

        <Text style={styles.menuSectionTitle}>Raccourcis & Actions</Text>
        <Card style={styles.menuCard}>
          <MenuRow
            icon="database-search"
            label="Consulter le Catalogue"
            subtitle="Parcourir les objets signalés"
            onPress={() => router.push('/catalog')}
            color={colors.primary}
          />
          <View style={styles.menuSeparator} />
          <MenuRow
            icon="plus-circle-outline"
            label="Déclarer un objet perdu"
            subtitle="Créer une nouvelle déclaration"
            onPress={() => router.push('/declare?type=lost')}
            color="#A882FF"
          />
          <View style={styles.menuSeparator} />
          <MenuRow
            icon="map-marker-radius"
            label="Commissariats partenaires"
            subtitle="Trouver un point de dépôt"
            onPress={() => router.push('/map')}
            color="#60A5FA"
          />
          {auth.isAdmin && (
            <>
              <View style={styles.menuSeparator} />
              <MenuRow
                icon="security"
                label="Administration"
                subtitle="Gérer les ressources système"
                onPress={() => router.push('/admin')}
                color="#2DD4BF"
              />
            </>
          )}
        </Card>

        {/* Logout Button */}
        <Pressable
          style={styles.logoutBtn}
          onPress={async () => {
            await auth.logout();
            router.replace('/login');
          }}
        >
          <View style={styles.logoutIconCircle}>
            <MaterialCommunityIcons name="logout" size={16} color={colors.lost} />
          </View>
          <Text style={styles.logoutBtnText}>Se déconnecter</Text>
        </Pressable>
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
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },
  authCard: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  authIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.pastel.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.dark,
  },
  authText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  authButton: {
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  authButtonText: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
  },
  profileHeader: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  avatarOuter: {
    position: 'relative',
    marginBottom: spacing.xs,
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
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2DD4BF',
    borderWidth: 3,
    borderColor: colors.bgAlt,
  },
  username: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.dark,
  },
  email: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.pastel.orange,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
  },
  roleBadgeText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    color: colors.primary,
  },
  infoCard: {
    padding: spacing.md,
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.pastel.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: fontSizes.md,
    color: colors.dark,
    fontWeight: fontWeights.semibold,
    marginTop: 1,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(21, 26, 49, 0.04)',
  },
  menuSectionTitle: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: spacing.xs,
    marginBottom: -spacing.sm,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuRowTextContainer: {
    flex: 1,
  },
  menuRowLabel: {
    fontSize: fontSizes.md,
    color: colors.dark,
    fontWeight: fontWeights.semibold,
  },
  menuRowSubtitle: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  menuSeparator: {
    height: 1,
    backgroundColor: 'rgba(21, 26, 49, 0.04)',
    marginHorizontal: spacing.md,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.12)',
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255, 107, 107, 0.03)',
  },
  logoutIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtnText: {
    color: colors.lost,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
  },
});
