from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.objets import Marque, Couleur, Statut, TitreObjet, SousCategorie
from ..schemas.objets import (
    MarqueCreate, MarqueUpdate, Marque as MarqueSchema,
    CouleurCreate, CouleurUpdate, Couleur as CouleurSchema,
    StatutCreate, StatutUpdate, Statut as StatutSchema,
    TitreObjetCreate, TitreObjetUpdate, TitreObjet as TitreObjetSchema,
)
from ..dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["Référentiel"])

# ═══════════════════════════════════════════════════════════
#  MARQUES
# ═══════════════════════════════════════════════════════════

@router.get(
    "/marques",
    response_model=List[MarqueSchema],
    summary="Lister les marques",
    description="Renvoie toutes les marques.",
)
def get_marques(db: Session = Depends(get_db)):
    return db.query(Marque).all()


@router.post(
    "/marques",
    response_model=MarqueSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Créer une marque",
    description="Crée une nouvelle marque rattachée à une sous-catégorie.",
)
def create_marque(
    m_in: MarqueCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    parent = db.query(SousCategorie).filter(SousCategorie.id == m_in.souscategorie_id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Sous-catégorie parente introuvable")
    new_m = Marque(**m_in.model_dump())
    db.add(new_m)
    db.commit()
    db.refresh(new_m)
    return new_m


@router.get(
    "/marques/par-souscategorie/{souscategorie_id}",
    response_model=List[MarqueSchema],
    summary="Marques par sous-catégorie",
    description="Renvoie les marques rattachées à une sous-catégorie donnée (filtrage dynamique).",
)
def get_marques_by_souscategorie(souscategorie_id: int, db: Session = Depends(get_db)):
    return db.query(Marque).filter(Marque.souscategorie_id == souscategorie_id).all()


@router.get(
    "/marques/{marque_id}",
    response_model=MarqueSchema,
    summary="Détail d'une marque",
    description="Renvoie les informations d'une marque par son identifiant.",
)
def get_marque(marque_id: int, db: Session = Depends(get_db)):
    m = db.query(Marque).filter(Marque.id == marque_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Marque introuvable")
    return m


@router.put(
    "/marques/{marque_id}",
    response_model=MarqueSchema,
    summary="Modifier une marque (complet)",
    description="Remplace entièrement les champs d'une marque.",
)
def update_marque(
    marque_id: int,
    m_in: MarqueCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    m = db.query(Marque).filter(Marque.id == marque_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Marque introuvable")
    for key, value in m_in.model_dump().items():
        setattr(m, key, value)
    db.commit()
    db.refresh(m)
    return m


@router.patch(
    "/marques/{marque_id}",
    response_model=MarqueSchema,
    summary="Modifier une marque (partiel)",
    description="Met à jour uniquement les champs fournis.",
)
def patch_marque(
    marque_id: int,
    m_in: MarqueUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    m = db.query(Marque).filter(Marque.id == marque_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Marque introuvable")
    for key, value in m_in.model_dump(exclude_unset=True).items():
        setattr(m, key, value)
    db.commit()
    db.refresh(m)
    return m


@router.delete(
    "/marques/{marque_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer une marque",
    description="Supprime une marque.",
)
def delete_marque(
    marque_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    m = db.query(Marque).filter(Marque.id == marque_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Marque introuvable")
    db.delete(m)
    db.commit()
    return None


# ═══════════════════════════════════════════════════════════
#  COULEURS
# ═══════════════════════════════════════════════════════════

@router.get(
    "/couleurs",
    response_model=List[CouleurSchema],
    summary="Lister les couleurs",
    description="Renvoie toutes les couleurs.",
)
def get_couleurs(db: Session = Depends(get_db)):
    return db.query(Couleur).all()


@router.post(
    "/couleurs",
    response_model=CouleurSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Créer une couleur",
    description="Crée une nouvelle couleur.",
)
def create_couleur(
    c_in: CouleurCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    new_c = Couleur(**c_in.model_dump())
    db.add(new_c)
    db.commit()
    db.refresh(new_c)
    return new_c


@router.get(
    "/couleurs/{couleur_id}",
    response_model=CouleurSchema,
    summary="Détail d'une couleur",
    description="Renvoie les informations d'une couleur par son identifiant.",
)
def get_couleur(couleur_id: int, db: Session = Depends(get_db)):
    c = db.query(Couleur).filter(Couleur.id == couleur_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Couleur introuvable")
    return c


@router.put(
    "/couleurs/{couleur_id}",
    response_model=CouleurSchema,
    summary="Modifier une couleur (complet)",
    description="Remplace entièrement les champs d'une couleur.",
)
def update_couleur(
    couleur_id: int,
    c_in: CouleurCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    c = db.query(Couleur).filter(Couleur.id == couleur_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Couleur introuvable")
    for key, value in c_in.model_dump().items():
        setattr(c, key, value)
    db.commit()
    db.refresh(c)
    return c


@router.patch(
    "/couleurs/{couleur_id}",
    response_model=CouleurSchema,
    summary="Modifier une couleur (partiel)",
    description="Met à jour uniquement les champs fournis.",
)
def patch_couleur(
    couleur_id: int,
    c_in: CouleurUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    c = db.query(Couleur).filter(Couleur.id == couleur_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Couleur introuvable")
    for key, value in c_in.model_dump(exclude_unset=True).items():
        setattr(c, key, value)
    db.commit()
    db.refresh(c)
    return c


@router.delete(
    "/couleurs/{couleur_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer une couleur",
    description="Supprime une couleur.",
)
def delete_couleur(
    couleur_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    c = db.query(Couleur).filter(Couleur.id == couleur_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Couleur introuvable")
    db.delete(c)
    db.commit()
    return None


# ═══════════════════════════════════════════════════════════
#  STATUTS
# ═══════════════════════════════════════════════════════════

@router.get(
    "/statuts",
    response_model=List[StatutSchema],
    summary="Lister les statuts",
    description="Renvoie tous les statuts (Perdu, Trouvé, Volé…).",
)
def get_statuts(db: Session = Depends(get_db)):
    return db.query(Statut).all()


@router.post(
    "/statuts",
    response_model=StatutSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un statut",
    description="Crée un nouveau statut.",
)
def create_statut(
    s_in: StatutCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    new_s = Statut(**s_in.model_dump())
    db.add(new_s)
    db.commit()
    db.refresh(new_s)
    return new_s


@router.get(
    "/statuts/{statut_id}",
    response_model=StatutSchema,
    summary="Détail d'un statut",
    description="Renvoie les informations d'un statut par son identifiant.",
)
def get_statut(statut_id: int, db: Session = Depends(get_db)):
    s = db.query(Statut).filter(Statut.id == statut_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Statut introuvable")
    return s


@router.put(
    "/statuts/{statut_id}",
    response_model=StatutSchema,
    summary="Modifier un statut (complet)",
    description="Remplace entièrement les champs d'un statut.",
)
def update_statut(
    statut_id: int,
    s_in: StatutCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    s = db.query(Statut).filter(Statut.id == statut_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Statut introuvable")
    for key, value in s_in.model_dump().items():
        setattr(s, key, value)
    db.commit()
    db.refresh(s)
    return s


@router.patch(
    "/statuts/{statut_id}",
    response_model=StatutSchema,
    summary="Modifier un statut (partiel)",
    description="Met à jour uniquement les champs fournis.",
)
def patch_statut(
    statut_id: int,
    s_in: StatutUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    s = db.query(Statut).filter(Statut.id == statut_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Statut introuvable")
    for key, value in s_in.model_dump(exclude_unset=True).items():
        setattr(s, key, value)
    db.commit()
    db.refresh(s)
    return s


@router.delete(
    "/statuts/{statut_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer un statut",
    description="Supprime un statut.",
)
def delete_statut(
    statut_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    s = db.query(Statut).filter(Statut.id == statut_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Statut introuvable")
    db.delete(s)
    db.commit()
    return None


# ═══════════════════════════════════════════════════════════
#  TITRES OBJETS
# ═══════════════════════════════════════════════════════════

@router.get(
    "/titres-objets",
    response_model=List[TitreObjetSchema],
    summary="Lister les titres d'objets",
    description="Renvoie tous les titres d'objets.",
)
def get_titres_objets(db: Session = Depends(get_db)):
    return db.query(TitreObjet).all()


@router.post(
    "/titres-objets",
    response_model=TitreObjetSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un titre d'objet",
    description="Crée un nouveau titre d'objet rattaché à une sous-catégorie.",
)
def create_titre_objet(
    t_in: TitreObjetCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    parent = db.query(SousCategorie).filter(SousCategorie.id == t_in.type_id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Sous-catégorie (type) introuvable")
    new_t = TitreObjet(**t_in.model_dump())
    db.add(new_t)
    db.commit()
    db.refresh(new_t)
    return new_t


@router.get(
    "/titres-objets/{titre_id}",
    response_model=TitreObjetSchema,
    summary="Détail d'un titre d'objet",
    description="Renvoie les informations d'un titre d'objet par son identifiant.",
)
def get_titre_objet(titre_id: int, db: Session = Depends(get_db)):
    t = db.query(TitreObjet).filter(TitreObjet.id == titre_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Titre d'objet introuvable")
    return t


@router.put(
    "/titres-objets/{titre_id}",
    response_model=TitreObjetSchema,
    summary="Modifier un titre d'objet (complet)",
    description="Remplace entièrement les champs d'un titre d'objet.",
)
def update_titre_objet(
    titre_id: int,
    t_in: TitreObjetCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    t = db.query(TitreObjet).filter(TitreObjet.id == titre_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Titre d'objet introuvable")
    for key, value in t_in.model_dump().items():
        setattr(t, key, value)
    db.commit()
    db.refresh(t)
    return t


@router.patch(
    "/titres-objets/{titre_id}",
    response_model=TitreObjetSchema,
    summary="Modifier un titre d'objet (partiel)",
    description="Met à jour uniquement les champs fournis.",
)
def patch_titre_objet(
    titre_id: int,
    t_in: TitreObjetUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    t = db.query(TitreObjet).filter(TitreObjet.id == titre_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Titre d'objet introuvable")
    for key, value in t_in.model_dump(exclude_unset=True).items():
        setattr(t, key, value)
    db.commit()
    db.refresh(t)
    return t


@router.delete(
    "/titres-objets/{titre_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer un titre d'objet",
    description="Supprime un titre d'objet.",
)
def delete_titre_objet(
    titre_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    t = db.query(TitreObjet).filter(TitreObjet.id == titre_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Titre d'objet introuvable")
    db.delete(t)
    db.commit()
    return None
