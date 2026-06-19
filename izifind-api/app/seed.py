import os
import sys
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import Base, SessionLocal, engine
from app.models.auth import Permission, Role, User
from app.models.objets import (
    Categorie,
    Commissariat,
    Couleur,
    ImageObjet,
    Marque,
    Objet,
    Promesse,
    SousCategorie,
    Statut,
    Temoignage,
    TitreObjet,
)
from app.security import get_password_hash


TABLES = [
    "users",
    "roles",
    "permissions",
    "commissariats",
    "categories",
    "sous_categories",
    "marques",
    "couleurs",
    "statuts",
    "titres_objets",
    "objets",
    "images_objets",
    "modifications_objets",
    "promesses",
    "temoignages",
]

CRUD_OPERATIONS = ["create", "read", "update", "delete"]


def get_or_create(db, model, defaults=None, **lookup):
    item = db.query(model).filter_by(**lookup).first()
    if item:
        return item
    values = {**lookup, **(defaults or {})}
    item = model(**values)
    db.add(item)
    db.flush()
    return item


def ensure_role(db, name, description):
    return get_or_create(db, Role, name=name, defaults={"description": description})


def ensure_user(db, *, username, email, password, phone=None, is_superuser=False, role=None, commissariat_id=None):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        user = User(
            username=username,
            email=email,
            phone=phone,
            hashed_password=get_password_hash(password),
            is_superuser=is_superuser,
            commissariat_id=commissariat_id,
        )
        db.add(user)
        db.flush()
    else:
        user.email = email
        user.phone = phone
        user.is_superuser = is_superuser
        user.commissariat_id = commissariat_id

    if role and role not in user.roles:
        user.roles.append(role)
    return user


def ensure_object(db, *, description, statut, days_ago, **values):
    objet = db.query(Objet).filter(Objet.description == description).first()
    payload = {
        "statut_id": statut.id,
        "date_action": date.today() - timedelta(days=days_ago),
        "is_public": True,
        **values,
    }
    if not objet:
        objet = Objet(description=description, **payload)
        db.add(objet)
        db.flush()
    else:
        for key, value in payload.items():
            setattr(objet, key, value)
    return objet


