from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


# Tenant Schemas
class TenantCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None


class TenantUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


class TenantResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    full_name: str
    email: str
    phone: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Property Schemas
class PropertyCreate(BaseModel):
    address_line1: str
    city: str
    state: str
    postal_code: str
    country: str = "IN"


class PropertyUpdate(BaseModel):
    address_line1: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None


class PropertyResponse(BaseModel):
    id: str
    organization_id: str
    address_line1: str
    city: str
    state: str
    postal_code: str
    country: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Lease Schemas
class LeaseCreate(BaseModel):
    property_id: str
    tenant_id: str
    monthly_rent_minor_units: int
    currency: str = "INR"
    due_day: int = 1
    start_date: datetime
    end_date: datetime


class LeaseUpdate(BaseModel):
    monthly_rent_minor_units: Optional[int] = None
    currency: Optional[str] = None
    due_day: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[str] = None


class LeaseResponse(BaseModel):
    id: str
    property_id: str
    tenant_id: str
    monthly_rent_minor_units: int
    currency: str
    due_day: int
    start_date: datetime
    end_date: datetime
    status: str

    model_config = ConfigDict(from_attributes=True)
