from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional

from ..database import get_db
from ..models.objets import Objet
from ..schemas.objets import ObjetCreate, ObjetUpdate, Objet as ObjetSchema
from ..dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["Objets"])

# ═══════════════════════════════════════════════════════════
#  OBJETS — CRUD complet + filtres
# ═══════════════════════════════════════════════════════════

@router.get(
    "/objets",
    response_model=List[ObjetSchema],
    summary="Lister les objets",
    description=(
        "Renvoie la liste des objets avec filtres optionnels : "
        "categorie, souscategorie, marque, couleur, statut, is_public, search (texte libre)."
    ),
)
def get_objets(
    skip: int = 0,
    limit: int = 100,
    categorie: Optional[int] = Query(None, description="Filtrer par catégorie"),
    souscategorie: Optional[int] = Query(None, description="Filtrer par sous-catégorie"),
    marque: Optional[int] = Query(None, description="Filtrer par marque"),
    couleur: Optional[int] = Query(None, description="Filtrer par couleur"),
    statut: Optional[int] = Query(None, description="Filtrer par statut"),
    search: Optional[str] = Query(None, description="Recherche texte dans la description"),
    db: Session = Depends(get_db),
):
    query = db.query(Objet)

    if categorie is not None:
        query = query.filter(Objet.categorie_id == categorie)
    if souscategorie is not None:
        query = query.filter(Objet.souscategorie_id == souscategorie)
    if marque is not None:
        query = query.filter(Objet.marque_id == marque)
    if couleur is not None:
        query = query.filter(Objet.couleur_id == couleur)
    if statut is not None:
        query = query.filter(Objet.statut_id == statut)
    # Endpoint public : toujours filtrer sur les objets publics uniquement.
    # Pour accéder aux objets privés, utiliser /recherche/avancee (AUTH requise).
    query = query.filter(Objet.is_public == True)
    if search:
        query = query.filter(
            or_(
                Objet.description.ilike(f"%{search}%"),
                Objet.lieu.ilike(f"%{search}%"),
            )
        )

    return query.order_by(Objet.date.desc(), Objet.id.desc()).offset(skip).limit(limit).all()


@router.post(
    "/objets",
    response_model=ObjetSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Déclarer un objet",
    description="Permet de déclarer un nouvel objet trouvé ou perdu (authentification requise).",
)
def create_objet(
    objet_in: ObjetCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    new_objet = Objet(**objet_in.model_dump())
    db.add(new_objet)
    db.commit()
    db.refresh(new_objet)
    return new_objet


@router.get(
    "/objets/{objet_id}",
    response_model=ObjetSchema,
    summary="Détail d'un objet",
    description="Renvoie les informations complètes d'un objet par son identifiant.",
)
def get_objet(objet_id: int, db: Session = Depends(get_db)):
    objet = db.query(Objet).filter(Objet.id == objet_id).first()
    if not objet:
        raise HTTPException(status_code=404, detail="Objet introuvable")
    return objet


@router.put(
    "/objets/{objet_id}",
    response_model=ObjetSchema,
    summary="Modifier un objet (complet)",
    description="Remplace entièrement les champs d'un objet.",
)
def update_objet(
    objet_id: int,
    objet_in: ObjetCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    objet = db.query(Objet).filter(Objet.id == objet_id).first()
    if not objet:
        raise HTTPException(status_code=404, detail="Objet introuvable")
    for key, value in objet_in.model_dump().items():
        setattr(objet, key, value)
    db.commit()
    db.refresh(objet)
    return objet


@router.patch(
    "/objets/{objet_id}",
    response_model=ObjetSchema,
    summary="Modifier un objet (partiel)",
    description="Met à jour uniquement les champs fournis.",
)
def patch_objet(
    objet_id: int,
    objet_in: ObjetUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    objet = db.query(Objet).filter(Objet.id == objet_id).first()
    if not objet:
        raise HTTPException(status_code=404, detail="Objet introuvable")
    for key, value in objet_in.model_dump(exclude_unset=True).items():
        setattr(objet, key, value)
    db.commit()
    db.refresh(objet)
    return objet


@router.delete(
    "/objets/{objet_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer un objet",
    description="Supprime un objet et ses images/modifications en cascade.",
)
def delete_objet(
    objet_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    objet = db.query(Objet).filter(Objet.id == objet_id).first()
    if not objet:
        raise HTTPException(status_code=404, detail="Objet introuvable")
    db.commit()
    return None

@router.get(
    "/recherche/avancee",
    response_model=List[ObjetSchema],
    summary="Recherche avancée d'objets",
    description="[AUTH REQUISE] Permet une recherche avec plus de filtres ou d'accéder à des objets non publics."
)
def recherche_avancee(
    skip: int = 0,
    limit: int = 100,
    categorie: Optional[int] = Query(None, description="Filtrer par catégorie"),
    souscategorie: Optional[int] = Query(None, description="Filtrer par sous-catégorie"),
    marque: Optional[int] = Query(None, description="Filtrer par marque"),
    couleur: Optional[int] = Query(None, description="Filtrer par couleur"),
    statut: Optional[int] = Query(None, description="Filtrer par statut"),
    search: Optional[str] = Query(None, description="Recherche texte dans la description"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Logique similaire au GET public, mais on autorise de voir potentiellement tout
    query = db.query(Objet)

    if categorie is not None:
        query = query.filter(Objet.categorie_id == categorie)
    if souscategorie is not None:
        query = query.filter(Objet.souscategorie_id == souscategorie)
    if marque is not None:
        query = query.filter(Objet.marque_id == marque)
    if couleur is not None:
        query = query.filter(Objet.couleur_id == couleur)
    if statut is not None:
        query = query.filter(Objet.statut_id == statut)
    if search:
        query = query.filter(
            or_(
                Objet.description.ilike(f"%{search}%"),
                Objet.lieu.ilike(f"%{search}%"),
            )
        )

    return query.order_by(Objet.date.desc(), Objet.id.desc()).offset(skip).limit(limit).all()
