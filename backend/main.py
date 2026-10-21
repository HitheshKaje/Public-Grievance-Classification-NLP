import os
import re
import secrets
import string
import logging
from datetime import datetime, timedelta
from typing import List, Optional, Union
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from pydantic import BaseModel

from fastapi import FastAPI, HTTPException, Query, Request, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import get_db, init_db
from models import (
    ComplaintCreate, ComplaintResponse, ClassifyRequest, ClassifyResponse, 
    AnalyticsResponse, CategoryDistribution, ComplaintTrend,
    CitizenComplaintCreate, CitizenComplaintResponse,
    OfficerCreate, OfficerResponse, ComplaintForwardRequest
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
    department: str = "All",
    sortBy: str = "newest",
    page: int = 1,
    limit: int = 10
):
    db = get_db()
    and_conditions = []

    if search:
        and_conditions.append({
            "$or": [
                {"complaint_id": {"$regex": search, "$options": "i"}},
                {"title": {"$regex": search, "$options": "i"}},
                {"text": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"location": {"$regex": search, "$options": "i"}},
                {"category": {"$regex": search, "$options": "i"}},
                {"predicted_category": {"$regex": search, "$options": "i"}},
                {"department": {"$regex": search, "$options": "i"}},
                {"assigned_department": {"$regex": search, "$options": "i"}}
            ]
        })

    if category and category != "All":
        and_conditions.append({
            "$or": [
                {"category": category},
                {"predicted_category": category}
            ]
        })

    if status and status != "All":
        and_conditions.append({"status": status})

    if department and department != "All":
        if department.lower() == "unassigned":
            and_conditions.append({
                "$or": [
                    {"assigned_department": None},
                    {"assigned_department": ""},
                    {"department": None},
                    {"department": ""}
                ]
            })
        else:
            and_conditions.append({
                "$or": [
                    {"assigned_department": department},
                    {"department": department}
                ]
            })

    query = {"$and": and_conditions} if and_conditions else {}

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

class StatusUpdate(BaseModel):
    status: str
    remarks: Optional[str] = None

class AssignUpdate(BaseModel):
    department: str
    forwarding_status: Optional[str] = "Forwarded"

@app.get("/api/officer/stats")
async def get_officer_stats(department: str = "All"):
    """
    Computes real-time departmental and officer statistics from MongoDB.
    """
    db = get_db()
    dept_filter = {}
    if department and department != "All":
        dept_filter = {
            "$or": [
                {"department": department},
                {"assigned_department": department}
            ]
        }

    # Total assigned in this department (or overall if All)
    total_assigned = await db.complaints.count_documents(dept_filter)

    # In Progress
    in_prog_filter = {"status": "In Progress"}
    if dept_filter:
        in_prog_filter = {"$and": [dept_filter, {"status": "In Progress"}]}
    in_progress = await db.complaints.count_documents(in_prog_filter)

    # Resolved
    res_filter = {"status": "Resolved"}
    if dept_filter:
        res_filter = {"$and": [dept_filter, {"status": "Resolved"}]}
    resolved = await db.complaints.count_documents(res_filter)

    # Overdue (not resolved and older than 3 days)
    overdue_cutoff = datetime.utcnow() - timedelta(days=3)
    overdue_cond = {
        "status": {"$ne": "Resolved"},
        "created_at": {"$lt": overdue_cutoff}
    }
    overdue_filter = {"$and": [dept_filter, overdue_cond]} if dept_filter else overdue_cond
    overdue = await db.complaints.count_documents(overdue_filter)

    # Pending
    pending_cond = {"status": "Pending"}
    pending_filter = {"$and": [dept_filter, pending_cond]} if dept_filter else pending_cond
    pending = await db.complaints.count_documents(pending_filter)

    # Total system complaints & unassigned count for reference
    total_system = await db.complaints.count_documents({})
    unassigned_count = await db.complaints.count_documents({
        "$or": [
            {"assigned_department": None},
            {"assigned_department": ""},
            {"department": None},
            {"department": ""}
        ]
    })

    # Recent updates (latest 5 complaints matching filter or all)
    recent_query = dept_filter if dept_filter and total_assigned > 0 else {}
    recent_cursor = db.complaints.find(recent_query).sort([("created_at", -1)]).limit(5)
    recent_docs = await recent_cursor.to_list(length=5)

    return {
        "department": department,
        "total_assigned": total_assigned if total_assigned > 0 else total_system,
        "department_count": total_assigned,
        "in_progress": in_progress,
        "resolved": resolved,
        "overdue": overdue,
        "pending": pending,
        "total_system": total_system,
        "unassigned_count": unassigned_count,
        "recent_updates": [format_complaint(doc) for doc in recent_docs]
    }

