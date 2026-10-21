from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class FileReference(BaseModel):
    filename: str
    path: str
    size: Optional[int] = None
    content_type: Optional[str] = None

class CitizenComplaintCreate(BaseModel):
    title: str
    description: str
    location: str
    citizen_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    citizen_id: Optional[str] = None
    method: Optional[str] = "write"
    file_references: Optional[List[FileReference]] = []

class CitizenComplaintResponse(BaseModel):
    id: str = Field(alias="_id")
    complaint_id: str
    citizen_id: Optional[str] = None
    title: str
    description: str
    location: str
    file_references: List[dict] = []
    predicted_category: Optional[str] = None
    assigned_department: Optional[str] = None
    status: str = "Pending"
    forwarding_status: str = "Not Forwarded"
    created_at: datetime
    citizen_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    method: Optional[str] = None

    class Config:
        populate_by_name = True

class ComplaintBase(BaseModel):
    text: str
    category: Optional[str] = None
    confidence: Optional[float] = None
    status: Optional[str] = "Pending"
    department: Optional[str] = None

class ComplaintCreate(BaseModel):
    text: str
    details: Optional[str] = None

class ComplaintResponse(BaseModel):
    id: str = Field(alias="_id")
    text: str
    details: Optional[str] = None
    category: Optional[str] = None
    confidence: Optional[float] = None
    status: str
    department: Optional[str] = None
    created_at: datetime
    citizenId: Optional[str] = None
    ward: Optional[str] = None
    priority: Optional[str] = None

    class Config:
        populate_by_name = True

class ClassifyRequest(BaseModel):
    text: str

class ClassifyResponse(BaseModel):
    id: str
    category: str
    confidence: float
    status: str
    department: str

class CategoryDistribution(BaseModel):
    category: str
    count: int

class ComplaintTrend(BaseModel):
    date: str
    count: int

class AnalyticsResponse(BaseModel):
    total_complaints: int
    classified_complaints: int
    pending_review: int
    category_count: int
    category_distribution: List[CategoryDistribution]
    complaint_trend: List[ComplaintTrend]

class Category(BaseModel):
    name: str
    department: str
    description: Optional[str] = None
    priority: Optional[str] = None
    keywords: Optional[List[str]] = None
