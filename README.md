# IZIFIND - Solution Globale de Restitution d'Objets Perdus & Trouvés

Bienvenue dans le dépôt principal de **IZIFIND**. IZIFIND est une plateforme communautaire et solidaire qui aide les citoyens à retrouver et restituer les objets perdus ou trouvés. Elle se décompose en trois projets interconnectés : un backend API, un portail web, et une application mobile native.

## 🏗️ Architecture du Projet

Le workspace contient les trois sous-projets suivants :

1. **[Backend API (FastAPI)](./izifind-api/README.md)** : Gère l'authentification (y compris le SSO Google pour mobile et web), les utilisateurs, le catalogue, les déclarations et les communications SMTP pour le mot de passe oublié.
2. **[Application Web (Vue.js)](./izifind-front/README.md)** : L'interface web de la plateforme, avec filtres de recherche (texte + voix), carte interactive et espace utilisateur sécurisé.
3. **[Application Mobile (React Native & Expo)](./izifind-app/README.md)** : L'application mobile native pour iOS et Android, intégrant la recherche vocale native, le SSO Google (via Expo Auth Session) et la géolocalisation.

---

## 🚀 Commencer rapidement

Veuillez consulter les guides individuels de chaque sous-projet pour les instructions de configuration et d'exécution :

* **[Guide d'installation du Backend API](./izifind-api/README.md)**
* **[Guide d'installation de l'Application Web](./izifind-front/README.md)**
* **[Guide d'installation de l'Application Mobile](./izifind-app/README.md)**

## 🔑 Fonctionnalités Clés & Intégrations

* **Authentification Unifiée** : Un unique compte permet d'accéder au web et au mobile.
* **SSO Google** : Connexion simplifiée en un clic sur le web et sur l'application mobile (iOS & Android).
* **Recherche Vocale** : Disponible à la fois sur le web (via la Web Speech API) et sur le mobile (via `expo-speech-recognition` et fallback interactif).
* **Carte Interactive** : Localisation des objets perdus et des commissariats partenaires.
