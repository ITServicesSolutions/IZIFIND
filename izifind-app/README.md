# IZIFIND App - Application Mobile

Ce projet est l'application mobile native de la plateforme **IZIFIND**. Elle permet aux utilisateurs de déclarer des objets perdus ou trouvés, de consulter le catalogue, d'effectuer des recherches (y compris par recherche vocale) et de se connecter via un mot de passe ou via le SSO Google.

## 🛠️ Stack Technique

* **Framework** : React Native avec Expo (SDK 54)
* **Routage** : Expo Router (routage basé sur le système de fichiers)
* **Recherche Vocale** : `expo-speech-recognition` (avec alerte de secours si non supportée par le système)
* **SSO Google** : `expo-auth-session` & `expo-web-browser`

## 🚀 Installation & Exécution

### 1. Prérequis
Assurez-vous d'avoir Node.js, npm, et le CLI Expo d'installés. Pour tester sur votre téléphone, installez l'application **Expo Go** (disponible sur iOS App Store et Android Google Play Store).

### 2. Entrer dans le dossier
```bash
cd izifind-app
```

### 3. Installer les dépendances
```bash
npm install
```

### 4. Configurer les variables d'environnement
Créez un fichier `.env` à la racine de `izifind-app` en vous inspirant de `.env.example` :
```env
EXPO_PUBLIC_API_BASE_URL=http://<VOTRE_IP_LOCALE>:8000/api
EXPO_PUBLIC_GOOGLE_CLIENT_ID=539189092195-hojk48g036jrt1c8s0bnfo42d38dra72.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=539189092195-0e4qqnfu71tmvfdkqumdk7irp552m6ta.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=539189092195-nm1pdb5g6fskqjak6s8rl43m56prbj59.apps.googleusercontent.com
```
*Note : Remplacer `<VOTRE_IP_LOCALE>` par votre adresse IP locale (ex: 192.168.1.100) afin que votre téléphone physique puisse communiquer avec le backend local.*

### 5. Lancer l'application en développement
```bash
npx expo start
```
Scannez le QR Code affiché dans votre terminal avec l'application **Expo Go** (sur Android) ou votre application Appareil photo native (sur iOS) pour exécuter l'application sur votre appareil.

## 📁 Structure du Projet

* `app/` : Routes et pages de navigation gérées par Expo Router (`(tabs)`, `(auth)`, `index.tsx`, `_layout.tsx`).
* `src/` : Code source TypeScript du projet.
  * `auth/` : Gestion du contexte d'authentification (`AuthContext.tsx`).
  * `components/` : Composants graphiques réutilisables (`SearchBar.tsx`, `AnnonceCard.tsx`, `PrimaryButton.tsx`, etc.).
  * `config/` : Ressources et configurations.
  * `constants/` : Définitions globales des couleurs, espacements et thèmes (`theme.ts`).
  * `screens/` : Écrans fonctionnels de l'application (HomeScreen, CatalogScreen, LoginScreen, RegisterScreen, etc.).
  * `services/` : Client HTTP (Axios) et requêtes backend (`auth.ts`, `catalog.ts`, `http.ts`).
  * `types/` : Définitions et interfaces TypeScript.
  * `utils/` : Fonctions utilitaires d'aide.
* `app.json` : Fichier de configuration globale de l'application Expo (permissions, plugins, etc.).
* `package.json` : scripts, dépendances NPM.
