import os
import sys
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(__file__))

from main import app, get_db
from database import init_db
import asyncio

# Initialize database indexes
asyncio.run(init_db())

client = TestClient(app)

def test_api():
    print("=== Testing 1: Health Check Endpoint ===")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"
    print("[OK] Health check passed:", data)

    print("\n=== Testing 2: Validation Failure on Empty Payload ===")
    res = client.post("/api/complaints", json={})
    assert res.status_code == 422, f"Expected 422, got {res.status_code}"
    print("[OK] Empty payload rejected with 422 as expected.")

    print("\n=== Testing 3: Complaint Submission via JSON ===")
    payload = {
        "title": "Broken Streetlight on 7th Cross",
        "description": "Streetlight pole #42 has been non-functional for 2 weeks creating night safety hazards.",
        "location": "7th Cross, Koramangala 4th Block",
        "citizen_name": "Ramesh Kumar",
        "phone": "+91 9845012345",
        "email": "ramesh.k@example.com",
        "method": "write"
    }
    res = client.post("/api/complaints", json=payload)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    result = res.json()
    assert result["success"] is True
    complaint_id = result["complaint_id"]
    print(f"[OK] Complaint registered successfully! ID: {complaint_id}")
    assert complaint_id.startswith(("CIVIQ-", "PGMS-"))
    
    complaint = result["complaint"]
    assert complaint["status"] == "Pending"
    assert complaint["forwarding_status"] == "Not Forwarded"
    assert complaint["predicted_category"] is None
    assert complaint["assigned_department"] is None
    assert complaint["location"] == payload["location"]
    print("[OK] Response fields strictly conform to requirements.")

    print("\n=== Testing 4: Complaint Submission via Multipart Form (with Attachment) ===")
    file_content = b"%PDF-1.4 Mock grievance petition document"
    files = {
        "pdfFile": ("petition.pdf", file_content, "application/pdf")
    }
    form_data = {
        "title": "Contaminated Water Supply in Residential Ward 12",
        "description": "Tap water is brown and smelling of sulfur since Monday.",
        "location": "Ward 12, Indiranagar",
        "citizen_name": "Deepa Rao",
        "phone": "+91 9988776655",
        "method": "pdf"
    }
    res = client.post("/api/complaints", data=form_data, files=files)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    multipart_res = res.json()
    multipart_id = multipart_res["complaint_id"]
    print(f"[OK] Multipart grievance with PDF registered: {multipart_id}")
    refs = multipart_res["complaint"]["file_references"]
    assert len(refs) > 0
    assert refs[0]["filename"] == "petition.pdf"
    print(f"[OK] File reference stored correctly: {refs[0]['path']}")

    print("\n=== Testing 5: Tracking Endpoint with Real Complaint ID ===")
    track_res = client.get(f"/api/complaints/track/{complaint_id}")
    assert track_res.status_code == 200, f"Expected 200, got {track_res.status_code}"
    tracked_data = track_res.json()
    assert tracked_data["success"] is True
    assert tracked_data["complaint"]["complaint_id"] == complaint_id
    assert tracked_data["complaint"]["status"] == "Pending"
    assert tracked_data["complaint"]["forwarding_status"] == "Not Forwarded"
    print(f"[OK] Tracked grievance: {complaint_id} -> Status: {tracked_data['complaint']['status']}")

    print("\n=== Testing 6: Tracking Endpoint with Non-Existent ID ===")
    not_found_res = client.get("/api/complaints/track/PGMS-99999999-NOTFOUND")
    assert not_found_res.status_code == 404
    print("[OK] Non-existent ID correctly returned HTTP 404.")

    print("\nALL API ENDPOINT INTEGRATION TESTS PASSED! [OK]")

if __name__ == "__main__":
    test_api()
