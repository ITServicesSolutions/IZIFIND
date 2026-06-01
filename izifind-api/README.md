# IZIFIND

IZIFIND est maintenant organise en deux applications :

- `app/` : backend FastAPI avec SQLAlchemy, Alembic et JWT ;
- `frontend/` : SPA Vue 3 + TypeScript servie par Vite.

Les anciens templates et assets Django ont ete retires.

## Backend

```powershell
env\Scripts\activate
pip install -r requirements.txt
python app/seed.py
uvicorn app.main:app --reload
```

### 🗄️ Base de données
Par défaut, le projet utilise une base de données **SQLite** (le fichier généré sera `db.sqlite3` à la racine).

Pour passer sur **PostgreSQL**, créez un fichier `.env` à la racine avec le contenu suivant :
```env
DATABASE_ENGINE=postgres
DATABASE_NAME=izifind
DATABASE_USER=postgres
DATABASE_PASSWORD=votre_mot_de_passe
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

### 🔑 Données de test (Seed)
Le script `python app/seed.py` injecte automatiquement des données essentielles pour vos tests.
Voici les identifiants créés par défaut :

| Rôle | Nom d'utilisateur | Email | Mot de passe |
|---|---|---|---|
| Administrateur | `admin` | `admin@izifind.local` | `admin` |
| Commissaire | `commissaire1` | `commissaire1@izifind.local` | `commissaire` |

URLs utiles :

- API : http://127.0.0.1:8000/api
- Swagger : http://127.0.0.1:8000/docs
- Redoc : http://127.0.0.1:8000/redoc

## Frontend

```powershell
cd frontend
npm install
npm run dev
npm run build
```

Par defaut, le frontend consomme `http://localhost:8000/api`. Pour changer l'URL :

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Endpoints principaux

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/categories`
- `POST /api/categories`
- `GET /api/objets`
- `POST /api/objets`
- `GET /api/rbac/roles`
- `POST /api/rbac/roles`
- `GET /api/rbac/permissions`
- `POST /api/rbac/permissions`
