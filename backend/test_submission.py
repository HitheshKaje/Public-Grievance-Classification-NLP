import asyncio
import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(__file__))

from database import client, db, init_db
from main import generate_complaint_id, insert_complaint_with_unique_id, app
from pymongo.errors import DuplicateKeyError

async def run_tests():
    print("=== 1. Testing MongoDB Connection & Index Initialization ===")
    await init_db()
    indexes = await db.complaints.index_information()
    print("Indexes on 'complaints' collection:", list(indexes.keys()))
    assert "complaint_id_1" in indexes, "Unique index on complaint_id must exist!"
    assert indexes["complaint_id_1"].get("unique") is True, "complaint_id index must be unique!"
    print("[OK] MongoDB connected and unique index on complaint_id verified.")

    print("\n=== 2. Testing Complaint ID Generator Format ===")
    cid = generate_complaint_id()
    print(f"Generated sample Complaint ID: {cid}")
    today_str = datetime.utcnow().strftime("%Y%m%d")
    assert cid.startswith(f"PGMS-{today_str}-"), f"ID must start with PGMS-{today_str}-"
    parts = cid.split("-")
    assert len(parts) == 3, "ID must have 3 hyphen-separated parts"
    assert len(parts[2]) == 6, "Random suffix must be 6 characters"
    assert parts[2].isalnum() and parts[2].isupper(), "Suffix must be uppercase alphanumeric"
    print("[OK] Complaint ID format matches PGMS-YYYYMMDD-XXXXXX precisely.")

    print("\n=== 3. Testing Database Persistence & Collision Safety ===")
    test_doc = {
        "title": "Severe road pothole causing bike accidents",
        "description": "Large 2-foot pothole near 5th Main cross junction causing multiple vehicle falls.",
        "text": "Large 2-foot pothole near 5th Main cross junction causing multiple vehicle falls.",
        "location": "5th Main, 3rd Cross, Indiranagar",
        "citizen_name": "Test Citizen",
        "phone": "+91 9876543210",
        "email": "citizen@test.gov.in",
        "method": "write",
        "file_references": [],
        "predicted_category": None,
        "assigned_department": None,
        "status": "Pending",
        "forwarding_status": "Not Forwarded",
        "created_at": datetime.utcnow()
    }

    saved = await insert_complaint_with_unique_id(db, test_doc)
    assigned_id = saved["complaint_id"]
    print(f"Saved complaint successfully with ID: {assigned_id}")

    # Verify directly from MongoDB
    found = await db.complaints.find_one({"complaint_id": assigned_id})
    assert found is not None, "Complaint must be found in MongoDB!"
    assert found["complaint_id"] == assigned_id
    assert found["title"] == test_doc["title"]
    assert found["predicted_category"] is None
    assert found["assigned_department"] is None
    assert found["forwarding_status"] == "Not Forwarded"
    assert found["status"] == "Pending"
    print("[OK] Verified all required schema fields stored in MongoDB.")

    print("\n=== 4. Testing Unique Constraint (Collision Rejection) ===")
    duplicate_doc = {
        "complaint_id": assigned_id,
        "title": "Duplicate attempt",
        "location": "Nowhere",
        "created_at": datetime.utcnow()
    }
    collision_caught = False
    try:
        await db.complaints.insert_one(duplicate_doc)
    except DuplicateKeyError:
        collision_caught = True
    assert collision_caught, "MongoDB must raise DuplicateKeyError for identical complaint_id!"
    print("[OK] Uniqueness is strictly enforced at database level by MongoDB.")

    print("\n=== 5. Testing Tracking Query ===")
    tracked = await db.complaints.find_one({"complaint_id": assigned_id})
    assert tracked is not None
    print(f"Successfully tracked: {tracked['complaint_id']} -> Status: {tracked['status']}, Forwarding: {tracked['forwarding_status']}")

    # Clean up test doc
    await db.complaints.delete_one({"complaint_id": assigned_id})
    print(f"Cleaned up test complaint: {assigned_id}")

    print("\nALL BACKEND DATABASE TESTS PASSED SUCCESSFULLY! [OK]")

if __name__ == "__main__":
    asyncio.run(run_tests())
