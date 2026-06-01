import os
import shutil
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models.objets import ImageObjet, Objet
from ..schemas.objets import ImageObjetCreate, ImageObjet as ImageObjetSchema
from ..dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["Images"])

MEDIA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "media")


@router.get(
    "/images",
    response_model=List[ImageObjetSchema],
    summary="Lister les images",
    description="Renvoie toutes les images d'objets.",
)
def get_images(db: Session = Depends(get_db)):
    return db.query(ImageObjet).all()


@router.post(
    "/images",
    response_model=ImageObjetSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Uploader une image",
    description="Upload une image pour un objet. Envoyer en multipart/form-data.",
)
async def create_image(
    objet_id: int = Form(...),
    name: str = Form(...),
    caption: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Vérifier que l'objet parent existe
    objet = db.query(Objet).filter(Objet.id == objet_id).first()
    if not objet:
        raise HTTPException(status_code=404, detail="Objet introuvable")

    # Créer le dossier media s'il n'existe pas
    os.makedirs(os.path.join(MEDIA_DIR, "objet"), exist_ok=True)

    # Générer un nom de fichier unique
    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(MEDIA_DIR, "objet", unique_name)

    # Sauvegarder le fichier
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    image_url = f"/media/objet/{unique_name}"

    new_image = ImageObjet(
        objet_id=objet_id,
        name=name,
        image_url=image_url,
        caption=caption,
    )
    db.add(new_image)
    db.commit()
    db.refresh(new_image)
    return new_image


@router.post(
    "/images/json",
    response_model=ImageObjetSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Créer une image (JSON)",
    description="Crée une entrée image avec une URL externe (sans upload de fichier).",
)
def create_image_json(
    img_in: ImageObjetCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    objet = db.query(Objet).filter(Objet.id == img_in.objet_id).first()
    if not objet:
        raise HTTPException(status_code=404, detail="Objet introuvable")
    new_image = ImageObjet(**img_in.model_dump())
    db.add(new_image)
    db.commit()
    db.refresh(new_image)
    return new_image


@router.get(
    "/images/{image_id}",
    response_model=ImageObjetSchema,
    summary="Détail d'une image",
    description="Renvoie les informations d'une image par son identifiant.",
)
def get_image(image_id: int, db: Session = Depends(get_db)):
    img = db.query(ImageObjet).filter(ImageObjet.id == image_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image introuvable")
    return img


@router.delete(
    "/images/{image_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer une image",
    description="Supprime une image et son fichier associé.",
)
def delete_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    img = db.query(ImageObjet).filter(ImageObjet.id == image_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image introuvable")

    # Supprimer le fichier physique s'il est local
    if img.image_url and img.image_url.startswith("/media/"):
        file_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            img.image_url.lstrip("/"),
        )
        if os.path.exists(file_path):
            os.remove(file_path)

    db.delete(img)
    db.commit()
    return None
