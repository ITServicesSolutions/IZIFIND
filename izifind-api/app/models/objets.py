from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Date, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class Commissariat(Base):
    __tablename__ = "commissariats"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    adresse = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    users = relationship("User", back_populates="commissariat")

class Categorie(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)

    sous_categories = relationship("SousCategorie", back_populates="categorie")
    objets = relationship("Objet", back_populates="categorie")

class SousCategorie(Base):
    __tablename__ = "sous_categories"

    id = Column(Integer, primary_key=True, index=True)
    categorie_id = Column(Integer, ForeignKey("categories.id"))
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)

    categorie = relationship("Categorie", back_populates="sous_categories")
    marques = relationship("Marque", back_populates="souscategorie")
    objets = relationship("Objet", back_populates="souscategorie")
    titres = relationship("TitreObjet", back_populates="type")

class Marque(Base):
    __tablename__ = "marques"

    id = Column(Integer, primary_key=True, index=True)
    souscategorie_id = Column(Integer, ForeignKey("sous_categories.id"))
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)

    souscategorie = relationship("SousCategorie", back_populates="marques")
    objets = relationship("Objet", back_populates="marque")

class Couleur(Base):
    __tablename__ = "couleurs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)

    objets = relationship("Objet", back_populates="couleur")

class Statut(Base):
    __tablename__ = "statuts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)

    objets = relationship("Objet", back_populates="statut")

class TitreObjet(Base):
    __tablename__ = "titres_objets"

    id = Column(Integer, primary_key=True, index=True)
    type_id = Column(Integer, ForeignKey("sous_categories.id"))
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)

    type = relationship("SousCategorie", back_populates="titres")

class Objet(Base):
    __tablename__ = "objets"

    id = Column(Integer, primary_key=True, index=True)
    categorie_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    souscategorie_id = Column(Integer, ForeignKey("sous_categories.id"), nullable=True)
    marque_id = Column(Integer, ForeignKey("marques.id"), nullable=True)
    couleur_id = Column(Integer, ForeignKey("couleurs.id"), nullable=True)
    statut_id = Column(Integer, ForeignKey("statuts.id"))
    
    description = Column(Text, nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now())
    date_action = Column(Date, nullable=False)
    lieu = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    contact_email = Column(String(255), nullable=True)
    recompense = Column(Text, nullable=True)
    is_public = Column(Boolean, default=True)

    categorie = relationship("Categorie", back_populates="objets")
    souscategorie = relationship("SousCategorie", back_populates="objets")
    marque = relationship("Marque", back_populates="objets")
    couleur = relationship("Couleur", back_populates="objets")
    statut = relationship("Statut", back_populates="objets")
    
    images = relationship("ImageObjet", back_populates="objet", cascade="all, delete-orphan")
    modifications = relationship("ModifierObjet", back_populates="objet", cascade="all, delete-orphan")
    promesse = relationship("Promesse", back_populates="objet", uselist=False, cascade="all, delete-orphan")
    temoignages = relationship("Temoignage", back_populates="objet", cascade="all, delete-orphan")

class ImageObjet(Base):
    __tablename__ = "images_objets"

    id = Column(Integer, primary_key=True, index=True)
    objet_id = Column(Integer, ForeignKey("objets.id"))
    name = Column(String(100), nullable=False)
    image_url = Column(String(255), nullable=False) # Changed from ImageField to String URL
    caption = Column(Text, nullable=True)
    date = Column(DateTime(timezone=True), server_default=func.now())

    objet = relationship("Objet", back_populates="images")

class ModifierObjet(Base):
    __tablename__ = "modifications_objets"

    id = Column(Integer, primary_key=True, index=True)
    objet_id = Column(Integer, ForeignKey("objets.id"))
    change = Column(Text, nullable=False)
    confirm = Column(Boolean, default=False)
    date = Column(DateTime(timezone=True), server_default=func.now())

    objet = relationship("Objet", back_populates="modifications")

class Promesse(Base):
    __tablename__ = "promesses"

    id = Column(Integer, primary_key=True, index=True)
    objet_id = Column(Integer, ForeignKey("objets.id"), unique=True)
    montant = Column(Float, nullable=False)
    pourcentage_frais = Column(Float, default=10.0) # 10% par défaut
    date = Column(DateTime(timezone=True), server_default=func.now())

    objet = relationship("Objet", back_populates="promesse")

class Temoignage(Base):
    __tablename__ = "temoignages"

    id = Column(Integer, primary_key=True, index=True)
    objet_id = Column(Integer, ForeignKey("objets.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    contenu = Column(Text, nullable=False)
    rating = Column(Integer, nullable=False, default=5)
    date = Column(DateTime(timezone=True), server_default=func.now())

    objet = relationship("Objet", back_populates="temoignages")
    user = relationship("User", back_populates="temoignages")
