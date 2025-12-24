"""Authentication endpoints."""

import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.config import get_settings
from ...core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_pin,
    verify_pin,
)
from ...db import get_session
from ...db.models import RefreshToken, User
from ...services.otp import request_otp, verify_otp

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


# Request/Response models
class EmailOtpRequest(BaseModel):
    email: EmailStr


class EmailVerifyRequest(BaseModel):
    email: EmailStr
    otp: str


class PhoneOtpRequest(BaseModel):
    phone: str


class PhoneVerifyRequest(BaseModel):
    phone: str
    otp: str


class GoogleLoginRequest(BaseModel):
    idToken: str


class RefreshRequest(BaseModel):
    refreshToken: str


class PinRequest(BaseModel):
    pin: str


class TokenResponse(BaseModel):
    accessToken: str
    refreshToken: str


class SuccessResponse(BaseModel):
    success: bool


# Helper functions
async def get_or_create_user(
    session: AsyncSession, email: Optional[str] = None, phone: Optional[str] = None
) -> User:
    """Get existing user or create a new one."""
    if email:
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if user:
            user.email_verified = True
            await session.commit()
            return user

        user = User(
            id=str(uuid.uuid4()),
            email=email,
            email_verified=True,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user

    if phone:
        result = await session.execute(select(User).where(User.phone == phone))
        user = result.scalar_one_or_none()
        if user:
            user.phone_verified = True
            await session.commit()
            return user

        # Need an email - for phone-only users, generate a placeholder
        user = User(
            id=str(uuid.uuid4()),
            email=f"{phone.replace('+', '')}@phone.credverse.local",
            phone=phone,
            phone_verified=True,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user

    raise ValueError("Either email or phone must be provided")


async def create_tokens(session: AsyncSession, user: User) -> TokenResponse:
    """Create access and refresh tokens for a user."""
    jti = str(uuid.uuid4())

    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id}, jti=jti)

    # Store refresh token JTI for revocation tracking
    expire_days = settings.jwt_refresh_token_expire_days
    token_record = RefreshToken(
        jti=jti,
        user_id=user.id,
        expires_at=datetime.now(timezone.utc) + timedelta(days=expire_days),
    )
    session.add(token_record)
    await session.commit()

    return TokenResponse(accessToken=access_token, refreshToken=refresh_token)


# Endpoints
@router.post("/email/otp", response_model=SuccessResponse)
async def send_email_otp(request: EmailOtpRequest):
    """Send OTP to email address."""
    otp = await request_otp(request.email, is_email=True)
    if otp is None:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later.",
        )
    return SuccessResponse(success=True)


@router.post("/email/verify", response_model=TokenResponse)
async def verify_email(
    request: EmailVerifyRequest, session: AsyncSession = Depends(get_session)
):
    """Verify email OTP and return tokens."""
    is_valid = await verify_otp(request.email, request.otp)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired OTP",
        )

    user = await get_or_create_user(session, email=request.email)
    return await create_tokens(session, user)


@router.post("/phone/otp", response_model=SuccessResponse)
async def send_phone_otp(request: PhoneOtpRequest):
    """Send OTP to phone number."""
    otp = await request_otp(request.phone, is_email=False)
    if otp is None:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later.",
        )
    return SuccessResponse(success=True)


@router.post("/phone/verify", response_model=TokenResponse)
async def verify_phone(
    request: PhoneVerifyRequest, session: AsyncSession = Depends(get_session)
):
    """Verify phone OTP and return tokens."""
    is_valid = await verify_otp(request.phone, request.otp)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired OTP",
        )

    user = await get_or_create_user(session, phone=request.phone)
    return await create_tokens(session, user)


@router.post("/google", response_model=TokenResponse)
async def google_login(
    request: GoogleLoginRequest, session: AsyncSession = Depends(get_session)
):
    """Login with Google OAuth token."""
    # In production, verify the ID token with Google
    # For now, treat the token as a mock email
    mock_email = "google.user@credverse.demo"

    user = await get_or_create_user(session, email=mock_email)
    user.name = "Google User"
    await session.commit()

    return await create_tokens(session, user)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(
    request: RefreshRequest, session: AsyncSession = Depends(get_session)
):
    """Refresh access token using refresh token."""
    payload = decode_token(request.refreshToken)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    # Check if token is revoked
    jti = payload.get("jti")
    if jti:
        result = await session.execute(
            select(RefreshToken).where(
                RefreshToken.jti == jti, RefreshToken.revoked.is_(False)
            )
        )
        token_record = result.scalar_one_or_none()
        if not token_record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked",
            )

        # Revoke old token
        token_record.revoked = True

    # Get user
    user_id = payload.get("sub")
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return await create_tokens(session, user)


@router.post("/pin", response_model=SuccessResponse)
async def set_pin(
    request: PinRequest,
    session: AsyncSession = Depends(get_session),
):
    """Set or verify PIN for the authenticated user."""
    # In a real app, get user from auth header
    # For now, create a demo user
    result = await session.execute(select(User).limit(1))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    if user.hashed_pin:
        # Verify existing PIN
        if not verify_pin(request.pin, user.hashed_pin):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid PIN",
            )
    else:
        # Set new PIN
        user.hashed_pin = hash_pin(request.pin)
        await session.commit()

    return SuccessResponse(success=True)
