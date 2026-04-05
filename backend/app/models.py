from pydantic import BaseModel, Field, validator
from typing import Optional


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    success: bool
    message: str


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class CategoryResponse(BaseModel):
    id: int
    name: str
    created_at: str

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    code: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=200)
    category: str = Field(..., min_length=1, max_length=100)


class ProductResponse(BaseModel):
    id: int
    code: str
    name: str
    category: str
    image_path: Optional[str]

    class Config:
        from_attributes = True


class DemandCreate(BaseModel):
    category: str
    product_name: Optional[str] = None
    product_code: Optional[str] = None
    new_description: Optional[str] = None
    quantity: Optional[int] = None
    required_by: Optional[str] = None
    name: str
    contact_number: str

    @validator("contact_number")
    def validate_contact_number(cls, v):
        # Check if it's exactly 10 digits
        if not v.isdigit() or len(v) != 10:
            raise ValueError("Contact number must be exactly 10 digits")
        return v

    @validator("new_description")
    def validate_demand(cls, v, values):
        if not values.get("product_name") and not v:
            raise ValueError("Either product_name or new_description must be provided")
        return v


class DemandResponse(BaseModel):
    id: int
    category: str
    product_name: Optional[str]
    product_code: Optional[str]
    new_description: Optional[str]
    quantity: Optional[int]
    required_by: Optional[str]
    name: Optional[str]
    contact_number: Optional[str]
    timestamp: str
    status: str

    class Config:
        from_attributes = True


class DemandUpdate(BaseModel):
    status: str = Field(..., pattern=r"^(Pending|Fulfilled)$")


class FeedbackCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    text: Optional[str] = None


class FeedbackResponse(BaseModel):
    id: int
    rating: int
    text: Optional[str]
    timestamp: str

    class Config:
        from_attributes = True
