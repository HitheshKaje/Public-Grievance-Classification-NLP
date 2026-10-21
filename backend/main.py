import os
import re
import secrets
import string
import logging
from datetime import datetime, timedelta
from typing import List, Optional, Union
from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from fastapi import FastAPI, HTTPException, Query, Request, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import get_db, init_db
from models import (
    ComplaintCreate, ComplaintResponse, ClassifyRequest, ClassifyResponse, 
    AnalyticsResponse, CategoryDistribution, ComplaintTrend,
    CitizenComplaintCreate, CitizenComplaintResponse
)

logger = logging.getLogger("uvicorn")

app = FastAPI(title="PGMS - Public Grievance Classification API")

# Setup CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload directory for grievance attachments (PDF, images, voice notes, documents)
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.on_event("startup")
async def on_startup():
    await init_db()

def generate_complaint_id() -> str:
    """
    Generate unique Complaint ID with format: PGMS-YYYYMMDD-XXXXXX
    Where XXXXXX is a 6-character uppercase alphanumeric code.
    """
    date_str = datetime.utcnow().strftime("%Y%m%d")
    alphabet = string.ascii_uppercase + string.digits
    random_part = "".join(secrets.choice(alphabet) for _ in range(6))
    return f"PGMS-{date_str}-{random_part}"

async def insert_complaint_with_unique_id(db, doc: dict, max_retries: int = 5) -> dict:
    """
    Inserts a complaint ensuring Complaint ID uniqueness.
    Safely catches DuplicateKeyError and retries up to max_retries.
    """
    for attempt in range(max_retries):
        complaint_id = generate_complaint_id()
        doc["complaint_id"] = complaint_id
        try:
            result = await db.complaints.insert_one(doc)
            doc["_id"] = result.inserted_id
            doc["id"] = str(result.inserted_id)
            return doc
        except DuplicateKeyError:
            logger.warning(f"ID collision encountered for {complaint_id}, retrying ({attempt + 1}/{max_retries})...")
            continue
    raise HTTPException(
        status_code=500,
        detail="Failed to allocate a unique Complaint ID after multiple attempts. Please try again."
    )

def format_complaint(doc: dict) -> dict:
    """Formats MongoDB document for clean API response while preserving backward compatibility."""
    if not doc:
        return doc
    doc["id"] = str(doc.get("_id", ""))
    doc["_id"] = str(doc.get("_id", ""))
    
    # Backward compatibility with existing Admin / Officer dashboards
    if "text" not in doc and "description" in doc:
        doc["text"] = doc["description"]
    if "title" not in doc and "text" in doc:
        doc["title"] = doc["text"][:60]
    if "category" not in doc:
        doc["category"] = doc.get("predicted_category")
    if "department" not in doc:
        doc["department"] = doc.get("assigned_department")
    if "status" not in doc:
        doc["status"] = "Pending"
    if "forwarding_status" not in doc:
        doc["forwarding_status"] = "Not Forwarded"
    if "file_references" not in doc:
        doc["file_references"] = []
    return doc

@app.get("/api/health")
async def health_check():
    """Health check endpoint that verifies MongoDB connectivity."""
    db = get_db()
    try:
        await db.client.admin.command("ping")
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Database connection failure")

@app.post("/api/complaints")
async def create_complaint(request: Request):
    """
    Complaint submission API that accepts complaints from Citizen Dashboard.
    Supports both multipart/form-data (with file uploads) and application/json.
    """
    db = get_db()
    content_type = request.headers.get("content-type", "")

    title = ""
    description = ""
    location = ""
    citizen_name = None
    phone = None
    email = None
    citizen_id = None
    method = "write"
    file_references = []

    if "multipart/form-data" in content_type:
        form = await request.form()
        title = (form.get("title") or "").strip()
        description = (form.get("description") or "").strip()
        location = (form.get("location") or "").strip()
        citizen_name = form.get("citizen_name") or form.get("citizenName")
        phone = form.get("phone")
        email = form.get("email")
        citizen_id = form.get("citizen_id") or form.get("citizenId")
        method = form.get("method") or "write"

        # Process any uploaded files
        for key, value in form.multi_items():
            if hasattr(value, "filename") and value.filename:
                safe_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', value.filename)
                unique_filename = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{secrets.token_hex(4)}_{safe_name}"
                target_path = os.path.join(UPLOAD_DIR, unique_filename)
                content = await value.read()
                with open(target_path, "wb") as f:
                    f.write(content)
                file_references.append({
                    "filename": value.filename,
                    "path": f"/uploads/{unique_filename}",
                    "size": len(content),
                    "content_type": value.content_type or "application/octet-stream",
                    "field": key
                })
    else:
        # JSON payload
        try:
            body = await request.json()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON or form payload.")
        title = (body.get("title") or body.get("text") or "").strip()
        description = (body.get("description") or body.get("details") or body.get("text") or "").strip()
        location = (body.get("location") or "").strip()
        citizen_name = body.get("citizen_name") or body.get("citizenName")
        phone = body.get("phone")
        email = body.get("email")
        citizen_id = body.get("citizen_id") or body.get("citizenId")
        method = body.get("method") or "write"
        file_references = body.get("file_references", [])

    # Validation
    if not title:
        raise HTTPException(status_code=422, detail="Complaint title is required.")
    if not description and method == "write":
        raise HTTPException(status_code=422, detail="Complaint description is required.")
    if not location:
        raise HTTPException(status_code=422, detail="Incident location is required.")

    doc = {
        "title": title,
        "description": description or title,
        "text": description or title,  # For backward-compatibility with admin dashboard
        "location": location,
        "citizen_name": citizen_name,
        "phone": phone,
        "email": email,
        "citizen_id": citizen_id,
        "method": method,
        "file_references": file_references,
        "predicted_category": None,           # Stored as unclassified / null per req 10
        "assigned_department": None,          # Stored as unassigned / null per req 10
        "confidence": None,
        "status": "Pending",                  # Pending review
        "forwarding_status": "Not Forwarded", # Not forwarded per req 11
        "created_at": datetime.utcnow()
    }

    try:
        saved_doc = await insert_complaint_with_unique_id(db, doc)
        return {
            "success": True,
            "complaint_id": saved_doc["complaint_id"],
            "message": "Complaint submitted successfully.",
            "complaint": format_complaint(saved_doc)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving complaint to MongoDB: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to save complaint to database. Please try again."
        )

