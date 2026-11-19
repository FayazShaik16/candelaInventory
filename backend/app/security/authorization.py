from fastapi import HTTPException, status
from .authentication import AuthenticatedUser

def assert_active_user(user: AuthenticatedUser):
    if user.account_status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your employee account has been deactivated. Please contact an administrator."
        )

def assert_admin(user: AuthenticatedUser):
    assert_active_user(user)
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission Denied: Administrator privileges are required to perform this inventory modification."
        )

def can_modify_inventory(user: AuthenticatedUser) -> bool:
    return user.account_status == "active" and user.role == "admin"
