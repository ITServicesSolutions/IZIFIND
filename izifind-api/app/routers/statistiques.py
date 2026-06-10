from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.objets import Objet, Commissariat

router = APIRouter(prefix="/api/statistiques", tags=["Statistiques"])

@router.get("/")
def get_statistics(
    db: Session = Depends(get_db),
    summary="Obtenir les statistiques globales de l'application IZIFIND",
    description="Obtenir les statistiques globales de l'application IZIFIND.",
):
    """
    Renvoie les statistiques globales de l'application IZIFIND.
    """
    # Compter les objets par statut (1: Perdu, 2: Trouvé)
    perdus = db.query(Objet).filter(Objet.statut_id == 1).count()
    trouves = db.query(Objet).filter(Objet.statut_id == 2).count()
    
    # Compter les commissariats (points de dépôt)
    postes = db.query(Commissariat).count()
    
    return {
        "perdus": perdus,
        "trouves": trouves,
        "postes": postes
    }