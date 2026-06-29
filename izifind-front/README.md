# IZIFIND Front - Application Web

Ce projet est l'application web frontend de la plateforme **IZIFIND**. Il permet aux utilisateurs de naviguer dans le catalogue des objets perdus/trouvés, d'effectuer des recherches par texte ou recherche vocale, d'utiliser la carte interactive pour situer les commissariats et de s'authentifier (SSO Google inclus).

## 🛠️ Stack Technique

* **Framework** : Vue.js 3
* **Outil de Build** : Vite
* **Gestion d'État** : Pinia
* **Routage** : Vue Router
* **Styles** : CSS natif (pour une flexibilité maximale)
* **Recherche Vocale** : API Web Speech API native du navigateur
* **SSO Google** : Google Identity Services (GIS)

## 🚀 Installation & Exécution

### 1. Prérequis
Assurez-vous d'avoir Node.js (version 18+) et npm d'installés.

### 2. Entrer dans le dossier
```bash
cd izifind-front
```

### 3. Installer les dépendances
```bash
npm install
```

### 4. Configurer les variables d'environnement
Copiez le fichier `.env.example` ou créez un fichier `.env` :
```bash
# Exemple de contenu pour .env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=539189092195-hojk48g036jrt1c8s0bnfo42d38dra72.apps.googleusercontent.com
```

### 5. Lancer le serveur de développement
```bash
npm run dev
```
L'application web sera disponible sur : [http://localhost:5173](http://localhost:5173)

### 6. Compiler pour la production
```bash
npm run build
```

## 📁 Structure du Projet

* `src/` : Code source de l'application.
  * `assets/` : Ressources statiques (images, styles globaux).
  * `components/` : Composants réutilisables (AnnonceCard, DeclarationWizard, etc.).
  * `router/` : Configuration de Vue Router.
  * `services/` : Modules de communication avec l'API backend (API, authentification, objets).
  * `stores/` : Stores Pinia pour la gestion globale de l'état (auth).
  * `views/` : Vues et pages principales de l'application (AnnoncesView, HomeView, MapView, LoginView, etc.).
  * `App.vue` : Composant racine de l'application.
  * `main.ts` : Point d'entrée TypeScript.
* `vite.config.ts` : Fichier de configuration de Vite.
* `package.json` : Scripts et dépendances du projet.
