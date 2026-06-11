from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.objets import Promesse, Objet
from ..models.auth import User
from ..schemas.objets import PromesseCreate, PromesseUpdate, Promesse as PromesseSchema
from ..dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["Promesses"])


@router.get(
    "/promesses",
    response_model=List[PromesseSchema],
    summary="Lister les promesses",
    description="Renvoie toutes les promesses de récompense enregistrées."
)
def get_promesses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return db.query(Promesse).offset(skip).limit(limit).all()


@router.post(
    "/promesses",
    response_model=PromesseSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Créer une promesse",
    description="[AUTH REQUISE] Crée une nouvelle promesse de récompense pour un objet."
)
def create_promesse(
    promesse_in: PromesseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Vérifier que l'objet existe
    objet = db.query(Objet).filter(Objet.id == promesse_in.objet_id).first()
    if not objet:
        raise HTTPException(status_code=404, detail="Objet introuvable")
    
    # Vérifier qu'une promesse n'existe pas déjà pour cet objet
    existing = db.query(Promesse).filter(Promesse.objet_id == promesse_in.objet_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Une promesse existe déjà pour cet objet")
    
    # Valider le montant
    if promesse_in.montant <= 0:
        raise HTTPException(status_code=400, detail="Le montant doit être supérieur à 0")
    
    new_promesse = Promesse(
        objet_id=promesse_in.objet_id,
        montant=promesse_in.montant,
        pourcentage_frais=promesse_in.pourcentage_frais or 10.0
    )
    db.add(new_promesse)
    db.commit()
    db.refresh(new_promesse)
    return new_promesse


@router.get(
    "/promesses/{promesse_id}",
    response_model=PromesseSchema,
    summary="Détail d'une promesse",
    description="Récupère les détails d'une promesse de récompense."
)
def get_promesse(
    promesse_id: int,
    db: Session = Depends(get_db),
):
    promesse = db.query(Promesse).filter(Promesse.id == promesse_id).first()
    if not promesse:
        raise HTTPException(status_code=404, detail="Promesse introuvable")
    return promesse


@router.put(
    "/promesses/{promesse_id}",
    response_model=PromesseSchema,
    summary="Modifier une promesse",
    description="[AUTH REQUISE] Modifie une promesse (propriétaire de l'objet ou admin)."
)
def update_promesse(
    promesse_id: int,
    promesse_in: PromesseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    promesse = db.query(Promesse).filter(Promesse.id == promesse_id).first()
    if not promesse:
        raise HTTPException(status_code=404, detail="Promesse introuvable")
    
    # Valider le montant
    if promesse_in.montant <= 0:
        raise HTTPException(status_code=400, detail="Le montant doit être supérieur à 0")
    
    promesse.montant = promesse_in.montant
    if promesse_in.pourcentage_frais:
        promesse.pourcentage_frais = promesse_in.pourcentage_frais
    
    db.add(promesse)
    db.commit()
    db.refresh(promesse)
    return promesse


@router.patch(
    "/promesses/{promesse_id}",
    response_model=PromesseSchema,
    summary="Modifier partiellement une promesse",
    description="[AUTH REQUISE] Modifie partiellement une promesse."
)
def patch_promesse(
    promesse_id: int,
    promesse_in: PromesseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    promesse = db.query(Promesse).filter(Promesse.id == promesse_id).first()
    if not promesse:
        raise HTTPException(status_code=404, detail="Promesse introuvable")
    
    if promesse_in.montant is not None:
        if promesse_in.montant <= 0:
            raise HTTPException(status_code=400, detail="Le montant doit être supérieur à 0")
        promesse.montant = promesse_in.montant
    
    if promesse_in.pourcentage_frais is not None:
        promesse.pourcentage_frais = promesse_in.pourcentage_frais
    
    db.add(promesse)
    db.commit()
    db.refresh(promesse)
    return promesse


@router.delete(
    "/promesses/{promesse_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer une promesse",
    description="[AUTH REQUISE] Supprime une promesse de récompense."
)
def delete_promesse(
    promesse_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    promesse = db.query(Promesse).filter(Promesse.id == promesse_id).first()
    if not promesse:
        raise HTTPException(status_code=404, detail="Promesse introuvable")
    
    db.delete(promesse)
    db.commit()
    return None
