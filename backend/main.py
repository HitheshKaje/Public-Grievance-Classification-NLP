from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from database import get_db
from models import (
    ComplaintCreate, ComplaintResponse, ClassifyRequest, ClassifyResponse, 
    AnalyticsResponse, CategoryDistribution, ComplaintTrend
)
from datetime import datetime, timedelta
import os
from bson import ObjectId
from typing import List, Optional
import random

app = FastAPI(title="Grievance Classification API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def format_complaint(doc: dict) -> dict:
    doc["id"] = str(doc["_id"])
    return doc

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

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
            {"text": {"$regex": search, "$options": "i"}},
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
    try:
        doc = await db.complaints.find_one({"_id": ObjectId(id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Complaint not found")
        return format_complaint(doc)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")

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
    db = get_db()
    # In a real scenario, this might come from a separate collection
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
    # Requirement: Until the actual ML model is trained, return an appropriate 
    # "model not available" response (HTTP 503) rather than pretending a prediction exists.
    raise HTTPException(status_code=503, detail="Classification model is not available yet.")

    # Future integration will go here, something like:
    # prediction = model.predict(request.text)
    # doc = {
    #     "text": request.text,
    #     "category": prediction.category,
    #     "confidence": prediction.confidence,
    #     "status": "Classified",
    #     "department": get_department(prediction.category),
    #     "created_at": datetime.utcnow()
    # }
    # db = get_db()
    # result = await db.complaints.insert_one(doc)
    # return {
    #     "id": str(result.inserted_id),
    #     "category": prediction.category,
    #     "confidence": prediction.confidence,
    #     "status": "Classified",
    #     "department": doc["department"]
    # }

@app.post("/api/complaints")
async def create_complaint(complaint: ComplaintCreate):
    db = get_db()
    doc = complaint.dict()
    doc["created_at"] = datetime.utcnow()
    doc["status"] = "Pending"
    doc["confidence"] = None
    doc["category"] = None
    
    result = await db.complaints.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    return format_complaint(doc)
