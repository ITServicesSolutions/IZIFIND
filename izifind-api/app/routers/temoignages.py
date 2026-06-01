from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.objets import Temoignage, Objet, Statut
from ..schemas.objets import TemoignageCreate, Temoignage as TemoignageSchema
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