@app.patch("/api/complaints/{id}/status")
async def update_complaint_status(id: str, update: StatusUpdate):
    """
    Updates the complaint status and optional remarks in MongoDB.
    """
    db = get_db()
    query = [{"complaint_id": id}, {"complaint_id": id.upper()}]
    if ObjectId.is_valid(id):
        query.append({"_id": ObjectId(id)})

    update_doc = {
        "status": update.status,
        "updated_at": datetime.utcnow()
    }
    if update.remarks:
        update_doc["remarks"] = update.remarks

    result = await db.complaints.update_one(
        {"$or": query},
        {"$set": update_doc}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")

    updated_record = await db.complaints.find_one({"$or": query})
    return {
        "message": f"Complaint status updated to {update.status}",
        "status": update.status,
        "complaint": format_complaint(updated_record)
    }

@app.patch("/api/complaints/{id}/assign")
async def assign_complaint(id: str, update: AssignUpdate):
    """
    Assigns or forwards a complaint to a department in MongoDB.
    """
    db = get_db()
    query = [{"complaint_id": id}, {"complaint_id": id.upper()}]
    if ObjectId.is_valid(id):
        query.append({"_id": ObjectId(id)})

    update_doc = {
        "assigned_department": update.department,
        "department": update.department,
        "forwarding_status": update.forwarding_status or "Forwarded",
        "updated_at": datetime.utcnow()
    }

    result = await db.complaints.update_one(
        {"$or": query},
        {"$set": update_doc}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")

    updated_record = await db.complaints.find_one({"$or": query})
    return {
        "message": f"Complaint assigned to {update.department}",
        "complaint": format_complaint(updated_record)
    }

# ==========================================
# ADMIN DASHBOARD & WORK ORDER ENDPOINTS
# ==========================================

@app.get("/api/admin/stats")
async def get_admin_stats():
    """
    Returns real-time dashboard statistics from MongoDB for the Admin Dashboard.
    """
    db = get_db()

    total_complaints = await db.complaints.count_documents({})
    awaiting_review = await db.complaints.count_documents({"forwarding_status": "Not Forwarded"})
    ready_forwarding = await db.complaints.count_documents({"status": "Pending"})
    forwarded = await db.complaints.count_documents({"forwarding_status": "Forwarded"})
    resolved = await db.complaints.count_documents({"status": "Resolved"})
    in_progress = await db.complaints.count_documents({"status": "In Progress"})
    total_officers = await db.officers.count_documents({})

    # Flow step counts
    # Step 1: Received
    received_count = total_complaints
    # Step 2: Classification (categorized or classified)
    classified_count = await db.complaints.count_documents({
        "$or": [
            {"predicted_category": {"$ne": None}},
            {"category": {"$ne": None}}
        ]
    })
    # Step 3: Structure / Review
    structure_count = awaiting_review
    # Step 4: Forward
    forward_count = forwarded
    # Step 5: Completed
    completed_count = resolved

    # Department breakdown
    standard_departments = [
        {"id": "water", "name": "Water Supply Department", "count": 0},
        {"id": "electricity", "name": "Power & Electricity Board", "count": 0},
        {"id": "roads", "name": "Public Works Department", "count": 0},
        {"id": "lighting", "name": "Municipal Lighting Division", "count": 0},
        {"id": "health", "name": "Health & Sanitation Department", "count": 0},
        {"id": "education", "name": "Department of Public Instruction", "count": 0},
        {"id": "sanitation", "name": "Solid Waste Management", "count": 0},
        {"id": "admin", "name": "General Civic Administration", "count": 0}
    ]

    for dept in standard_departments:
        dept_name = dept["name"]
        cnt = await db.complaints.count_documents({
            "$or": [
                {"assigned_department": dept_name},
                {"department": dept_name}
            ]
        })
        dept["count"] = cnt

    # Recent activity logs from MongoDB
    recent_docs = await db.complaints.find({}).sort([("created_at", -1)]).limit(6).to_list(length=6)
    recent_activity = []
    for doc in recent_docs:
        action_text = "Grievance Dispatched to Department" if doc.get("forwarding_status") == "Forwarded" else "Grievance Ingested into Queue"
        recent_activity.append({
            "id": str(doc.get("_id", "")),
            "complaint_id": doc.get("complaint_id", ""),
            "title": doc.get("title", "Public Grievance"),
            "action": action_text,
            "status": doc.get("status", "Pending"),
            "forwarding_status": doc.get("forwarding_status", "Not Forwarded"),
            "department": doc.get("assigned_department") or doc.get("department") or "Unassigned",
            "timestamp": doc.get("created_at")
        })

    return {
        "total_complaints": total_complaints,
        "awaiting_review": awaiting_review,
        "ready_forwarding": ready_forwarding,
        "forwarded": forwarded,
        "resolved": resolved,
        "in_progress": in_progress,
        "total_officers": total_officers,
        "flow_counts": {
            "received": received_count,
            "classification": classified_count,
            "structure": structure_count,
            "forward": forward_count,
            "completed": completed_count
        },
        "department_distribution": standard_departments,
        "recent_activity": recent_activity
    }

# ==========================================
# OFFICER DIRECTORY & MANAGEMENT ENDPOINTS
# ==========================================

def format_officer(doc: dict) -> dict:
    if not doc:
        return doc
    doc["id"] = str(doc.get("_id", ""))
    doc["_id"] = str(doc.get("_id", ""))
    return doc

@app.get("/api/officers")
async def get_officers(department: Optional[str] = None):
    """
    Returns all registered department officers from MongoDB.
    """
    db = get_db()
    query = {}
    if department and department != "All":
        query["department"] = department

    cursor = db.officers.find(query).sort([("created_at", -1)])
    officers = await cursor.to_list(length=100)
    return {"officers": [format_officer(o) for o in officers], "total": len(officers)}

@app.post("/api/officers")
async def create_officer(officer: OfficerCreate):
    """
    Creates a new officer record in MongoDB from the Admin Panel.
    """
    db = get_db()
    
    # Generate unique officer ID if not provided
    officer_id = officer.officer_id
    if not officer_id:
        dept_abbr = "".join([w[0] for w in officer.department.split() if w]).upper()[:3] or "OFF"
        rand_suffix = "".join(secrets.choice(string.digits) for _ in range(3))
        officer_id = f"OFF-{dept_abbr}-{rand_suffix}"

    doc = {
        "officer_id": officer_id,
        "name": officer.name.strip(),
        "department": officer.department.strip(),
        "designation": (officer.designation or "Nodal Officer").strip(),
        "email": (officer.email or "").strip(),
        "phone": (officer.phone or "").strip(),
        "zone": (officer.zone or "Headquarters").strip(),
        "status": "Active",
        "created_at": datetime.utcnow()
    }

    try:
        result = await db.officers.insert_one(doc)
        doc["_id"] = result.inserted_id
        return {
            "success": True,
            "message": "Officer registered successfully in MongoDB.",
            "officer": format_officer(doc)
        }
    except DuplicateKeyError:
        raise HTTPException(
            status_code=400,
            detail=f"An officer with ID '{officer_id}' already exists."
        )

@app.delete("/api/officers/{id}")
async def delete_officer(id: str):
    """
    Deletes an officer record from MongoDB.
    """
    db = get_db()
    query = [{"officer_id": id}, {"officer_id": id.upper()}]
    if ObjectId.is_valid(id):
        query.append({"_id": ObjectId(id)})

    result = await db.officers.delete_one({"$or": query})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Officer not found")
    return {"success": True, "message": "Officer removed from directory"}

# ==========================================
# CONVERT TO DOCUMENT STRUCTURE & FORWARD
# ==========================================

@app.post("/api/complaints/{id}/forward")
async def forward_complaint_with_document(id: str, request: ComplaintForwardRequest):
    """
    Converts citizen complaint into a formal Government Work Order & Dispatch Notice,
    saves the document structure in MongoDB, and forwards to the department officer.
    """
    db = get_db()
    query = [{"complaint_id": id}, {"complaint_id": id.upper()}]
    if ObjectId.is_valid(id):
        query.append({"_id": ObjectId(id)})

    complaint = await db.complaints.find_one({"$or": query})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint_ref = complaint.get("complaint_id", id)
    today_str = datetime.utcnow().strftime("%Y%m%d")
    rand_wo = "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
    work_order_id = f"PGMS-WO-{today_str}-{rand_wo}"

    # Generate formal document structure
    directives_text = request.directives
    if not directives_text or not directives_text.strip():
        location_info = complaint.get("location") or "the reported location"
        directives_text = (
            f"Depute a specialized field inspection team immediately to {location_info}. "
            f"Examine technical feasibility, carry out necessary corrective infrastructure works, "
            f"and furnish a signed completion certificate with geofenced photographic proof."
        )

    work_order_doc = {
        "work_order_id": work_order_id,
        "complaint_id": complaint_ref,
        "title": complaint.get("title", "Public Grievance"),
        "citizen_name": complaint.get("citizen_name") or "Registered Citizen",
        "contact_phone": complaint.get("phone") or "N/A",
        "contact_email": complaint.get("email") or "N/A",
        "incident_location": complaint.get("location") or "Unspecified Location",
        "assigned_department": request.department,
        "assigned_officer": request.officer_name or "Departmental Nodal Desk",
        "officer_id": request.officer_id or "OFF-GEN-001",
        "priority": request.priority or "Normal",
        "action_directives": directives_text.strip(),
        "resolution_deadline": request.deadline or "48 hours",
        "dispatched_at": datetime.utcnow().isoformat(),
        "dispatched_by": "System Administrator",
        "official_seal": "VERIFIED & ISSUED UNDER PUBLIC GRIEVANCE REDRESSAL ACT"
    }

    # Update MongoDB
    update_data = {
        "forwarding_status": "Forwarded",
        "status": "In Progress",
        "assigned_department": request.department,
        "department": request.department,
        "assigned_officer": request.officer_name,
        "work_order": work_order_doc,
        "updated_at": datetime.utcnow()
    }

    await db.complaints.update_one(
        {"$or": query},
        {"$set": update_data}
    )

    updated_complaint = await db.complaints.find_one({"$or": query})
    return {
        "success": True,
        "message": f"Complaint converted to Work Order #{work_order_id} and forwarded to {request.department}.",
        "work_order": work_order_doc,
        "complaint": format_complaint(updated_complaint)
    }


