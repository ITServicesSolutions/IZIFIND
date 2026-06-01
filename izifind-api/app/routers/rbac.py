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
