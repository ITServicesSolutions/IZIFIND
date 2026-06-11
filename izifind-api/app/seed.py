import sys
import os

# Ensure app module can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import SessionLocal, engine, Base
from app.models.auth import Role, User, Permission
from app.models.objets import Statut, Categorie, SousCategorie, Couleur, Commissariat
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# List of tables to generate permissions for
TABLES = [
    "users", "roles", "permissions", "commissariats", "categories",
    "sous_categories", "marques", "couleurs", "statuts", "titres_objets",
    "objets", "images_objets", "modifications_objets", "promesses", "temoignages"
]

# CRUD operations
CRUD_OPERATIONS = ["create", "read", "update", "delete"]

def seed_data():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("Seeding permissions...")
    for table in TABLES:
        for op in CRUD_OPERATIONS:
            perm_name = f"{op}_{table}"
            existing_perm = db.query(Permission).filter(Permission.name == perm_name).first()
            if not existing_perm:
                perm = Permission(name=perm_name, description=f"Permission to {op} {table}")
                db.add(perm)
    db.commit()

    print("Seeding roles...")
    admin_role = db.query(Role).filter(Role.name == "admin").first()
    if not admin_role:
        admin_role = Role(name="admin", description="Administrateur système")
        db.add(admin_role)

    commissaire_role = db.query(Role).filter(Role.name == "commissaire").first()
    if not commissaire_role:
        commissaire_role = Role(name="commissaire", description="Agent de police ou commissaire")
        db.add(commissaire_role)
    db.commit()

    # Assign all permissions to admin role
    print("Assigning permissions to admin role...")
    all_permissions = db.query(Permission).all()
    admin_role = db.query(Role).filter(Role.name == "admin").first()
    if admin_role:
        for perm in all_permissions:
            if perm not in admin_role.permissions:
                admin_role.permissions.append(perm)
        db.commit()

    print("Seeding statuts...")
    for st in ["PERDU", "TRANSMIS", "TROUVE"]:
        if not db.query(Statut).filter(Statut.name == st).first():
            db.add(Statut(name=st, description=f"Statut automatique: {st}"))
    db.commit()

    print("Seeding categories...")
    cat_electro = db.query(Categorie).filter(Categorie.name == "Électronique").first()
    if not cat_electro:
        cat_electro = Categorie(name="Électronique", description="Téléphones, ordinateurs, etc.")
        db.add(cat_electro)
    
    cat_doc = db.query(Categorie).filter(Categorie.name == "Documents").first()
    if not cat_doc:
        cat_doc = Categorie(name="Documents", description="Passeports, CNI, Portefeuilles")
        db.add(cat_doc)
    db.commit()

    print("Seeding sous-categories...")
    if cat_electro and not db.query(SousCategorie).filter(SousCategorie.name == "Téléphone").first():
        db.add(SousCategorie(name="Téléphone", categorie_id=cat_electro.id))
    if cat_doc and not db.query(SousCategorie).filter(SousCategorie.name == "Portefeuille").first():
        db.add(SousCategorie(name="Portefeuille", categorie_id=cat_doc.id))
    db.commit()

    print("Seeding couleurs...")
    for couleur in ["Noir", "Blanc", "Rouge", "Bleu"]:
        if not db.query(Couleur).filter(Couleur.name == couleur).first():
            db.add(Couleur(name=couleur))
    db.commit()

    print("Seeding commissariats...")
    comm_central = db.query(Commissariat).filter(Commissariat.name == "Commissariat Central Paris").first()
    if not comm_central:
        comm_central = Commissariat(name="Commissariat Central Paris", adresse="1 Rue de Lutèce, 75004 Paris", latitude=48.8550, longitude=2.3468)
        db.add(comm_central)
        db.commit()
        db.refresh(comm_central)

    print("Seeding users...")
    admin_user = db.query(User).filter(User.username == "admin").first()
    if not admin_user:
        admin_user = User(
            username="admin", 
            email="admin@izifind.local", 
            hashed_password=pwd_context.hash("admin"),
            is_superuser=True
        )
        admin_user.roles.append(admin_role)
        db.add(admin_user)

    commissaire_user = db.query(User).filter(User.username == "commissaire1").first()
    if not commissaire_user:
        commissaire_user = User(
            username="commissaire1", 
            email="commissaire1@izifind.local", 
            hashed_password=pwd_context.hash("commissaire"),
            commissariat_id=comm_central.id if comm_central else None
        )
        commissaire_user.roles.append(commissaire_role)
        db.add(commissaire_user)
    db.commit()

    print("Seed completed successfully!")
    db.close()

if __name__ == "__main__":
    seed_data()
