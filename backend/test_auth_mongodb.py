import asyncio
import re
from httpx import AsyncClient, ASGITransport
from main import app
from database import get_db, init_db

async def run_auth_verification():
    print("==================================================")
    print("VERIFYING DYNAMIC MONGODB AUTHENTICATION & VALIDATION")
    print("==================================================")

    # Initialize DB & Seed
    await init_db()
    db = get_db()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        
        # 1. Health check
        res = await ac.get("/api/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        print("[PASS] 1. MongoDB Health Check: Connected and Operational")

        # 2. Email Validation: Invalid email formats
        invalid_emails = ["notanemail", "user@", "user@domain", "@nodomain.com", "spaces in@email.com"]
        for bad_email in invalid_emails:
            res = await ac.post("/api/auth/login", json={"email": bad_email, "password": "ValidPassword123!"})
            assert res.status_code == 422, f"Expected 422 for bad email '{bad_email}', got {res.status_code}"
        print("[PASS] 2. Input Validation: Invalid email formats correctly rejected with 422 Unprocessable Entity")

        # 3. Password Validation: Empty or short passwords
        res = await ac.post("/api/auth/login", json={"email": "admin@gov.in", "password": ""})
        assert res.status_code == 422, f"Expected 422 for empty password, got {res.status_code}"
        print("[PASS] 3. Input Validation: Empty password rejected with 422 Unprocessable Entity")

        # 4. Password Security: Incorrect credentials
        res = await ac.post("/api/auth/login", json={"email": "admin@gov.in", "password": "WrongPassword999"})
        assert res.status_code == 401, f"Expected 401 for wrong password, got {res.status_code}"
        assert "Incorrect password" in res.json().get("detail", "")
        print("[PASS] 4. Password Security: Invalid password rejected with 401 Unauthorized")

        # 5. Role Security & Authorization Mismatch:
        # A citizen attempting to access the Admin portal
        res = await ac.post("/api/auth/login", json={
            "email": "citizen@gmail.com", 
            "password": "Citizen@1234", 
            "role": "admin"
        })
        assert res.status_code == 403, f"Expected 403 for role mismatch, got {res.status_code}"
        assert "Access Denied" in res.json().get("detail", "")
        print("[PASS] 5. Role Security: Citizen account blocked from Admin Portal with 403 Forbidden")

        # 6. Admin Portal Login
        res = await ac.post("/api/auth/login", json={
            "email": "admin@gov.in", 
            "password": "Admin@1234", 
            "role": "admin"
        })
        assert res.status_code == 200, f"Admin login failed: {res.text}"
        admin_data = res.json()
        assert admin_data["user"]["role"] == "admin"
        print(f"[PASS] 6. Admin Portal Login: Authenticated as '{admin_data['user']['name']}' ({admin_data['user']['email']})")

        # 7. Officer Portal Login
        res = await ac.post("/api/auth/login", json={
            "email": "officer.water@gov.in", 
            "password": "Officer@1234", 
            "role": "officer"
        })
        assert res.status_code == 200, f"Officer login failed: {res.text}"
        officer_data = res.json()
        assert officer_data["user"]["role"] == "officer"
        assert officer_data["user"]["department"] == "Water Supply Department"
        print(f"[PASS] 7. Officer Portal Login: Authenticated as '{officer_data['user']['name']}' ({officer_data['user']['department']})")

        # 8. Citizen Portal Login
        res = await ac.post("/api/auth/login", json={
            "email": "citizen@gmail.com", 
            "password": "Citizen@1234", 
            "role": "citizen"
        })
        assert res.status_code == 200, f"Citizen login failed: {res.text}"
        citizen_data = res.json()
        assert citizen_data["user"]["role"] == "citizen"
        print(f"[PASS] 8. Citizen Portal Login: Authenticated as '{citizen_data['user']['name']}' (Citizen ID: {citizen_data['user']['citizen_id']})")

        # 9. Dynamic Registration into MongoDB (Zero Hardcoded Data)
        test_email = "dynamic.user.test@example.com"
        # Cleanup if previously exists
        await db.users.delete_one({"email": test_email})
        
        reg_payload = {
            "name": "Sunita Patil",
            "email": test_email,
            "password": "SecurePassword@2026",
            "role": "citizen",
            "phone": "+91 99887 76655"
        }
        res = await ac.post("/api/auth/register", json=reg_payload)
        assert res.status_code == 200, f"Registration failed: {res.text}"
        reg_data = res.json()
        assert reg_data["user"]["name"] == "Sunita Patil"
        assert reg_data["user"]["citizen_id"].startswith("CIT-")
        print(f"[PASS] 9. Dynamic MongoDB Registration: Successfully created new citizen document in MongoDB (ID: {reg_data['user']['citizen_id']})")

        # 10. Verify Registered User Can Sign In from MongoDB
        res = await ac.post("/api/auth/login", json={
            "email": test_email,
            "password": "SecurePassword@2026",
            "role": "citizen"
        })
        assert res.status_code == 200, f"Sign in with newly registered user failed: {res.text}"
        print("[PASS] 10. Login with Newly Registered User: Verified credentials authenticated against MongoDB record")

        # 11. Duplicate Registration Rejection
        res = await ac.post("/api/auth/register", json=reg_payload)
        assert res.status_code == 409, f"Expected 409 for duplicate email, got {res.status_code}"
        print("[PASS] 11. Duplicate Account Prevention: Rejects already registered email with 409 Conflict")

        # Clean up test user
        await db.users.delete_one({"email": test_email})

    print("==================================================")
    print("ALL 11 AUTHENTICATION & VALIDATION TESTS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_auth_verification())
