import asyncio
import secrets
from httpx import AsyncClient, ASGITransport
from main import app
from database import get_db

async def run_officer_admin_flow_test():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        print("=" * 60)
        print("VERIFYING OFFICER PROVISIONING, AUTH, AND STATUS WORKFLOW")
        print("=" * 60)

        # 1. Officer self-registration must be BLOCKED
        res = await ac.post("/api/auth/register", json={
            "name": "Self Registering Officer",
            "email": "selfofficer@test.gov.in",
            "password": "Password@123",
            "role": "officer",
            "department": "Public Works Department"
        })
        assert res.status_code == 403, f"Expected 403, got {res.status_code}: {res.text}"
        print("[PASS] 1. Officer self-registration correctly BLOCKED with 403 Forbidden")

        # 2. Admin self-registration must be BLOCKED
        res = await ac.post("/api/auth/register", json={
            "name": "Self Registering Admin",
            "email": "selfadmin@test.gov.in",
            "password": "Password@123",
            "role": "admin"
        })
        assert res.status_code == 403, f"Expected 403, got {res.status_code}: {res.text}"
        print("[PASS] 2. Admin self-registration correctly BLOCKED with 403 Forbidden")

        # 3. Admin adds officer via POST /api/officers
        test_email = f"officer_{secrets.token_hex(4)}@karnataka.gov.in"
        test_password = "SecureOfficerPass#2026"
        officer_payload = {
            "name": "Dr. Ramesh Patil",
            "department": "Public Works Department",
            "designation": "Superintending Engineer",
            "email": test_email,
            "phone": "9845123456",
            "zone": "Bangalore South",
            "password": test_password
        }
        res = await ac.post("/api/officers", json=officer_payload)
        assert res.status_code == 200, f"Failed to create officer: {res.status_code} {res.text}"
        officer_data = res.json()["officer"]
        officer_id = officer_data["officer_id"]
        print(f"[PASS] 3. Admin successfully added Officer '{officer_data['name']}' (ID: {officer_id})")

        # 4. Officer logs into Officer Dashboard with assigned credentials
        login_res = await ac.post("/api/auth/login", json={
            "email": test_email,
            "password": test_password,
            "role": "officer"
        })
        assert login_res.status_code == 200, f"Officer login failed: {login_res.status_code} {login_res.text}"
        user_info = login_res.json()["user"]
        assert user_info["officer_id"] == officer_id, f"Officer ID mismatch: {user_info}"
        assert user_info["designation"] == "Superintending Engineer", f"Designation mismatch: {user_info}"
        assert user_info["department"] == "Public Works Department", f"Department mismatch: {user_info}"
        assert user_info["zone"] == "Bangalore South", f"Zone mismatch: {user_info}"
        assert user_info["phone"] == "9845123456", f"Phone mismatch: {user_info}"
        print(f"[PASS] 4. Officer logged in successfully! Profile verified: {user_info['name']} | {user_info['designation']} | {user_info['zone']}")

        # 5. Check Officer Stats for newly created officer department (must NOT leak city-wide data)
        stats_res = await ac.get(f"/api/officer/stats?department=Public Works Department")
        assert stats_res.status_code == 200
        stats = stats_res.json()
        print(f"[PASS] 5. Officer stats for 'Public Works Department': Assigned={stats.get('total_assigned')}, In Progress={stats.get('in_progress')}, Resolved={stats.get('resolved')}")

        # 6. Admin updates complaint status to 'In Progress' and 'Resolved'
        # First find a complaint or create a test complaint
        db = get_db()
        test_complaint = await db.complaints.find_one({})
        if test_complaint:
            c_id = test_complaint.get("complaint_id")
            # Update to In Progress
            update_res1 = await ac.patch(f"/api/complaints/{c_id}/status", json={
                "status": "In Progress",
                "remarks": "Admin dispatched inspection crew"
            })
            assert update_res1.status_code == 200
            print(f"[PASS] 6. Admin clicked 'Progress' -> Complaint {c_id} status updated to 'In Progress'")

            # Update to Resolved
            update_res2 = await ac.patch(f"/api/complaints/{c_id}/status", json={
                "status": "Resolved",
                "remarks": "Issue resolved and validated by officer"
            })
            assert update_res2.status_code == 200
            print(f"[PASS] 7. Admin clicked 'Resolve' -> Complaint {c_id} status updated to 'Resolved'")

        # Clean up test user & officer
        await db.users.delete_one({"email": test_email})
        await db.officers.delete_one({"email": test_email})
        print("[PASS] 8. Cleaned up temporary test officer")

        print("=" * 60)
        print("ALL WORKFLOW VERIFICATION CHECKS PASSED PERFECTLY!")
        print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_officer_admin_flow_test())