def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Seeding permissions...")
        for table in TABLES:
            for op in CRUD_OPERATIONS:
                get_or_create(
                    db,
                    Permission,
                    name=f"{op}_{table}",
                    defaults={"description": f"Permission to {op} {table}"},
                )
        db.flush()

        print("Seeding roles...")
        admin_role = ensure_role(db, "admin", "Administrateur systeme")
        commissaire_role = ensure_role(db, "commissaire", "Agent de police ou commissaire")
        declarant_role = ensure_role(db, "declarant", "Utilisateur declarant")
        db.flush()

        for permission in db.query(Permission).all():
            if permission not in admin_role.permissions:
                admin_role.permissions.append(permission)

        print("Seeding references...")
        statuts = {
            name: get_or_create(db, Statut, name=name, defaults={"description": f"Statut {name}"})
            for name in ["PERDU", "TRANSMIS", "TROUVE"]
        }

        categories = {
            "electronique": get_or_create(db, Categorie, name="Electronique", defaults={"description": "Telephones, ordinateurs, accessoires"}),
            "documents": get_or_create(db, Categorie, name="Documents", defaults={"description": "Passeports, CNI, cartes et dossiers"}),
            "accessoires": get_or_create(db, Categorie, name="Accessoires", defaults={"description": "Cles, sacs, bijoux et objets personnels"}),
        }
        sous_categories = {
            "telephone": get_or_create(db, SousCategorie, name="Telephone", categorie_id=categories["electronique"].id),
            "ordinateur": get_or_create(db, SousCategorie, name="Ordinateur", categorie_id=categories["electronique"].id),
            "portefeuille": get_or_create(db, SousCategorie, name="Portefeuille", categorie_id=categories["documents"].id),
            "cles": get_or_create(db, SousCategorie, name="Cles", categorie_id=categories["accessoires"].id),
        }
        marques = {
            "apple": get_or_create(db, Marque, name="Apple", souscategorie_id=sous_categories["telephone"].id),
            "samsung": get_or_create(db, Marque, name="Samsung", souscategorie_id=sous_categories["telephone"].id),
            "dell": get_or_create(db, Marque, name="Dell", souscategorie_id=sous_categories["ordinateur"].id),
        }
        couleurs = {
            name.lower(): get_or_create(db, Couleur, name=name)
            for name in ["Noir", "Blanc", "Rouge", "Bleu", "Gris", "Marron"]
        }
        for name, souscategorie in [
            ("Smartphone", sous_categories["telephone"]),
            ("Laptop", sous_categories["ordinateur"]),
            ("Piece d'identite", sous_categories["portefeuille"]),
            ("Trousseau", sous_categories["cles"]),
        ]:
            get_or_create(db, TitreObjet, name=name, type_id=souscategorie.id)

        print("Seeding commissariats...")
        commissariats = [
            ("Commissariat Central Paris", "1 Rue de Lutece, 75004 Paris", 48.8550, 2.3468),
            ("Commissariat Gare du Nord", "18 Rue de Dunkerque, 75010 Paris", 48.8808, 2.3553),
            ("Commissariat Montparnasse", "17 Boulevard de Vaugirard, 75015 Paris", 48.8412, 2.3208),
        ]
        stations = {}
        for name, adresse, latitude, longitude in commissariats:
            station = get_or_create(
                db,
                Commissariat,
                name=name,
                defaults={"adresse": adresse, "latitude": latitude, "longitude": longitude},
            )
            station.adresse = adresse
            station.latitude = latitude
            station.longitude = longitude
            stations[name] = station

        print("Seeding users...")
        admin_user = ensure_user(
            db,
            username="admin",
            email="admin@izifind.local",
            phone="+33100000001",
            password="admin",
            is_superuser=True,
            role=admin_role,
        )
        commissaire_user = ensure_user(
            db,
            username="commissaire1",
            email="commissaire1@izifind.local",
            phone="+33100000002",
            password="commissaire",
            role=commissaire_role,
            commissariat_id=stations["Commissariat Central Paris"].id,
        )
        declarant_user = ensure_user(
            db,
            username="declarant1",
            email="declarant1@izifind.local",
            phone="+33100000003",
            password="declarant",
            role=declarant_role,
        )

        print("Seeding public objects...")
        objects = [
            ensure_object(
                db,
                description="iPhone noir perdu pres de Chatelet",
                statut=statuts["PERDU"],
                days_ago=1,
                categorie_id=categories["electronique"].id,
                souscategorie_id=sous_categories["telephone"].id,
                marque_id=marques["apple"].id,
                couleur_id=couleurs["noir"].id,
                lieu="Chatelet, Paris",
                contact_phone=declarant_user.phone,
                contact_email=declarant_user.email,
                recompense="50",
            ),
            ensure_object(
                db,
                description="Portefeuille marron transmis au commissariat",
                statut=statuts["TRANSMIS"],
                days_ago=2,
                categorie_id=categories["documents"].id,
                souscategorie_id=sous_categories["portefeuille"].id,
                couleur_id=couleurs["marron"].id,
                lieu="Gare du Nord, Paris",
                contact_phone=commissaire_user.phone,
                contact_email=commissaire_user.email,
            ),
            ensure_object(
                db,
                description="Trousseau de cles retrouve et restitue",
                statut=statuts["TROUVE"],
                days_ago=4,
                categorie_id=categories["accessoires"].id,
                souscategorie_id=sous_categories["cles"].id,
                couleur_id=couleurs["gris"].id,
                lieu="Montparnasse, Paris",
                contact_phone=admin_user.phone,
                contact_email=admin_user.email,
            ),
            ensure_object(
                db,
                description="Ordinateur portable gris signale comme perdu",
                statut=statuts["PERDU"],
                days_ago=6,
                categorie_id=categories["electronique"].id,
                souscategorie_id=sous_categories["ordinateur"].id,
                marque_id=marques["dell"].id,
                couleur_id=couleurs["gris"].id,
                lieu="Bibliotheque Francois Mitterrand",
                contact_email=declarant_user.email,
                is_public=True,
            ),
        ]

        print("Seeding images, promises and testimonials...")
        for objet in objects:
            image_name = f"seed-object-{objet.id}"
            get_or_create(
                db,
                ImageObjet,
                objet_id=objet.id,
                name=image_name,
                defaults={
                    "image_url": f"https://placehold.co/800x600/F49517/151A31?text=IZIFIND+{objet.id}",
                    "caption": objet.description[:120],
                },
            )

        lost_object = objects[0]
        get_or_create(
            db,
            Promesse,
            objet_id=lost_object.id,
            defaults={"montant": 50.0, "pourcentage_frais": 10.0},
        )

        found_object = objects[2]
        testimony = db.query(Temoignage).filter(
            Temoignage.objet_id == found_object.id,
            Temoignage.user_id == declarant_user.id,
        ).first()
        if not testimony:
            db.add(
                Temoignage(
                    objet_id=found_object.id,
                    user_id=declarant_user.id,
                    contenu="Objet retrouve rapidement grace au commissariat et aux annonces.",
                    rating=5,
                )
            )
        else:
            testimony.contenu = "Objet retrouve rapidement grace au commissariat et aux annonces."
            testimony.rating = 5

        db.commit()
        print("Seed completed successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
