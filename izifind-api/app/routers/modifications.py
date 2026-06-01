from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.objets import ModifierObjet, Objet
from ..schemas.objets import (
    ModifierObjetCreate, ModifierObjetUpdate, ModifierObjet as ModifierObjetSchema,
)
from ..dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["Modifications"])

# ═══════════════════════════════════════════════════════════
#  MODIFICATIONS D'OBJETS
# ═══════════════════════════════════════════════════════════

@router.get(
    "/modifications",
    response_model=List[ModifierObjetSchema],
    summary="Lister les modifications",
    description="Renvoie toutes les demandes de modification d'objets.",
)
def get_modifications(db: Session = Depends(get_db)):
    return db.query(ModifierObjet).all()


@router.post(
    "/modifications",
    response_model=ModifierObjetSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Créer une modification",
    description="Soumet une demande de modification ou correction pour un objet.",
)
def create_modification(
    mod_in: ModifierObjetCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    objet = db.query(Objet).filter(Objet.id == mod_in.objet_id).first()
    if not objet:
        raise HTTPException(status_code=404, detail="Objet introuvable")
    new_mod = ModifierObjet(**mod_in.model_dump())
    db.add(new_mod)
    db.commit()
    db.refresh(new_mod)
    return new_mod


@router.get(
    "/modifications/{modification_id}",
    response_model=ModifierObjetSchema,
    summary="Détail d'une modification",
    description="Renvoie les informations d'une modification par son identifiant.",
)
def get_modification(modification_id: int, db: Session = Depends(get_db)):
    mod = db.query(ModifierObjet).filter(ModifierObjet.id == modification_id).first()
    if not mod:
        raise HTTPException(status_code=404, detail="Modification introuvable")
    return mod


@router.put(
    "/modifications/{modification_id}",
    response_model=ModifierObjetSchema,
    summary="Modifier une modification (complet)",
    description="Remplace entièrement les champs d'une modification.",
)
def update_modification(
    modification_id: int,
    mod_in: ModifierObjetCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    mod = db.query(ModifierObjet).filter(ModifierObjet.id == modification_id).first()
    if not mod:
        raise HTTPException(status_code=404, detail="Modification introuvable")
    for key, value in mod_in.model_dump().items():
        setattr(mod, key, value)
    db.commit()
    db.refresh(mod)
    return mod


@router.patch(
    "/modifications/{modification_id}",
    response_model=ModifierObjetSchema,
    summary="Modifier une modification (partiel)",
    description="Met à jour uniquement les champs fournis (ex: confirmer une modification).",
)
def patch_modification(
    modification_id: int,
    mod_in: ModifierObjetUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    mod = db.query(ModifierObjet).filter(ModifierObjet.id == modification_id).first()
    if not mod:
        raise HTTPException(status_code=404, detail="Modification introuvable")
    for key, value in mod_in.model_dump(exclude_unset=True).items():
        setattr(mod, key, value)
    db.commit()
    db.refresh(mod)
    return mod


@router.delete(
    "/modifications/{modification_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer une modification",
    description="Supprime une demande de modification.",
)
def delete_modification(
    modification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    mod = db.query(ModifierObjet).filter(ModifierObjet.id == modification_id).first()
    if not mod:
        raise HTTPException(status_code=404, detail="Modification introuvable")
    db.delete(mod)
    db.commit()
    return None