@app.get("/api/complaints/track/{complaint_id}")
async def track_complaint(complaint_id: str):
    """
    Tracking API for citizens to look up real-time complaint status using Complaint ID.
    Returns actual complaint information from MongoDB.
    """
    db = get_db()
    cleaned_id = complaint_id.strip()
    query = [
        {"complaint_id": cleaned_id},
        {"complaint_id": cleaned_id.upper()}
    ]
    if ObjectId.is_valid(cleaned_id):
        query.append({"_id": ObjectId(cleaned_id)})

    doc = await db.complaints.find_one({"$or": query})
    if not doc:
        raise HTTPException(
            status_code=404,
            detail=f"Grievance with Reference ID '{complaint_id}' was not found in the official system."
        )
    return {
        "success": True,
        "complaint": format_complaint(doc)
    }

@app.get("/api/complaints", response_model=dict)
async def get_complaints(
    search: str = "",
    category: str = "All",
    status: str = "All",
    sortBy: str = "newest",
    page: int = 1,
    limit: int = 8
):
    db = get_db()
    query = {}
    if search:
        query["$or"] = [
            {"complaint_id": {"$regex": search, "$options": "i"}},
            {"title": {"$regex": search, "$options": "i"}},
            {"text": {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}}
        ]
    if category and category != "All":
        query["category"] = category
    if status and status != "All":
        query["status"] = status

    total = await db.complaints.count_documents(query)

    sort_query = [("created_at", -1)]
    if sortBy == "oldest":
        sort_query = [("created_at", 1)]
    elif sortBy == "confidence_high":
        sort_query = [("confidence", -1)]
    elif sortBy == "confidence_low":
        sort_query = [("confidence", 1)]

    skip = (page - 1) * limit
    cursor = db.complaints.find(query).sort(sort_query).skip(skip).limit(limit)
    complaints = await cursor.to_list(length=limit)

    return {
        "complaints": [format_complaint(c) for c in complaints],
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit if total > 0 else 1
    }

@app.get("/api/complaints/{id}")
async def get_complaint(id: str):
    db = get_db()
    query = [{"complaint_id": id}, {"complaint_id": id.upper()}]
    if ObjectId.is_valid(id):
        query.append({"_id": ObjectId(id)})

    doc = await db.complaints.find_one({"$or": query})
    if not doc:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return format_complaint(doc)

@app.get("/api/analytics", response_model=AnalyticsResponse)
async def get_analytics(range: int = 30):
    db = get_db()
    date_filter = datetime.utcnow() - timedelta(days=range)

    total = await db.complaints.count_documents({})
    classified = await db.complaints.count_documents({"status": "Classified"})
    pending = await db.complaints.count_documents({"status": {"$in": ["Pending", "In Progress"]}})

    categories = await db.complaints.distinct("category")
    category_count = len([c for c in categories if c])

    # Category distribution aggregation
    pipeline_dist = [
        {"$match": {"category": {"$ne": None}}},
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    dist_cursor = db.complaints.aggregate(pipeline_dist)
    dist_results = await dist_cursor.to_list(length=None)
    category_distribution = [{"category": d["_id"], "count": d["count"]} for d in dist_results]

    # Trend aggregation
    pipeline_trend = [
        {"$match": {"created_at": {"$gte": date_filter}}},
        {
            "$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}
                },
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    trend_cursor = db.complaints.aggregate(pipeline_trend)
    trend_results = await trend_cursor.to_list(length=None)
    complaint_trend = [{"date": d["_id"], "count": d["count"]} for d in trend_results]

    return AnalyticsResponse(
        total_complaints=total,
        classified_complaints=classified,
        pending_review=pending,
        category_count=category_count,
        category_distribution=category_distribution,
        complaint_trend=complaint_trend
    )

@app.get("/api/categories")
async def get_categories():
    return [
        {"name": "Water Supply", "department": "Water Department"},
        {"name": "Sanitation", "department": "Health and Sanitation"},
        {"name": "Electricity", "department": "Power Board"},
        {"name": "Infrastructure", "department": "Public Works Department"},
        {"name": "Public Safety", "department": "Police Department"},
        {"name": "Civic Services", "department": "Municipal Corporation"},
        {"name": "Transport", "department": "Transport Authority"},
        {"name": "Others", "department": "General Administration"}
    ]

@app.post("/api/classify")
async def classify_complaint(request: ClassifyRequest):
    # Requirement 10: Keep NLP classification separate for now.
    raise HTTPException(status_code=503, detail="Classification model is not available yet.")

from pydantic import BaseModel
class StatusUpdate(BaseModel):
    status: str

@app.patch("/api/complaints/{id}/status")
async def update_complaint_status(id: str, update: StatusUpdate):
    db = get_db()
    query = [{"complaint_id": id}, {"complaint_id": id.upper()}]
    if ObjectId.is_valid(id):
        query.append({"_id": ObjectId(id)})

    result = await db.complaints.update_one(
        {"$or": query},
        {"$set": {"status": update.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return {"message": "Status updated successfully"}
