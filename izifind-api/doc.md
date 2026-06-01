# Documentation Backend IZIFIND

## Objectif

IZIFIND est un backend FastAPI destiné à centraliser les déclarations d'objets perdus, trouvés ou volés. Il permet aux visiteurs de consulter les informations publiques, aux déclarants de soumettre un objet avec contact et localisation, et aux commissaires de gérer le référentiel métier.

Le backend initialement en Django a été entièrement réécrit en **FastAPI**. Il intègre un système d'authentification JWT, des rôles (RBAC), la géolocalisation pour trouver le commissariat le plus proche, et des workflows de déclarations sécurisés.

## Acteurs

- Visiteur : consulte le site public et les objets publiés, peut déclarer anonymement un objet trouvé.
- Déclarant : déclare un objet perdu depuis l'API REST (nécessite un compte).
- Commissaire : valide physiquement un objet trouvé pour le rendre public. Rattaché à un commissariat.
- Administrateur : gère les catégories, objets, images, statuts et commissariats via des endpoints protégés.

## Tables et relations

- `Categorie` : famille principale d'objets.
- `SousCategorie` : type détaillé rattaché à une catégorie.
- `Marque` : marque possible pour une sous-catégorie.
- `Couleur` : couleur descriptive.
- `Statut` : état de l'objet (`PERDU`, `TRANSMIS`, `TROUVE`).
- `TitreObjet` : désignation optionnelle rattachée à une sous-catégorie.
- `Commissariat` : lieu physique avec latitude et longitude pour le dépôt d'objets.
- `Objet` : déclaration principale.
- `Promesse` : récompense optionnelle attachée à un objet perdu.
- `Temoignage` : retour d'expérience d'un utilisateur après récupération de son objet.
- `ImageObjet` : image rattachée à un objet.
- `ModifierObjet` : trace de modification ou demande de correction.
- `users` : utilisateurs système (Authentification JWT).
- `roles` et `permissions` : gestion du RBAC.

## Catalogue API

Documentation interactive (générée automatiquement par FastAPI) :

- Swagger : `http://127.0.0.1:8000/docs`
- Redoc : `http://127.0.0.1:8000/redoc`

Endpoints métiers clés :

- `POST /api/declarations/perdu` : Déclarer un objet perdu (Auth requise, Upload 3 photos).
- `POST /api/declarations/trouve` : Déclarer un objet trouvé (Upload 3 photos, calcul géolocalisation).
- `PUT /api/commissariats/objets/{id}/valider` : Validation par un commissaire.
- `GET /api/objets/recherche/avancee` : Recherche privée.
- `POST /api/temoignages` : Laisser un témoignage (si objet TROUVE).

Filtres utiles sur `GET /api/objets/` :

- `?categorie=<id>`
- `?souscategorie=<id>`
- `?marque=<id>`
- `?couleur=<id>`
- `?statut=<id>`
- `?is_public=true`
- `?search=<texte>`

## Validation & Test

Commandes recommandées pour démarrer :

```powershell
# Activer l'environnement virtuel et installer les dépendances
env\Scripts\activate
pip install -r requirements.txt

# Injecter les données de base (roles, statuts, catégories, commissariats, admin)
python app/seed.py

# Démarrer le serveur
uvicorn app.main:app --reload
```
