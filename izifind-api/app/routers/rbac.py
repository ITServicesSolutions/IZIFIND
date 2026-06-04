from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.auth import User, Role, Permission
from ..schemas.auth import RoleCreate, Role as RoleSchema, PermissionCreate, Permission as PermissionSchema, AssignRoleRequest
from ..dependencies import get_current_active_user, RoleChecker, PermissionChecker

router = APIRouter(prefix="/api/rbac", tags=["RBAC"])

# We define a basic role requirement: e.g. "admin" role needed for these actions.
# You can customize this or use permissions like "manage_roles" instead.
require_admin = Depends(RoleChecker(["admin"]))

@router.get(
    "/roles", 
    response_model=List[RoleSchema],
    summary="Lister les rôles",
    description="Renvoie la liste de tous les rôles configurés (nécessite le rôle admin)."
)
def get_roles(db: Session = Depends(get_db), current_user: User = require_admin):
    return db.query(Role).all()

@router.post(
    "/roles", 
    response_model=RoleSchema,
    summary="Créer un rôle",
    description="Crée un nouveau rôle."
)
def create_role(role_in: RoleCreate, db: Session = Depends(get_db), current_user: User = require_admin):
    role = db.query(Role).filter(Role.name == role_in.name).first()
    if role:
        raise HTTPException(status_code=400, detail="Role already exists")
    
    new_role = Role(name=role_in.name, description=role_in.description)
    
    for perm_id in role_in.permission_ids:
        perm = db.query(Permission).filter(Permission.id == perm_id).first()
        if perm:
            new_role.permissions.append(perm)

    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    return new_role

@router.get(
    "/permissions", 
    response_model=List[PermissionSchema],
    summary="Lister les permissions",
    description="Renvoie la liste de toutes les permissions configurées."
)
def get_permissions(db: Session = Depends(get_db), current_user: User = require_admin):
    return db.query(Permission).all()

@router.post(
    "/permissions", 
    response_model=PermissionSchema,
    summary="Créer une permission",
    description="Crée une nouvelle permission."
)
def create_permission(perm_in: PermissionCreate, db: Session = Depends(get_db), current_user: User = require_admin):
    perm = db.query(Permission).filter(Permission.name == perm_in.name).first()
    if perm:
        raise HTTPException(status_code=400, detail="Permission already exists")
    
    new_perm = Permission(name=perm_in.name, description=perm_in.description)
    db.add(new_perm)
    db.commit()
    db.refresh(new_perm)
    return new_perm

@router.post(
    "/users/{user_id}/roles", 
    summary="Assigner un rôle",
    description="Assigne un rôle à un utilisateur spécifique."
)
def assign_role(user_id: int, req: AssignRoleRequest, db: Session = Depends(get_db), current_user: User = require_admin):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    role = db.query(Role).filter(Role.id == req.role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
        
    if role not in user.roles:
        user.roles.append(role)
        db.commit()
    return {"message": f"Role '{role.name}' assigned to user '{user.username}'"}


# ═══════════════════════════════════════════════════════════
#  ROLES - CRUD Complet
# ═══════════════════════════════════════════════════════════

@router.get(
    "/roles/{role_id}",
    response_model=RoleSchema,
    summary="Détail d'un rôle",
    description="Renvoie les informations complètes d'un rôle."
)
def get_role(role_id: int, db: Session = Depends(get_db), current_user: User = require_admin):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


@router.put(
    "/roles/{role_id}",
    response_model=RoleSchema,
    summary="Modifier un rôle",
    description="Met à jour les informations d'un rôle."
)
def update_role(role_id: int, role_in: RoleCreate, db: Session = Depends(get_db), current_user: User = require_admin):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Vérifier que le nom ne duplique pas un autre rôle
    existing_role = db.query(Role).filter(
        Role.name == role_in.name,
        Role.id != role_id
    ).first()
    if existing_role:
        raise HTTPException(status_code=400, detail="Role with this name already exists")
    
    role.name = role_in.name
    role.description = role_in.description
    
    # Mettre à jour les permissions
    role.permissions.clear()
    for perm_id in role_in.permission_ids:
        perm = db.query(Permission).filter(Permission.id == perm_id).first()
        if perm:
            role.permissions.append(perm)
    
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


@router.delete(
    "/roles/{role_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer un rôle",
    description="Supprime un rôle (déassigne automatiquement des utilisateurs)."
)
def delete_role(role_id: int, db: Session = Depends(get_db), current_user: User = require_admin):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    db.delete(role)
    db.commit()
    return None


@router.post(
    "/roles/{role_id}/permissions",
    summary="Ajouter une permission à un rôle",
    description="Ajoute une permission existante à un rôle."
)
def add_permission_to_role(
    role_id: int,
    permission_id: int,
    db: Session = Depends(get_db),
    current_user: User = require_admin
):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    
    if permission not in role.permissions:
        role.permissions.append(permission)
        db.commit()
    
    return {"message": f"Permission '{permission.name}' added to role '{role.name}'"}


@router.delete(
    "/roles/{role_id}/permissions/{permission_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Retirer une permission d'un rôle",
    description="Retire une permission d'un rôle."
)
def remove_permission_from_role(
    role_id: int,
    permission_id: int,
    db: Session = Depends(get_db),
    current_user: User = require_admin
):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    
    if permission in role.permissions:
        role.permissions.remove(permission)
        db.commit()
    
    return None


# ═══════════════════════════════════════════════════════════
#  PERMISSIONS - CRUD Complet
# ═══════════════════════════════════════════════════════════

@router.get(
    "/permissions/{permission_id}",
    response_model=PermissionSchema,
    summary="Détail d'une permission",
    description="Renvoie les informations complètes d'une permission."
)
def get_permission(permission_id: int, db: Session = Depends(get_db), current_user: User = require_admin):
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    return permission


@router.put(
    "/permissions/{permission_id}",
    response_model=PermissionSchema,
    summary="Modifier une permission",
    description="Met à jour les informations d'une permission."
)
def update_permission(
    permission_id: int,
    perm_in: PermissionCreate,
    db: Session = Depends(get_db),
    current_user: User = require_admin
):
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    
    # Vérifier que le nom ne duplique pas une autre permission
    existing_perm = db.query(Permission).filter(
        Permission.name == perm_in.name,
        Permission.id != permission_id
    ).first()
    if existing_perm:
        raise HTTPException(status_code=400, detail="Permission with this name already exists")
    
    permission.name = perm_in.name
    permission.description = perm_in.description
    
    db.add(permission)
    db.commit()
    db.refresh(permission)
    return permission


@router.delete(
    "/permissions/{permission_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer une permission",
    description="Supprime une permission (retire automatiquement des rôles)."
)
def delete_permission(permission_id: int, db: Session = Depends(get_db), current_user: User = require_admin):
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    
    db.delete(permission)
    db.commit()
    return None


# ═══════════════════════════════════════════════════════════
#  USERS - Gestion des Rôles
# ═══════════════════════════════════════════════════════════

@router.delete(
    "/users/{user_id}/roles/{role_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Retirer un rôle à un utilisateur",
    description="Retire un rôle assigné à un utilisateur."
)
def remove_role_from_user(
    user_id: int,
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = require_admin
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    if role in user.roles:
        user.roles.remove(role)
        db.commit()
    
    return None
