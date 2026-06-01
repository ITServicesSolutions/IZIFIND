import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
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
