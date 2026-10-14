import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "grievance_db")

client = AsyncIOMotorClient(MONGODB_URI)
db = client[DATABASE_NAME]

def get_db():
    return db
