from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.objets import Commissariat, Objet, Statut
from ..schemas.objets import CommissariatCreate, CommissariatUpdate, Commissariat as CommissariatSchema, Objet as ObjetSchema
from ..dependencies import get_current_user, RoleChecker

router = APIRouter(prefix="/api/commissariats", tags=["Commissariats"])

# Roles requirements
require_admin = Depends(RoleChecker(["admin"]))
require_commissaire = Depends(RoleChecker(["commissaire", "admin"]))


@router.get(
    "/",
    response_model=List[CommissariatSchema],
    summary="Lister les commissariats",
    description="Renvoie tous les commissariats enregistrés."
)
def get_commissariats(db: Session = Depends(get_db)):
    return db.query(Commissariat).all()


@router.post(
    "/",
    response_model=CommissariatSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un commissariat",
    description="[ADMIN] Crée un nouveau commissariat."
)
def create_commissariat(
    comm_in: CommissariatCreate,
    db: Session = Depends(get_db),
    current_user=require_admin
):
    new_comm = Commissariat(**comm_in.model_dump())
    db.add(new_comm)
    db.commit()
    db.refresh(new_comm)
    return new_comm


@router.get(
    "/{comm_id}",
    response_model=CommissariatSchema,
    summary="Détail d'un commissariat"
)
def get_commissariat(comm_id: int, db: Session = Depends(get_db)):
    comm = db.query(Commissariat).filter(Commissariat.id == comm_id).first()
    if not comm:
        raise HTTPException(status_code=404, detail="Commissariat introuvable")
    return comm


@router.put(
    "/{comm_id}",
    response_model=CommissariatSchema,
    summary="Modifier un commissariat",
    description="[ADMIN] Modifie un commissariat."
)
def update_commissariat(
    comm_id: int,
    comm_in: CommissariatUpdate,
    db: Session = Depends(get_db),
    current_user=require_admin
):
    comm = db.query(Commissariat).filter(Commissariat.id == comm_id).first()
    if not comm:
        raise HTTPException(status_code=404, detail="Commissariat introuvable")
    for key, value in comm_in.model_dump(exclude_unset=True).items():
        setattr(comm, key, value)
    db.commit()
    db.refresh(comm)
    return comm


@router.delete(
    "/{comm_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer un commissariat",
    description="[ADMIN] Supprime un commissariat."
)
def delete_commissariat(
    comm_id: int,
    db: Session = Depends(get_db),
    current_user=require_admin
):
    comm = db.query(Commissariat).filter(Commissariat.id == comm_id).first()
    if not comm:
        raise HTTPException(status_code=404, detail="Commissariat introuvable")
    db.delete(comm)
    db.commit()
    return None


@router.put(
    "/objets/{objet_id}/valider",
    response_model=ObjetSchema,
    summary="Valider un objet trouvé",
    description="[COMMISSAIRE] Valide qu'un objet transmis est bien au commissariat. Passe l'objet en statut TROUVE et le rend public."
)
def valider_objet(
    objet_id: int,
    db: Session = Depends(get_db),
    current_user=require_commissaire
):
    objet = db.query(Objet).filter(Objet.id == objet_id).first()
    if not objet:
        raise HTTPException(status_code=404, detail="Objet introuvable")

    # On vérifie que le statut "TROUVE" existe
    statut_trouve = db.query(Statut).filter(Statut.name.ilike("TROUVE")).first()
    if not statut_trouve:
        # Création à la volée si manquant
        statut_trouve = Statut(name="TROUVE", description="Objet validé au commissariat")
        db.add(statut_trouve)
        db.commit()
        db.refresh(statut_trouve)
    
    # Check if object is already "TROUVE"
    if objet.statut_id == statut_trouve.id:
        raise HTTPException(status_code=400, detail="Cet objet est déjà validé comme trouvé.")

    # Validation
    objet.statut_id = statut_trouve.id
    objet.is_public = True

    db.commit()
    db.refresh(objet)
    
    return objet
