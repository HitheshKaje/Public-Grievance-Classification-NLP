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
        logger.info("MongoDB indexes verified (unique complaint_id index enforced)")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise e
