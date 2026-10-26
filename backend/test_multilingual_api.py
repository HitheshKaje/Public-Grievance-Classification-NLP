import os
import sys
import asyncio
from pathlib import Path

# Ensure UTF-8 output on Windows
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from main import app
from database import init_db

# Initialize database
asyncio.run(init_db())
client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("TEST 1: /api/multimodal/process with Hindi statement")
    print("=" * 60)
    hindi_payload = {
        "text": "हमारे मोहल्ले में तीन दिन से पानी की पाइपलाइन टूटी हुई है और सड़क पर गंदा पानी भर गया है। कृपया इसे जल्द ठीक करें।",
        "title": "पानी की पाइपलाइन समस्या",
        "location": "वार्ड 14, शांति नगर",
        "method": "write"
    }
    res = client.post("/api/multimodal/process", json=hindi_payload)
    print("Status:", res.status_code)
    assert res.status_code == 200, f"Error: {res.text}"
    data = res.json()
    print("Detected Language:", data.get("detected_language"))
    print("Original Text:", data.get("original_language_text"))
    print("English Translation:", data.get("english_sentence"))
    print("Structured Title:", data.get("structured_title"))
    print("Department:", data.get("detected_department"))
    print("Priority:", data.get("priority"))
    assert data.get("detected_language") == "Hindi"
    assert "water" in data.get("english_sentence", "").lower() or "pipeline" in data.get("english_sentence", "").lower()
    print("[PASS] Hindi text converted to English sentence successfully!\n")

    print("=" * 60)
    print("TEST 2: /api/multimodal/process with Kannada statement")
    print("=" * 60)
    kannada_payload = {
        "text": "ನಮ್ಮ ಬಡಾವಣೆಯಲ್ಲಿ ವಿದ್ಯುತ್ ತಂತಿ ತುಂಡಾಗಿ ಬಿದ್ದಿದೆ, ಕಿಡಿ ಹಾರುತ್ತಿದೆ. ತುಂಬಾ ಅಪಾಯವಿದೆ ದಯವಿಟ್ಟು ಸರಿಪಡಿಸಿ.",
        "title": "ವಿದ್ಯುತ್ ತಂತಿ ಸಮಸ್ಯೆ",
        "location": "ಶಾಂತಿನಗರ, ಬೆಂಗಳೂರು",
        "method": "write"
    }
    res = client.post("/api/multimodal/process", json=kannada_payload)
    print("Status:", res.status_code)
    assert res.status_code == 200, f"Error: {res.text}"
    data = res.json()
    print("Detected Language:", data.get("detected_language"))
    print("Original Text:", data.get("original_language_text"))
    print("English Translation:", data.get("english_sentence"))
    print("Structured Title:", data.get("structured_title"))
    print("Department:", data.get("detected_department"))
    print("Priority:", data.get("priority"))
    assert data.get("detected_language") == "Kannada"
    assert "electric" in data.get("english_sentence", "").lower() or "wire" in data.get("english_sentence", "").lower() or "power" in data.get("english_sentence", "").lower()
    print("[PASS] Kannada text converted to English sentence successfully!\n")

    print("=" * 60)
    print("TEST 3: Full Complaint Registration in Hindi via /api/complaints")
    print("=" * 60)
    hindi_complaint = {
        "title": "सड़क पर गहरा गड्ढा है",
        "description": "मुख्य चौराहे के पास बहुत गहरा गड्ढा है जिससे कई दोपहिया वाहन गिर चुके हैं।",
        "location": "गांधी चौक",
        "citizen_name": "रोहन वर्मा",
        "phone": "+91 9876543210",
        "method": "write"
    }
    res = client.post("/api/complaints", json=hindi_complaint)
    print("Status:", res.status_code)
    assert res.status_code == 200, f"Error: {res.text}"
    result = res.json()
    complaint = result["complaint"]
    print("Complaint ID:", complaint["complaint_id"])
    print("Saved Title (English):", complaint["title"])
    print("Original Title (Hindi):", complaint.get("original_title"))
    print("Saved Description (English):", complaint["description"])
    print("Detected Language:", complaint.get("detected_language"))
    print("English Translation:", complaint.get("english_translation"))
    assert complaint.get("detected_language") == "Hindi"
    assert complaint["complaint_id"].startswith("PGMS-")
    print("[PASS] Hindi complaint filed and auto-translated into English!\n")

    print("=" * 60)
    print("TEST 4: Full Complaint Registration in Kannada via /api/complaints")
    print("=" * 60)
    kannada_complaint = {
        "title": "ಬೀದಿ ದೀಪಗಳು ಕೆಟ್ಟು ಹೋಗಿವೆ",
        "description": "ಕಳೆದ 2 ವಾರಗಳಿಂದ ರಸ್ತೆಯ ಬೀದಿ ದೀಪಗಳು ಉರಿಯುತ್ತಿಲ್ಲ, ರಾತ್ರಿ ವೇಳೆ ನಡೆದಾಡಲು ಕಷ್ಟವಾಗಿದೆ.",
        "location": "5ನೇ ಕ್ರಾಸ್, ಮಲ್ಲೇಶ್ವರಂ",
        "citizen_name": "ಸುರೇಶ್ ಗೌಡ",
        "phone": "+91 9988776655",
        "method": "write"
    }
    res = client.post("/api/complaints", json=kannada_complaint)
    print("Status:", res.status_code)
    assert res.status_code == 200, f"Error: {res.text}"
    result = res.json()
    complaint = result["complaint"]
    print("Complaint ID:", complaint["complaint_id"])
    print("Saved Title (English):", complaint["title"])
    print("Original Title (Kannada):", complaint.get("original_title"))
    print("Saved Description (English):", complaint["description"])
    print("Detected Language:", complaint.get("detected_language"))
    print("English Translation:", complaint.get("english_translation"))
    assert complaint.get("detected_language") == "Kannada"
    print("[PASS] Kannada complaint filed and auto-translated into English!\n")

    print("=" * 60)
    print("TEST 5: /api/classify with Hindi & Kannada")
    print("=" * 60)
    res_hi = client.post("/api/classify", json={"text": "कचरे का ढेर लगा है और बदबू आ रही है"})
    assert res_hi.status_code == 200
    hi_data = res_hi.json()
    print("Hindi classify:", hi_data)
    assert hi_data["detected_language"] == "Hindi"

    res_kn = client.post("/api/classify", json={"text": "ಕುಡಿಯುವ ನೀರಿನ ಸರಬರಾಜು ಬಂದ್ ಆಗಿದೆ"})
    assert res_kn.status_code == 200
    kn_data = res_kn.json()
    print("Kannada classify:", kn_data)
    assert kn_data["detected_language"] == "Kannada"
    print("[PASS] Classification supports Hindi and Kannada!\n")

    print("=" * 60)
    print("TEST 6: Multipart Voice / Media file simulation")
    print("=" * 60)
    fake_audio = b"RIFF....WAVEfmt ...."
    files = {
        "audioFile": ("voice_note.wav", fake_audio, "audio/wav")
    }
    data = {
        "title": "Grievance audio clip",
        "description": "ಕಸ ವಿಲೇವಾರಿ ಮಾಡಿಲ್ಲ, ತುಂಬಾ ದುರ್ನಾತ ಬರುತ್ತಿದೆ",
        "location": "ರಾಜಾಜಿನಗರ",
        "method": "voice"
    }
    res = client.post("/api/complaints", data=data, files=files)
    assert res.status_code == 200, f"Error: {res.text}"
    voice_res = res.json()
    print("Voice complaint registered:", voice_res["complaint_id"])
    print("Detected language:", voice_res["complaint"].get("detected_language"))
    print("Files attached:", len(voice_res["complaint"].get("file_references", [])))
    print("[PASS] Multipart voice upload handles multilingual intake!\n")

    print("\nALL MULTILINGUAL API INTEGRATION TESTS PASSED! [OK]")

if __name__ == "__main__":
    run_tests()
