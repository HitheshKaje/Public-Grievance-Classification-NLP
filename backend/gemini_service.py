import os
import json
import logging
from typing import Optional, Dict, Any
from pathlib import Path
from dotenv import load_dotenv

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

    # Department taxonomy matching
    dept = "General Civic Administration"
    if any(k in combined for k in ["water", "pipeline", "leak", "tap", "drinking", "sewage", "drainage", "pipe", "borewell"]):
        dept = "Water Supply Department"
    elif any(k in combined for k in ["street light", "streetlight", "lamp", "pole light", "dark road"]):
        dept = "Municipal Lighting Division"
    elif any(k in combined for k in ["power", "electricity", "wire", "transformer", "voltage", "blackout", "current", "shock"]):
        dept = "Power & Electricity Board"
    elif any(k in combined for k in ["road", "pothole", "tar", "asphalt", "bridge", "footpath", "highway", "flyover"]):
        dept = "Public Works Department"
    elif any(k in combined for k in ["garbage", "trash", "waste", "dustbin", "dump", "litter", "debris"]):
        dept = "Solid Waste Management"
    elif any(k in combined for k in ["hospital", "clinic", "health", "mosquito", "dengue", "disease", "epidemic", "sanitization"]):
        dept = "Health & Sanitation Department"
    elif any(k in combined for k in ["school", "college", "teacher", "classroom", "student", "education"]):
        dept = "Department of Public Instruction"

    # Priority determination
    is_high = any(k in combined for k in ["urgent", "emergency", "danger", "hazard", "spark", "overflow", "burst", "live wire", "flood", "critical", "risk"])
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
        "note": "Structured via built-in NLP heuristics. Add GEMINI_API_KEY in backend/.env for multimodal audio/photo OCR."
    }

def extract_multimodal_complaint(
    complaint_data: Dict[str, Any],
    uploads_dir: Path
) -> Dict[str, Any]:
    """
    Extracts structured grievance information from multimodal complaint
    (Audio recording, Photo evidence, PDF petition, or Text) using Gemini.
    Falls back to intelligent local NLP if API key is not configured.
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
    method = complaint_data.get("submission_method") or "write"
    attachments = complaint_data.get("attachments") or []

    prompt = f"""You are an expert Government Public Grievance Officer and Data Analyst.
Analyze this citizen grievance intake and synthesize it into a formal, structured official record.

Available Official Civic Departments:
{json.dumps(DEPARTMENTS, indent=2)}

Citizen Input Details:
- Submission Method: {method}
- Citizen Name: {citizen_name}
- Initial Title: {title_input}
- Incident Location: {location_input}
- Citizen Statement/Notes: {text_input}

Task:
1. If media (audio recording, image photo, or PDF document) is attached, extract and transcribe all spoken dialogue, signage, or petition text.
2. Formulate a precise, formal administrative subject / title.
3. Classify into the most appropriate official department from the list above.
4. Extract or verify the incident geolocation/ward.
5. Determine priority ("High" for hazard/water contamination/live wire/sewage flood, or "Normal").
6. Generate 4 numbered, enforceable engineering action directives for the field nodal officer.

Return ONLY a valid JSON object matching this schema:
{{
  "transcribed_text": "Full transcribed spoken voice or OCR extracted text from media",
  "structured_title": "Formal administrative subject",
  "structured_description": "Clean, official factual statement of grievance",
  "detected_department": "Exact department name from list",
  "incident_location": "Identified location/landmark",
  "priority": "High | Normal",
  "directives": "1. Inspect...\\n2. Rectify...\\n3. Verify...\\n4. Upload compliance report."
}}
"""

    contents = [prompt]

    # Attach media if available
    for att in attachments:
        rel_path = att.get("path") or ""
        # Handle path formatting
        clean_path = rel_path.replace("uploads/", "").replace("uploads\\", "").lstrip("/\\")
        file_path = uploads_dir / clean_path
        if file_path.exists():
            mime_type = att.get("content_type") or att.get("mimetype")
            if not mime_type:
                ext = file_path.suffix.lower()
                if ext in ['.jpg', '.jpeg']: mime_type = 'image/jpeg'
                elif ext == '.png': mime_type = 'image/png'
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

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents,
            config={
                "response_mime_type": "application/json"
            }
        )
        parsed = json.loads(response.text)
        return {
            "success": True,
            "error": None,
            "extracted": parsed
        }
    except Exception as e:
        logger.error(f"Gemini generation error: {e}")
        # Try gemini-1.5-flash if 2.5 is unavailable
        try:
            response = client.models.generate_content(
                model='gemini-1.5-flash',
                contents=contents,
                config={
                    "response_mime_type": "application/json"
                }
            )
            parsed = json.loads(response.text)
            return {
                "success": True,
                "error": None,
                "extracted": parsed
            }
        except Exception as e2:
            logger.error(f"Fallback Gemini generation error: {e2}")
            return {
                "success": False,
                "error": str(e2),
                "extracted": None
            }
