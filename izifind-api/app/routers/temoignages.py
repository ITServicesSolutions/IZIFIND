from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.objets import Temoignage, Objet, Statut
from ..models.auth import User
from ..schemas.objets import TemoignageCreate, TemoignageUpdate, Temoignage as TemoignageSchema
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/temoignages", tags=["Témoignages"])

@router.get(
    "/",
    response_model=List[TemoignageSchema],
    summary="Lister les témoignages",
    description="Renvoie tous les témoignages laissés par les utilisateurs."
)
def get_temoignages(db: Session = Depends(get_db)):
    return db.query(Temoignage).all()

@router.post(
    "/",
    response_model=TemoignageSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Soumettre un témoignage",
    description="[AUTH REQUISE] Laisse un témoignage pour un objet récupéré. L'objet doit être au statut TROUVE."
)
def create_temoignage(
    tem_in: TemoignageCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    objet = db.query(Objet).filter(Objet.id == tem_in.objet_id).first()
    if not objet:
        raise HTTPException(status_code=404, detail="Objet introuvable")

    # On vérifie que le statut est bien TROUVE
    statut_trouve = db.query(Statut).filter(Statut.name.ilike("TROUVE")).first()
    if not statut_trouve or objet.statut_id != statut_trouve.id:
        raise HTTPException(status_code=400, detail="Un témoignage ne peut être laissé que pour un objet récupéré (statut TROUVE).")

    new_temoignage = Temoignage(
        objet_id=tem_in.objet_id,
        user_id=current_user.id,
        contenu=tem_in.contenu
    )
    db.add(new_temoignage)
    db.commit()
    db.refresh(new_temoignage)
    return new_temoignage


# ═══════════════════════════════════════════════════════════
#  TEMOIGNAGES - CRUD Complet
# ═══════════════════════════════════════════════════════════

@router.get(
    "/{temoignage_id}",
    response_model=TemoignageSchema,
    summary="Détail d'un témoignage",
    description="Récupère les détails d'un témoignage."
)
def get_temoignage(
    temoignage_id: int,
    db: Session = Depends(get_db),
):
    temoignage = db.query(Temoignage).filter(Temoignage.id == temoignage_id).first()
    if not temoignage:
        raise HTTPException(status_code=404, detail="Témoignage introuvable")
    return temoignage


@router.put(
    "/{temoignage_id}",
    response_model=TemoignageSchema,
    summary="Modifier un témoignage",
    description="[AUTH REQUISE] Modifie un témoignage (auteur ou admin)."
)
def update_temoignage(
    temoignage_id: int,
    tem_in: TemoignageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    temoignage = db.query(Temoignage).filter(Temoignage.id == temoignage_id).first()
    if not temoignage:
        raise HTTPException(status_code=404, detail="Témoignage introuvable")
    
    # Vérifier que l'utilisateur est l'auteur ou admin
    if temoignage.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Vous n'avez pas la permission de modifier ce témoignage."
        )
    
    temoignage.contenu = tem_in.contenu
    db.add(temoignage)
    db.commit()
    db.refresh(temoignage)
    return temoignage


@router.patch(
    "/{temoignage_id}",
    response_model=TemoignageSchema,
    summary="Modifier partiellement un témoignage",
    description="[AUTH REQUISE] Modifie partiellement un témoignage."
)
def patch_temoignage(
    temoignage_id: int,
    tem_in: TemoignageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    temoignage = db.query(Temoignage).filter(Temoignage.id == temoignage_id).first()
    if not temoignage:
        raise HTTPException(status_code=404, detail="Témoignage introuvable")
    
    # Vérifier que l'utilisateur est l'auteur ou admin
    if temoignage.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Vous n'avez pas la permission de modifier ce témoignage."
        )
    
    if tem_in.contenu is not None:
        temoignage.contenu = tem_in.contenu
    
    db.add(temoignage)
    db.commit()
    db.refresh(temoignage)
    return temoignage


@router.delete(
    "/{temoignage_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer un témoignage",
    description="[AUTH REQUISE] Supprime un témoignage (auteur ou admin)."
)
def delete_temoignage(
    temoignage_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    temoignage = db.query(Temoignage).filter(Temoignage.id == temoignage_id).first()
    if not temoignage:
        raise HTTPException(status_code=404, detail="Témoignage introuvable")
    
    # Vérifier que l'utilisateur est l'auteur ou admin
    if temoignage.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Vous n'avez pas la permission de supprimer ce témoignage."
        )
    
    db.delete(temoignage)
    db.commit()
    return None
