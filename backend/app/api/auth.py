from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    accessToken: str
    tokenType: str = "bearer"
    expiresIn: int = 86400

class UserProfile(BaseModel):
    id: str
    username: str
    role: str

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest):
    # Standard authentication foundation
    if credentials.username and credentials.password:
        return TokenResponse(
            accessToken="mock_jwt_token_production_ready",
            tokenType="bearer",
            expiresIn=86400
        )
    raise HTTPException(status_code=401, detail="Invalid username or password")

@router.get("/me", response_model=UserProfile)
async def get_current_user():
    return UserProfile(
        id="usr-1",
        username="trader",
        role="TRADER"
    )
