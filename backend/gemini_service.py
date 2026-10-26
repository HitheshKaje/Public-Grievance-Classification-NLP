import os
import json
import logging
from typing import Optional, Dict, Any
from pathlib import Path
from dotenv import load_dotenv
_backend_env = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_backend_env)
load_dotenv()

logger = logging.getLogger("uvicorn.error")

DEPARTMENTS = [
    "Water Supply Department",
    "Public Works Department",
    "Health & Sanitation Department",
    "Power & Electricity Board",
    "Municipal Lighting Division",
    "Department of Public Instruction",
    "Solid Waste Management",
    "General Civic Administration"
]

def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key or api_key.strip() in ["", "your_gemini_api_key_here"]:
        return None
    try:
        from google import genai
        return genai.Client(api_key=api_key.strip())
    except Exception as e:
        logger.error(f"Error initializing Gemini client: {e}")
        return None

def fallback_nlp_extraction(complaint_data: Dict[str, Any]) -> Dict[str, Any]:
    """Smart heuristic fallback when GEMINI_API_KEY is not yet configured."""
    title = complaint_data.get("title") or "Citizen Grievance"
    desc = complaint_data.get("description") or complaint_data.get("text") or ""
    loc = complaint_data.get("location") or "the reported incident area"
    combined = f"{title} {desc}".lower()

    # Multilingual Department taxonomy matching (English, Kannada, Hindi)
    dept = "General Civic Administration"
    if any(k in combined for k in [
        "water", "pipeline", "leak", "tap", "drinking", "sewage", "drainage", "pipe", "borewell",
        "ನೀರು", "ಪೈಪ್", "ಸೋರಿಕೆ", "ಕೊಳಾಯಿ", "ಚರಂಡಿ", "ಬೋರ್‌ವೆಲ್", "ಕುಡಿಯುವ ನೀರು", "ಜಲ",
        "पानी", "जल", "पाइप", "लीकेज", "सीवर", "नाली", "नल", "बोरवेल", "पेयजल"
    ]):
        dept = "Water Supply Department"
    elif any(k in combined for k in [
        "street light", "streetlight", "lamp", "pole light", "dark road",
        "ಬೀದಿ ದೀಪ", "ಕಂಬ", "ದೀಪ", "ಬೆಳಕು", "ಕತ್ತಲೆ",
        "स्ट्रीट लाइट", "खंभा", "बत्ती", "अंधेरा", "स्ट्रीटलाइट", "रोशनी"
    ]):
        dept = "Municipal Lighting Division"
    elif any(k in combined for k in [
        "power", "electricity", "wire", "transformer", "voltage", "blackout", "current", "shock",
        "ವಿದ್ಯುತ್", "ಕರೆಂಟ್", "ವೈರ್", "ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್", "ವೋಲ್ಟೇಜ್", "ಕರೆಂಟು",
        "बिजली", "करंट", "तार", "ट्रांसफॉर्मर", "वोल्टेज", "शॉक"
    ]):
        dept = "Power & Electricity Board"
    elif any(k in combined for k in [
        "road", "pothole", "tar", "asphalt", "bridge", "footpath", "highway", "flyover",
        "ರಸ್ತೆ", "ಗುಂಡಿ", "ಡಾಂಬರು", "ಸೇತುವೆ", "ಕಾಲುದಾರಿ", "ಹೈವೇ",
        "सड़क", "गड्ढा", "डामर", "पुल", "फुटपाथ", "हाईवे", "फ्लाईओवर"
    ]):
        dept = "Public Works Department"
    elif any(k in combined for k in [
        "garbage", "trash", "waste", "dustbin", "dump", "litter", "debris",
        "ಕಸ", "ತ್ಯಾಜ್ಯ", "ಕಸದ ಬುಟ್ಟಿ", "ಕಸದ ತೊಟ್ಟಿ",
        "कचरा", "कूड़ा", "कचरे", "डस्टबिन", "गंदगी"
    ]):
        dept = "Solid Waste Management"
    elif any(k in combined for k in [
        "hospital", "clinic", "health", "mosquito", "dengue", "disease", "epidemic", "sanitization",
        "ಆಸ್ಪತ್ರೆ", "ಆರೋಗ್ಯ", "ಸೊಳ್ಳೆ", "ಡೆಂಗ್ಯೂ", "ರೋಗ", "ಸ್ವಚ್ಛತೆ",
        "अस्पताल", "स्वास्थ्य", "मच्छर", "डेंगू", "बीमारी", "सफाई", "स्वच्छता"
    ]):
        dept = "Health & Sanitation Department"
    elif any(k in combined for k in [
        "school", "college", "teacher", "classroom", "student", "education",
        "ಶಾಲೆ", "ಕಾಲೇಜು", "ಶಿಕ್ಷಕ", "ತರಗತಿ", "ವಿದ್ಯಾರ್ಥಿ", "ಶಿಕ್ಷಣ",
        "स्कूल", "कॉलेज", "शिक्षक", "कक्षा", "छात्र", "शिक्षा"
    ]):
        dept = "Department of Public Instruction"

    # Priority determination (English, Kannada, Hindi)
    is_high = any(k in combined for k in [
        "urgent", "emergency", "danger", "hazard", "spark", "overflow", "burst", "live wire", "flood", "critical", "risk",
        "ತುರ್ತು", "ಅಪಾಯ", "ಬೆಂಕಿ", "ಪ್ರವಾಹ", "ಗಂಭೀರ",
        "आपातकालीन", "खतरा", "आग", "बाढ़", "गंभीर", "जल्द", "तुरंत"
    ])
    priority = "High" if is_high else "Normal"

    directives = (
        f"1. Depute an authorized nodal inspection team immediately to inspect {loc}.\n"
        f"2. Assess technical scope of the grievance titled '{title}'.\n"
        f"3. Execute required civil, mechanical, and operational rectifications under standard {dept} SOP.\n"
        f"4. Upload geotagged compliance certificate and photographic verification upon completion."
    )

    return {
        "transcribed_text": desc or f"Recorded citizen petition regarding {title} at {loc}.",
        "structured_title": title.title(),
        "structured_description": desc or f"Grievance registered for immediate administrative intervention at {loc}.",
        "detected_department": dept,
        "incident_location": loc,
        "priority": priority,
        "directives": directives,
        "is_fallback": True,
        "note": "Structured via built-in multilingual NLP heuristics. Gemini AI available for multimodal audio/photo OCR."
    }

