from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.objets import Categorie, SousCategorie
from ..schemas.objets import (
    CategorieCreate, CategorieUpdate, Categorie as CategorieSchema,
    SousCategorieCreate, SousCategorieUpdate, SousCategorie as SousCategorieSchema,
)
from ..dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["Catégories & Sous-catégories"])

# ═══════════════════════════════════════════════════════════
#  CATEGORIES
# ═══════════════════════════════════════════════════════════

@router.get(
    "/categories",
    response_model=List[CategorieSchema],
    summary="Lister les catégories",
    description="Renvoie toutes les catégories disponibles.",
)
def get_categories(db: Session = Depends(get_db)):
    return db.query(Categorie).all()


@router.post(
    "/categories",
    response_model=CategorieSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Créer une catégorie",
    description="Crée une nouvelle catégorie (authentification requise).",
)
def create_categorie(
    cat_in: CategorieCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    new_cat = Categorie(**cat_in.model_dump())
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat


@router.get(
    "/categories/{categorie_id}",
    response_model=CategorieSchema,
    summary="Détail d'une catégorie",
    description="Renvoie les informations d'une catégorie par son identifiant.",
)
def get_categorie(categorie_id: int, db: Session = Depends(get_db)):
    cat = db.query(Categorie).filter(Categorie.id == categorie_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Catégorie introuvable")
    return cat


@router.put(
    "/categories/{categorie_id}",
    response_model=CategorieSchema,
    summary="Modifier une catégorie (complet)",
    description="Remplace entièrement les champs d'une catégorie.",
)
def update_categorie(
    categorie_id: int,
    cat_in: CategorieCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    cat = db.query(Categorie).filter(Categorie.id == categorie_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Catégorie introuvable")
    for key, value in cat_in.model_dump().items():
        setattr(cat, key, value)
    db.commit()
    db.refresh(cat)
    return cat


@router.patch(
    "/categories/{categorie_id}",
    response_model=CategorieSchema,
    summary="Modifier une catégorie (partiel)",
    description="Met à jour uniquement les champs fournis.",
)
def patch_categorie(
    categorie_id: int,
    cat_in: CategorieUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    cat = db.query(Categorie).filter(Categorie.id == categorie_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Catégorie introuvable")
    for key, value in cat_in.model_dump(exclude_unset=True).items():
        setattr(cat, key, value)
    db.commit()
    db.refresh(cat)
    return cat


@router.delete(
    "/categories/{categorie_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer une catégorie",
    description="Supprime une catégorie et ses sous-catégories en cascade.",
)
def delete_categorie(
    categorie_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    cat = db.query(Categorie).filter(Categorie.id == categorie_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Catégorie introuvable")
    db.delete(cat)
    db.commit()
    return None


# ═══════════════════════════════════════════════════════════
#  SOUS-CATEGORIES
# ═══════════════════════════════════════════════════════════

@router.get(
    "/sous-categories",
    response_model=List[SousCategorieSchema],
    summary="Lister les sous-catégories",
    description="Renvoie toutes les sous-catégories.",
)
def get_sous_categories(db: Session = Depends(get_db)):
    return db.query(SousCategorie).all()


@router.post(
    "/sous-categories",
    response_model=SousCategorieSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Créer une sous-catégorie",
    description="Crée une nouvelle sous-catégorie rattachée à une catégorie.",
)
def create_sous_categorie(
    sc_in: SousCategorieCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Vérifier que la catégorie parente existe
    parent = db.query(Categorie).filter(Categorie.id == sc_in.categorie_id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Catégorie parente introuvable")
    new_sc = SousCategorie(**sc_in.model_dump())
    db.add(new_sc)
    db.commit()
    db.refresh(new_sc)
    return new_sc


@router.get(
    "/sous-categories/par-categorie/{categorie_id}",
    response_model=List[SousCategorieSchema],
    summary="Sous-catégories par catégorie",
    description="Renvoie les sous-catégories rattachées à une catégorie donnée (filtrage dynamique).",
)
def get_sous_categories_by_categorie(categorie_id: int, db: Session = Depends(get_db)):
    return db.query(SousCategorie).filter(SousCategorie.categorie_id == categorie_id).all()


@router.get(
    "/sous-categories/{sc_id}",
    response_model=SousCategorieSchema,
    summary="Détail d'une sous-catégorie",
    description="Renvoie les informations d'une sous-catégorie par son identifiant.",
)
def get_sous_categorie(sc_id: int, db: Session = Depends(get_db)):
    sc = db.query(SousCategorie).filter(SousCategorie.id == sc_id).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Sous-catégorie introuvable")
    return sc


@router.put(
    "/sous-categories/{sc_id}",
    response_model=SousCategorieSchema,
    summary="Modifier une sous-catégorie (complet)",
    description="Remplace entièrement les champs d'une sous-catégorie.",
)
def update_sous_categorie(
    sc_id: int,
    sc_in: SousCategorieCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    sc = db.query(SousCategorie).filter(SousCategorie.id == sc_id).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Sous-catégorie introuvable")
    for key, value in sc_in.model_dump().items():
        setattr(sc, key, value)
    db.commit()
    db.refresh(sc)
    return sc


@router.patch(
    "/sous-categories/{sc_id}",
    response_model=SousCategorieSchema,
    summary="Modifier une sous-catégorie (partiel)",
    description="Met à jour uniquement les champs fournis.",
)
def patch_sous_categorie(
    sc_id: int,
    sc_in: SousCategorieUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    sc = db.query(SousCategorie).filter(SousCategorie.id == sc_id).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Sous-catégorie introuvable")
    for key, value in sc_in.model_dump(exclude_unset=True).items():
        setattr(sc, key, value)
    db.commit()
    db.refresh(sc)
    return sc


@router.delete(
    "/sous-categories/{sc_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer une sous-catégorie",
    description="Supprime une sous-catégorie.",
)
def delete_sous_categorie(
    sc_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    sc = db.query(SousCategorie).filter(SousCategorie.id == sc_id).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Sous-catégorie introuvable")
    db.delete(sc)
    db.commit()
    return None
