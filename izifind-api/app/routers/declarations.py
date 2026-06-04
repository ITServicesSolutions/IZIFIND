import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from ..database import get_db
from ..models.objets import Objet, Statut, Promesse, ImageObjet, Commissariat
from ..schemas.objets import Objet as ObjetSchema, Commissariat as CommissariatSchema
from ..dependencies import get_current_user
from ..utils.geo import calculate_distance

router = APIRouter(prefix="/api/declarations", tags=["Déclarations"])
MEDIA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "media")

def get_or_create_statut(db: Session, name: str) -> Statut:
    statut = db.query(Statut).filter(Statut.name.ilike(name)).first()
    if not statut:
        statut = Statut(name=name.upper(), description=f"Statut automatique: {name}")
        db.add(statut)
        db.commit()
        db.refresh(statut)
    return statut

@router.post(
    "/perdu",
    response_model=ObjetSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Déclarer un objet perdu",
    description="[AUTH REQUISE] Crée un objet avec le statut PERDU, requiert 3 photos. Gère la promesse optionnelle."
)
async def declarer_perdu(
    description: str = Form(...),
    date_action: date = Form(...),
    lieu: Optional[str] = Form(None),
    contact_phone: Optional[str] = Form(None),
    contact_email: Optional[str] = Form(None),
    categorie_id: Optional[int] = Form(None),
    souscategorie_id: Optional[int] = Form(None),
    montant_promesse: Optional[float] = Form(None),
    photo_profil: UploadFile = File(...),
    photo_face: UploadFile = File(...),
    photo_derriere: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    statut_perdu = get_or_create_statut(db, "PERDU")

    new_objet = Objet(
        description=description,
        date_action=date_action,
        lieu=lieu,
        contact_phone=contact_phone,
        contact_email=contact_email,
        categorie_id=categorie_id,
        souscategorie_id=souscategorie_id,
        statut_id=statut_perdu.id,
        is_public=False  # Les objets perdus ne sont peut-être pas publics par défaut, à voir selon métier
    )
    db.add(new_objet)
    db.commit()
    db.refresh(new_objet)

    # Sauvegarde des 3 photos
    os.makedirs(os.path.join(MEDIA_DIR, "objet"), exist_ok=True)
    for photo, caption in [(photo_profil, "Profil"), (photo_face, "Face"), (photo_derriere, "Derrière")]:
        ext = os.path.splitext(photo.filename)[1] if photo.filename else ".jpg"
        unique_name = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(MEDIA_DIR, "objet", unique_name)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        
        image_obj = ImageObjet(
            objet_id=new_objet.id,
            name=f"Photo {caption}",
            image_url=f"/media/objet/{unique_name}",
            caption=caption
        )
        db.add(image_obj)
    db.commit()

    # Si une promesse est attachée
    if montant_promesse and montant_promesse > 0:
        pourcentage_frais = 10.0 # Configurable ou issu des settings
        promesse = Promesse(
            objet_id=new_objet.id,
            montant=montant_promesse,
            pourcentage_frais=pourcentage_frais
        )
        db.add(promesse)
        db.commit()

    db.refresh(new_objet)
    return new_objet


@router.post(
    "/trouve",
    status_code=status.HTTP_201_CREATED,
    summary="Déclarer un objet trouvé",
    description="[ANONYME] Permet l'upload de 3 photos. Passe le statut en TRANSMIS et retourne le commissariat recommandé."
)
async def declarer_trouve(
    description: str = Form(...),
    date_action: date = Form(...),
    lieu: Optional[str] = Form(None),
    contact_phone: Optional[str] = Form(None),
    contact_email: Optional[str] = Form(None),
    categorie_id: Optional[int] = Form(None),
    souscategorie_id: Optional[int] = Form(None),
    latitude_user: float = Form(...),
    longitude_user: float = Form(...),
    photo_profil: UploadFile = File(...),
    photo_face: UploadFile = File(...),
    photo_derriere: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    statut_transmis = get_or_create_statut(db, "TRANSMIS")

    # 1. Création de l'objet
    new_objet = Objet(
        description=description,
        date_action=date_action,
        lieu=lieu,
        contact_phone=contact_phone,
        contact_email=contact_email,
        categorie_id=categorie_id,
        souscategorie_id=souscategorie_id,
        statut_id=statut_transmis.id,
        is_public=False
    )
    db.add(new_objet)
    db.commit()
    db.refresh(new_objet)

    # 2. Sauvegarde des 3 photos
    os.makedirs(os.path.join(MEDIA_DIR, "objet"), exist_ok=True)
    for photo, caption in [(photo_profil, "Profil"), (photo_face, "Face"), (photo_derriere, "Derrière")]:
        ext = os.path.splitext(photo.filename)[1] if photo.filename else ".jpg"
        unique_name = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(MEDIA_DIR, "objet", unique_name)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        
        image_obj = ImageObjet(
            objet_id=new_objet.id,
            name=f"Photo {caption}",
            image_url=f"/media/objet/{unique_name}",
            caption=caption
        )
        db.add(image_obj)
    db.commit()

    # 3. Matching MOCK & Recommandation Commissariat
    # MOCK: On considère qu'il y a toujours un match pour l'instant
    commissariats = db.query(Commissariat).all()
    if not commissariats:
        recommandation = None
    else:
        # Trouver le commissariat le plus proche de (latitude_user, longitude_user)
        plus_proche = None
        min_dist = float('inf')
        for c in commissariats:
            dist = calculate_distance(latitude_user, longitude_user, c.latitude, c.longitude)
            if dist < min_dist:
                min_dist = dist
                plus_proche = c
        recommandation = plus_proche

    return {
        "message": "Objet trouvé déclaré avec succès. Statut: TRANSMIS.",
        "objet": new_objet,
        "commissariat_recommande": recommandation
    }


# ═══════════════════════════════════════════════════════════
#  DECLARATIONS - CRUD Complet
# ═══════════════════════════════════════════════════════════

@router.get(
    "/",
    response_model=List[ObjetSchema],
    summary="Lister les déclarations",
    description="[AUTH REQUISE] Lister les déclarations de l'utilisateur avec filtres optionnels."
)
def list_declarations(
    skip: int = 0,
    limit: int = 100,
    statut_id: Optional[int] = None,
    only_mine: bool = True,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Liste les déclarations d'objets perdus.
    Si only_mine=True, retourne uniquement les déclarations de l'utilisateur.
    """
    query = db.query(Objet)
    
    # Filtrer par statut PERDU ou TRANSMIS
    statut_perdu = db.query(Statut).filter(Statut.name.ilike("PERDU")).first()
    statut_transmis = db.query(Statut).filter(Statut.name.ilike("TRANSMIS")).first()
    
    statut_ids = []
    if statut_perdu:
        statut_ids.append(statut_perdu.id)
    if statut_transmis:
        statut_ids.append(statut_transmis.id)
    
    if statut_ids:
        query = query.filter(Objet.statut_id.in_(statut_ids))
    
    if statut_id:
        query = query.filter(Objet.statut_id == statut_id)
    
    return query.offset(skip).limit(limit).all()


@router.get(
    "/{declaration_id}",
    response_model=ObjetSchema,
    summary="Détail d'une déclaration",
    description="Récupère les détails d'une déclaration d'objet."
)
def get_declaration(
    declaration_id: int,
    db: Session = Depends(get_db),
):
    objet = db.query(Objet).filter(Objet.id == declaration_id).first()
    if not objet:
        raise HTTPException(status_code=404, detail="Déclaration introuvable")
    return objet


@router.put(
    "/{declaration_id}",
    response_model=ObjetSchema,
    summary="Modifier une déclaration",
    description="[AUTH REQUISE] Modifie une déclaration (propriétaire ou admin)."
)
def update_declaration(
    declaration_id: int,
    description: Optional[str] = Form(None),
    lieu: Optional[str] = Form(None),
    contact_phone: Optional[str] = Form(None),
    contact_email: Optional[str] = Form(None),
    recompense: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Modifie une déclaration existante.
    Note: Cette fonction simple ne gère que les champs textuels.
    """
    objet = db.query(Objet).filter(Objet.id == declaration_id).first()
    if not objet:
        raise HTTPException(status_code=404, detail="Déclaration introuvable")
    
    # Mise à jour des champs fournis
    if description:
        objet.description = description
    if lieu is not None:
        objet.lieu = lieu
    if contact_phone is not None:
        objet.contact_phone = contact_phone
    if contact_email is not None:
        objet.contact_email = contact_email
    if recompense is not None:
        objet.recompense = recompense
    
    db.add(objet)
    db.commit()
    db.refresh(objet)
    return objet


@router.delete(
    "/{declaration_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer une déclaration",
    description="[AUTH REQUISE] Supprime une déclaration et toutes ses données associées."
)
def delete_declaration(
    declaration_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    objet = db.query(Objet).filter(Objet.id == declaration_id).first()
    if not objet:
        raise HTTPException(status_code=404, detail="Déclaration introuvable")
    
    # Supprimer les images associées
    images = db.query(ImageObjet).filter(ImageObjet.objet_id == objet.id).all()
    for img in images:
        # Essayer de supprimer le fichier du disque
        if img.image_url.startswith("/media/"):
            file_path = os.path.join(MEDIA_DIR, img.image_url.lstrip("/media/"))
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception:
                pass
        db.delete(img)
    
    # Supprimer les promesses
    promesses = db.query(Promesse).filter(Promesse.objet_id == objet.id).all()
    for p in promesses:
        db.delete(p)
    
    # Supprimer l'objet
    db.delete(objet)
    db.commit()
    return None
