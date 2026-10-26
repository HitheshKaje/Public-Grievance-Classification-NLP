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

def hash_password(password: str) -> tuple[str, str]:
    import hashlib
    import secrets
    salt = secrets.token_hex(16)
    pw_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return pw_hash, salt

def verify_password(password: str, pw_hash: str, salt: str) -> bool:
    import hashlib
    import secrets
    check_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return secrets.compare_digest(check_hash, pw_hash)

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

        # Users collection indexes for fast & unique lookups
        await db.users.create_index("email", unique=True)
        await db.users.create_index("role")

        # Seed initial demo accounts if users collection is empty
        user_count = await db.users.count_documents({})
        if user_count == 0:
            logger.info("Initializing default users in MongoDB...")
            from datetime import datetime
            
            admin_hash, admin_salt = hash_password("Admin@1234")
            officer_hash, officer_salt = hash_password("Officer@1234")
            citizen_hash, citizen_salt = hash_password("Citizen@1234")

            default_users = [
                {
                    "name": "System Administrator",
                    "email": "admin@gov.in",
                    "password_hash": admin_hash,
                    "password_salt": admin_salt,
                    "role": "admin",
                    "created_at": datetime.utcnow()
                },
                {
                    "name": "Er. Rajesh Kumar",
                    "email": "officer.water@gov.in",
                    "password_hash": officer_hash,
                    "password_salt": officer_salt,
                    "role": "officer",
                    "department": "Water Supply Department",
                    "officer_id": "OFF-WTR-001",
                    "phone": "+91 98765 43210",
                    "created_at": datetime.utcnow()
                },
                {
                    "name": "Aarav Sharma",
                    "email": "citizen@gmail.com",
                    "password_hash": citizen_hash,
                    "password_salt": citizen_salt,
                    "role": "citizen",
                    "citizen_id": "CIT-2026-001",
                    "phone": "+91 91234 56789",
                    "created_at": datetime.utcnow()
                }
            ]
            await db.users.insert_many(default_users)
            logger.info("Successfully seeded default users into MongoDB 'users' collection.")

        logger.info("MongoDB indexes verified (complaints, officers, users)")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise e
