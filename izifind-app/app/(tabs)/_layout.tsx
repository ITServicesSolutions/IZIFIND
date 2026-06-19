import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/auth/AuthContext';

const icon = (name: keyof typeof MaterialCommunityIcons.glyphMap) =>
  ({ color, size }: { color: string; size: number }) => <MaterialCommunityIcons name={name} color={color} size={size} />;

// Custom central button for "Déclarer"
function CustomDeclareButton({ children, onPress }: any) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.declareBtnContainer,
        pressed && styles.declareBtnPressed
      ]}
      onPress={onPress}
    >
      <View style={styles.declareBtn}>
        <MaterialCommunityIcons name="plus" size={28} color={colors.white} />
      </View>
    </Pressable>
  );
}

export default function TabLayout() {
  const auth = useAuth();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: 'rgba(21, 26, 49, 0.4)',
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: 'rgba(21, 26, 49, 0.04)',
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 8,
          elevation: 10,
          shadowColor: '#151a31',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.04,
          shadowRadius: 16,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarIcon: icon('home-variant') }} />
      <Tabs.Screen name="catalog" options={{ title: 'Catalogue', tabBarIcon: icon('magnify') }} />
      <Tabs.Screen
        name="declare"
        options={{
          title: 'Déclarer',
          tabBarButton: (props) => (
            <CustomDeclareButton
              {...props}
              onPress={() => router.push(auth.isAuthenticated ? '/declare?type=lost' : '/login')}
            />
          ),
        }}
      />
      <Tabs.Screen name="map" options={{ title: 'Carte', tabBarIcon: icon('map-marker-outline') }} />
      <Tabs.Screen
        name="profile"
        options={{
          title: auth.isAuthenticated ? 'Profil' : 'Connexion',
          tabBarIcon: icon(auth.isAuthenticated ? 'account-circle-outline' : 'login'),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          tabBarIcon: icon('shield-account-outline'),
          href: auth.isAdmin ? undefined : null,
        }}
      />
      <Tabs.Screen name="edit-profile" options={{ href: null }} />
      <Tabs.Screen name="change-password" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  declareBtnContainer: {
    top: -18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    marginHorizontal: spacing.sm,
  },
  declareBtnPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  declareBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.white,
  },
});
