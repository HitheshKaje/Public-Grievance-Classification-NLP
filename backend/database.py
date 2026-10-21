import os
import asyncio
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("uvicorn")

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "grievance_db")

_client = None
_client_loop = None

def get_client():
    global _client, _client_loop
    try:
        current_loop = asyncio.get_running_loop()
    except RuntimeError:
        current_loop = None

    if _client is None or (_client_loop is not None and _client_loop.is_closed()) or (_client_loop is not None and _client_loop != current_loop):
        _client = AsyncIOMotorClient(MONGODB_URI)
        _client_loop = current_loop
    return _client

def get_db():
    return get_client()[DATABASE_NAME]

async def init_db():
    try:
        client = get_client()
        db = get_db()
        # Ping the database
        await client.admin.command("ping")
        logger.info(f"Connected to MongoDB at {MONGODB_URI}, Database: {DATABASE_NAME}")
        
        # Enforce uniqueness on complaint_id at database level
        await db.complaints.create_index("complaint_id", unique=True)
        await db.complaints.create_index("created_at")

        # Enforce uniqueness on officer_id
        await db.officers.create_index("officer_id", unique=True)
        await db.officers.create_index("department")
        logger.info("MongoDB indexes verified (complaints and officers)")

        # Seed initial departmental officers if collection is empty
        officer_count = await db.officers.count_documents({})
        if officer_count == 0:
            initial_officers = [
                {
                    "officer_id": "OFF-WSD-101",
                    "name": "Er. Rajesh Sharma",
                    "department": "Water Supply Department",
                    "designation": "Executive Engineer (Water Main)",
                    "email": "rajesh.wsd@karnataka.gov.in",
                    "phone": "+91 98450 11221",
                    "zone": "Indiranagar Division, Bengaluru",
                    "status": "Active"
                },
                {
                    "officer_id": "OFF-PWD-102",
                    "name": "Smt. Kavitha Nair",
                    "department": "Public Works Department",
                    "designation": "Assistant Executive Engineer (Roads)",
                    "email": "kavitha.pwd@karnataka.gov.in",
                    "phone": "+91 98450 11222",
                    "zone": "Koramangala Sub-division",
                    "status": "Active"
                },
                {
                    "officer_id": "OFF-HSD-103",
                    "name": "Dr. Anand Kulkarni",
                    "department": "Health & Sanitation Department",
                    "designation": "Chief Health Officer",
                    "email": "anand.health@karnataka.gov.in",
                    "phone": "+91 98450 11223",
                    "zone": "Central Ward Circle",
                    "status": "Active"
                },
                {
                    "officer_id": "OFF-PEB-104",
                    "name": "Er. Suresh Babu",
                    "department": "Power & Electricity Board",
                    "designation": "Superintending Engineer",
                    "email": "suresh.power@karnataka.gov.in",
                    "phone": "+91 98450 11224",
                    "zone": "East Transmission Grid",
                    "status": "Active"
                }
            ]
            await db.officers.insert_many(initial_officers)
            logger.info("Initialized default nodal departmental officers in MongoDB")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise e
