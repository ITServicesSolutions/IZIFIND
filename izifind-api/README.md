# IZIFIND API - Backend

Ce projet constitue le backend de la plateforme **IZIFIND**. Il fournit les APIs REST nécessaires pour la gestion des utilisateurs, l'authentification (y compris le SSO Google), la déclaration et le catalogue des objets perdus/trouvés.

## 🛠️ Stack Technique

* **Framework** : FastAPI (Python)
* **Base de données** : SQLite (par défaut, configurable en PostgreSQL)
* **ORM** : SQLAlchemy
* **Authentification** : JWT (JSON Web Tokens) & Google SSO via `google-auth`
* **Validation de données** : Pydantic

## 🚀 Installation & Exécution

### 1. Prérequis
Assurez-vous d'avoir Python 3.10+ d'installé.

### 2. Cloner le dépôt et entrer dans le dossier
```bash
cd izifind-api
```

### 3. Créer et activer un environnement virtuel
```bash
python -m venv venv
# Sur Windows (PowerShell) :
.\venv\Scripts\Activate.ps1
# Sur macOS/Linux :
source venv/bin/activate
```

### 4. Installer les dépendances
```bash
pip install -r requirements.txt
```

### 5. Configurer les variables d'environnement
Copiez le fichier `.env.example` en `.env` :
```bash
cp .env.example .env
```
Remplissez les variables d'environnement dans le fichier `.env` (notamment la `SECRET_KEY`, la configuration SMTP si nécessaire, et les Client IDs Google pour l'authentification).

### 6. Initialiser/Semer la base de données
```bash
python -m app.seed
```

### 8. Lancer le serveur de développement
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
L'API sera disponible sur : [http://localhost:8000](http://localhost:8000)
La documentation interactive de l'API (Swagger) sera accessible sur : [http://localhost:8000/docs](http://localhost:8000/docs)

## 📁 Structure du Projet

* `app/` : Code source de l'application FastAPI.
  * `config.py` : Gestion des variables d'environnement et de la configuration de l'application.
  * `database.py` : Configuration de la connexion SQLAlchemy.
  * `dependencies.py` : Dépendances FastAPI (comme la vérification de l'utilisateur connecté).
  * `main.py` : Point d'entrée de l'application FastAPI.
  * `models/` : Modèles de la base de données SQLAlchemy.
  * `routers/` : Les contrôleurs / routes de l'API (auth, objets, catégories, etc.).
  * `schemas/` : Schémas Pydantic pour la validation des requêtes et réponses.
  * `security.py` : Fonctions utilitaires de hachage de mot de passe et de génération de JWT.
* `tests/` : Suite de tests unitaires et d'intégration.
* `requirements.txt` : Liste des dépendances Python requises.
* `.env` : Fichier de configuration d'environnement local.
