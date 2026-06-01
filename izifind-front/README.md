# IZIFIND Frontend

Application Vue 3 + TypeScript servie par Vite. Elle remplace les anciens templates Django et consomme l'API FastAPI exposee sous `/api`.

## Commandes

```powershell
npm install
npm run dev
npm run build
```

## Configuration

Par defaut, le client pointe vers :

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Vous pouvez definir cette variable dans `frontend/.env.local` si le backend tourne ailleurs.

## Fonctionnalites

- navigation SPA via Vue Router ;
- authentification JWT stockee en localStorage ;
- etat utilisateur via Pinia ;
- catalogue public filtre ;
- declarations d'objets perdus/trouves ;
- administration des categories, roles et permissions.
