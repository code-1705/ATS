from fastapi import APIRouter, HTTPException, Depends, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from backend.core.supabase_client import get_supabase_client
from backend.core.security import verify_password, create_access_token, decode_access_token
from backend.schemas.auth import LoginRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Admin Authentication"])
security = HTTPBearer(auto_error=False)

def get_current_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    token_param: Optional[str] = Query(None, alias="token")
) -> dict:
    """
    FastAPI dependency that validates Bearer JWT tokens or ?token= query parameter for admin routes.
    """
    token = None
    if credentials:
        token = credentials.credentials
    elif token_param:
        token = token_param

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return payload


@router.post("/login", response_model=TokenResponse)
async def login_admin(request: LoginRequest):
    """
    Admin login endpoint. Verifies email and password, returning a signed JWT token.
    Default login: admin@enter.in
    """
    supabase = get_supabase_client()
    res = supabase.table("users").select("id, email, hashed_password, name, role").eq("email", request.email).execute()

    if not res.data or len(res.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    user = res.data[0]
    if not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token_payload = {
        "sub": user["email"],
        "user_id": user["id"],
        "role": user["role"],
        "name": user["name"]
    }
    access_token = create_access_token(token_payload)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=str(user["id"]),
            email=user["email"],
            name=user["name"],
            role=user["role"]
        )
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(admin: dict = Depends(get_current_admin)):
    """
    Validates current active session and returns authenticated admin profile.
    """
    return UserResponse(
        id=str(admin.get("user_id", "")),
        email=admin.get("sub", ""),
        name=admin.get("name", "System Admin"),
        role=admin.get("role", "ADMIN")
    )
