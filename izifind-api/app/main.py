from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from slowapi.errors import RateLimitExceeded

from .utils.rate_limiter import limiter
from .routers import auth, rbac, objets, categories, references, images, modifications, commissariats, declarations, temoignages, promesse
# NOTE: Toute création/modification de tables passe désormais par Alembic.
# Ne JAMAIS utiliser Base.metadata.create_all() ici.

app = FastAPI(
    title="API IZIFIND",
    description="API FastAPI pour la gestion des objets perdus et trouvés",
    version="1.0.0",
)

# Enregistrer le rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, lambda request, exc: HTTPException(
    status_code=429,
    detail="Too many requests. Please try again later."
))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(rbac.router)
app.include_router(categories.router)
app.include_router(references.router)
app.include_router(objets.router)
app.include_router(images.router)
app.include_router(modifications.router)
app.include_router(commissariats.router)
app.include_router(declarations.router)
app.include_router(temoignages.router)
app.include_router(promesse.router)

# ── Servir les fichiers media (images uploadées) ──────────
BASE_DIR = Path(__file__).resolve().parent.parent
MEDIA_DIR = BASE_DIR / "media"
FRONTEND_DIST_DIR = BASE_DIR / "frontend" / "dist"

MEDIA_DIR.mkdir(exist_ok=True)
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

if (FRONTEND_DIST_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST_DIR / "assets"), name="frontend-assets")

# Route pour la racine "/"
@app.get(
    "/",
    response_model=None,
    summary="Accueil API",
    description="Renvoie un message d'accueil public avec les informations générales de l'API IZIFIND.",
)
async def root():
    frontend_index = FRONTEND_DIST_DIR / "index.html"
    if frontend_index.exists():
        return FileResponse(frontend_index)

    return {
        "message": "Bienvenue sur l'API de IZIFIND",
        "author": "Obed VODOUHE",
        "email": "leonardovodouhe06@gmail.com",
        "instruction": "Utilisez /api pour accéder aux ressources"
    }

# Route pour "/api" qui renvoie un message similaire
@app.get(
    "/api",
    response_model=dict,
    summary="Accueil des ressources API",
    description="Renvoie un message public indiquant le préfixe à utiliser pour accéder aux ressources de l'API.",
)
async def api_root():
    return {
        "message": "Bienvenue sur l'API de IZIFIND",
        "author": "Obed VODOUHE",
        "email": "leonardovodouhe06@gmail.com",
        "instruction": "Utilisez /api/<endpoint> pour accéder aux différentes ressources disponibles"
    }


@app.get("/{full_path:path}", include_in_schema=False)
async def serve_frontend(full_path: str):
    frontend_index = FRONTEND_DIST_DIR / "index.html"
    frontend_dist = FRONTEND_DIST_DIR.resolve()
    requested_file = (FRONTEND_DIST_DIR / full_path).resolve()

    try:
        requested_file.relative_to(frontend_dist)
    except ValueError:
        raise HTTPException(status_code=404, detail="Not found")

    if requested_file.is_file():
        return FileResponse(requested_file)

    if frontend_index.exists():
        return FileResponse(frontend_index)

    raise HTTPException(status_code=404, detail="Frontend build not found")
