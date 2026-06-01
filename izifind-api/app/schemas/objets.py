from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date

# ── Categorie ──────────────────────────────────────────────

class CategorieBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategorieCreate(CategorieBase):
    pass

class CategorieUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class Categorie(CategorieBase):
    id: int
    class Config:
        from_attributes = True

# ── SousCategorie ──────────────────────────────────────────

class SousCategorieBase(BaseModel):
    name: str
    description: Optional[str] = None
    categorie_id: int

class SousCategorieCreate(SousCategorieBase):
    pass

class SousCategorieUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    categorie_id: Optional[int] = None

class SousCategorie(SousCategorieBase):
    id: int
    class Config:
        from_attributes = True

# ── Marque ─────────────────────────────────────────────────

class MarqueBase(BaseModel):
    name: str
    description: Optional[str] = None
    souscategorie_id: int

class MarqueCreate(MarqueBase):
    pass

class MarqueUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    souscategorie_id: Optional[int] = None

class Marque(MarqueBase):
    id: int
    class Config:
        from_attributes = True

# ── Couleur ────────────────────────────────────────────────

class CouleurBase(BaseModel):
    name: str
    description: Optional[str] = None

class CouleurCreate(CouleurBase):
    pass

class CouleurUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class Couleur(CouleurBase):
    id: int
    class Config:
        from_attributes = True

# ── Statut ─────────────────────────────────────────────────

class StatutBase(BaseModel):
    name: str
    description: Optional[str] = None

class StatutCreate(StatutBase):
    pass

class StatutUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class Statut(StatutBase):
    id: int
    class Config:
        from_attributes = True

# ── TitreObjet ─────────────────────────────────────────────

class TitreObjetBase(BaseModel):
    name: str
    description: Optional[str] = None
    type_id: int

class TitreObjetCreate(TitreObjetBase):
    pass

class TitreObjetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type_id: Optional[int] = None

class TitreObjet(TitreObjetBase):
    id: int
    class Config:
        from_attributes = True

# ── Objet ──────────────────────────────────────────────────

class ObjetBase(BaseModel):
    categorie_id: Optional[int] = None
    souscategorie_id: Optional[int] = None
    marque_id: Optional[int] = None
    couleur_id: Optional[int] = None
    statut_id: int
    description: str
    date_action: date
    lieu: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    recompense: Optional[str] = None
    is_public: bool = True

class ObjetCreate(ObjetBase):
    pass

class ObjetUpdate(BaseModel):
    categorie_id: Optional[int] = None
    souscategorie_id: Optional[int] = None
    marque_id: Optional[int] = None
    couleur_id: Optional[int] = None
    statut_id: Optional[int] = None
    description: Optional[str] = None
    date_action: Optional[date] = None
    lieu: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    recompense: Optional[str] = None
    is_public: Optional[bool] = None

class Objet(ObjetBase):
    id: int
    date: datetime
    class Config:
        from_attributes = True

# ── ImageObjet ─────────────────────────────────────────────

class ImageObjetBase(BaseModel):
    objet_id: int
    name: str
    image_url: str
    caption: Optional[str] = None

class ImageObjetCreate(ImageObjetBase):
    pass

class ImageObjet(ImageObjetBase):
    id: int
    date: datetime
    class Config:
        from_attributes = True

# ── ModifierObjet ──────────────────────────────────────────

class ModifierObjetBase(BaseModel):
    objet_id: int
    change: str
    confirm: bool = False

class ModifierObjetCreate(ModifierObjetBase):
    pass

class ModifierObjetUpdate(BaseModel):
    change: Optional[str] = None
    confirm: Optional[bool] = None

class ModifierObjet(ModifierObjetBase):
    id: int
    date: datetime
    class Config:
        from_attributes = True

# ── Commissariat ───────────────────────────────────────────

class CommissariatBase(BaseModel):
    name: str
    adresse: Optional[str] = None
    latitude: float
    longitude: float

class CommissariatCreate(CommissariatBase):
    pass

class CommissariatUpdate(BaseModel):
    name: Optional[str] = None
    adresse: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class Commissariat(CommissariatBase):
    id: int
    class Config:
        from_attributes = True

# ── Promesse ───────────────────────────────────────────────

class PromesseBase(BaseModel):
    objet_id: int
    montant: float
    pourcentage_frais: float = 10.0

class PromesseCreate(PromesseBase):
    pass

class PromesseUpdate(BaseModel):
    montant: Optional[float] = None
    pourcentage_frais: Optional[float] = None

class Promesse(PromesseBase):
    id: int
    date: datetime
    class Config:
        from_attributes = True

# ── Temoignage ─────────────────────────────────────────────

class TemoignageBase(BaseModel):
    objet_id: int
    contenu: str

class TemoignageCreate(TemoignageBase):
    pass

class TemoignageUpdate(BaseModel):
    contenu: Optional[str] = None

class Temoignage(TemoignageBase):
    id: int
    user_id: int
    date: datetime
    class Config:
        from_attributes = True
