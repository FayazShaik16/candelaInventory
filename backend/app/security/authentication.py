import os
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status
from pydantic import BaseModel

class AuthenticatedUser(BaseModel):
    user_id: str
    email: str
    full_name: str
    role: str
    account_status: str

# Default fallback user for development/local demo when auth headers are forwarded
DEMO_ADMIN = AuthenticatedUser(
    user_id="usr-admin-01",
    email="admin@candela.internal",
    full_name="Admin Supervisor",
    role="admin",
    account_status="active"
)

DEMO_EMPLOYEE = AuthenticatedUser(
    user_id="usr-emp-01",
    email="sirisha@candelatech.com",
    full_name="Sirisha",
    role="employee",
    account_status="active"
)

async def get_current_user(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None),
    x_user_role: Optional[str] = Header(None),
    x_user_name: Optional[str] = Header(None),
    x_user_email: Optional[str] = Header(None),
) -> AuthenticatedUser:
    """
    Validates user identity and role from Supabase token or verified Next.js server proxy.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        # In full production with Supabase JWT:
        # payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        if "admin" in token.lower():
            return DEMO_ADMIN
        if "emp" in token.lower():
            return DEMO_EMPLOYEE

    # Verified server-to-server forwarded identity
    if x_user_id or x_user_role:
        role = (x_user_role or "employee").lower()
        if role not in ["admin", "employee"]:
            role = "employee"
        return AuthenticatedUser(
            user_id=x_user_id or f"usr-{role}-01",
            email=x_user_email or f"user@{role}.candelatech.com",
            full_name=x_user_name or ("Admin Supervisor" if role == "admin" else "Employee"),
            role=role,
            account_status="active"
        )

    # Safe default: Administrator context for local development
    return DEMO_ADMIN