def _parse_json_response(raw_text: str) -> dict:
    cleaned = raw_text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return json.loads(cleaned.strip())

MODELS_CASCADE = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-flash-latest",
    "gemini-2.5-flash"
]

def extract_multimodal_complaint(
    complaint_data: Dict[str, Any],
    uploads_dir: Path
) -> Dict[str, Any]:
    """
    Extracts structured grievance information from multimodal complaint
    (Audio recording, Photo evidence, PDF petition, or Text) using Gemini.
    Falls back to intelligent local NLP if API key fails or is unavailable.
    """
    client = get_gemini_client()
    if not client:
        logger.info("GEMINI_API_KEY not configured. Using intelligent NLP fallback extraction.")
        return {
            "success": True,
            "error": None,
            "extracted": fallback_nlp_extraction(complaint_data)
        }

    # Gather inputs
    text_input = complaint_data.get("description") or complaint_data.get("text") or ""
    title_input = complaint_data.get("title") or ""
    citizen_name = complaint_data.get("citizen_name") or "Anonymous Citizen"
    location_input = complaint_data.get("location") or ""
    method = complaint_data.get("submission_method") or complaint_data.get("method") or "write"
    attachments = complaint_data.get("attachments") or complaint_data.get("file_references") or []

    prompt = f"""You are an expert Government Public Grievance Redressal Officer and Multimodal AI Analyst.
Analyze this citizen grievance intake and synthesize it into an official, structured administrative record.

Available Official Civic Departments:
{json.dumps(DEPARTMENTS, indent=2)}

Citizen Input Details:
- Submission Method: {method}
- Citizen Name: {citizen_name}
- Initial Title: {title_input}
- Incident Location: {location_input}
- Citizen Statement/Notes: {text_input}

Task:
1. If any media (voice recording, field photo, or scanned PDF petition) is attached, transcribe all spoken audio, signage text, or petition contents.
2. Formulate a precise, formal administrative subject / title.
3. Classify into the most appropriate official department from the list above.
4. Extract or confirm the incident geolocation / ward landmark.
5. Determine priority ("High" for hazard, live wire, water contamination, sewage flood, or "Normal").
6. Generate 4 numbered, enforceable engineering action directives for the field nodal officer.

Return ONLY a valid JSON object matching this schema:
{{
  "transcribed_text": "Full transcribed spoken voice or OCR extracted text from media",
  "structured_title": "Formal administrative subject",
  "structured_description": "Clean, official factual statement of grievance",
  "detected_department": "Exact department name from list",
  "incident_location": "Identified location/landmark",
  "priority": "High | Normal",
  "directives": "1. Depute team...\\n2. Assess...\\n3. Rectify...\\n4. Upload compliance certificate."
}}
"""

    contents = [prompt]

    # Attach media if available
    for att in attachments:
        rel_path = att.get("path") or ""
        clean_path = rel_path.replace("uploads/", "").replace("uploads\\", "").lstrip("/\\")
        file_path = uploads_dir / clean_path
        if file_path.exists():
            mime_type = att.get("content_type") or att.get("mimetype")
            if not mime_type:
                ext = file_path.suffix.lower()
                if ext in ['.jpg', '.jpeg']: mime_type = 'image/jpeg'
                elif ext == '.png': mime_type = 'image/png'
                elif ext == '.webp': mime_type = 'image/webp'
                elif ext == '.pdf': mime_type = 'application/pdf'
                elif ext in ['.mp3', '.wav', '.ogg', '.webm', '.m4a']: mime_type = 'audio/webm'
                else: mime_type = 'application/octet-stream'

            try:
                from google.genai import types
                file_bytes = file_path.read_bytes()
                part = types.Part.from_bytes(data=file_bytes, mime_type=mime_type)
                contents.append(part)
                logger.info(f"Attached file {file_path.name} ({mime_type}, {len(file_bytes)} bytes) for Gemini extraction")
            except Exception as e:
                logger.warning(f"Could not attach file {file_path}: {e}")

    last_error = None
    for model_name in MODELS_CASCADE:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=contents,
                config={
                    "response_mime_type": "application/json"
                }
            )
            parsed = _parse_json_response(response.text)
            parsed["model_used"] = model_name
            parsed["is_fallback"] = False
            return {
                "success": True,
                "error": None,
                "extracted": parsed
            }
        except Exception as e:
            last_error = e
            logger.warning(f"Model {model_name} failed: {e}. Trying fallback...")
            continue

    logger.error(f"All Gemini models failed: {last_error}. Falling back to NLP heuristics.")
    fallback = fallback_nlp_extraction(complaint_data)
    fallback["note"] = f"Gemini API error ({str(last_error)[:100]}). Falling back to NLP heuristics."
    return {
        "success": True,
        "error": str(last_error),
        "extracted": fallback
    }

def classify_text_with_gemini(text: str) -> Dict[str, Any]:
    """
    Classifies a raw complaint text using Gemini into Department, Category, and Priority.
    """
    client = get_gemini_client()
    if not client:
        return {
            "category": "General Civic Administration",
            "department": "General Civic Administration",
            "confidence": 0.85,
            "priority": "Normal",
            "is_ai": False
        }

    prompt = f"""Classify this public grievance into category, department, and priority.
Complaint Text: "{text}"

Departments:
{json.dumps(DEPARTMENTS, indent=2)}

Return ONLY a JSON object:
{{
  "category": "Short Category Name (e.g., Water Supply, Electricity, Public Works, Sanitation)",
  "department": "Exact Department Name from list above",
  "confidence": 0.95,
  "priority": "High | Normal"
}}
"""
    for model_name in MODELS_CASCADE:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=[prompt],
                config={"response_mime_type": "application/json"}
            )
            return _parse_json_response(response.text)
        except Exception as e:
            logger.warning(f"Classify model {model_name} failed: {e}")
            continue

    return {
        "category": "General Administration",
        "department": "General Civic Administration",
        "confidence": 0.80,
        "priority": "Normal"
    }

