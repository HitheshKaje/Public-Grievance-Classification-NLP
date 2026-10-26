import os
import re
import json
import logging
from typing import Optional, Dict, Any, List, Union
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

MODELS_CASCADE = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-3.5-flash"
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

def detect_script_language(text: str) -> str:
    """
    Detects whether the provided text is primarily in Hindi (Devanagari),
    Kannada, or English based on Unicode ranges and script analysis.
    """
    if not text or not text.strip():
        return "English"
    
    devanagari_count = len(re.findall(r'[\u0900-\u097F]', text))
    kannada_count = len(re.findall(r'[\u0C80-\u0CFF]', text))
    latin_count = len(re.findall(r'[a-zA-Z]', text))

    if devanagari_count > 0 and devanagari_count >= kannada_count:
        return "Hindi"
    elif kannada_count > 0 and kannada_count > devanagari_count:
        return "Kannada"
    elif latin_count > 0:
        return "English"
    return "English"

def get_language_code(language_name: str) -> str:
    mapping = {
        "hindi": "hi",
        "kannada": "kn",
        "english": "en",
        "multilingual": "multi"
    }
    return mapping.get((language_name or "").lower(), "en")

def fallback_nlp_extraction(complaint_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Smart heuristic fallback when GEMINI_API_KEY is not configured or offline.
    Supports Hindi, Kannada, and English text inputs and produces structured English outputs.
    """
    title = complaint_data.get("title") or "Citizen Grievance"
    desc = complaint_data.get("description") or complaint_data.get("text") or ""
    loc = complaint_data.get("location") or "the reported incident area"
    combined = f"{title} {desc}".lower()

    detected_lang = detect_script_language(f"{title} {desc}")
    lang_code = get_language_code(detected_lang)

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

    # Formulate English structured sentence
    original_text = desc or title or "Citizen petition registered"
    if detected_lang == "Hindi":
        english_sentence = f"Citizen reported a public grievance in Hindi regarding {dept.lower()} issues at {loc}: {original_text}"
        structured_title = f"{dept} Grievance reported at {loc}"
    elif detected_lang == "Kannada":
        english_sentence = f"Citizen reported a public grievance in Kannada regarding {dept.lower()} issues at {loc}: {original_text}"
        structured_title = f"{dept} Grievance reported at {loc}"
    else:
        english_sentence = desc or f"Citizen petition regarding {title} at {loc}."
        structured_title = title.title()

    directives = (
        f"1. Depute an authorized nodal inspection team immediately to inspect {loc}.\n"
        f"2. Assess technical scope of the grievance titled '{structured_title}'.\n"
        f"3. Execute required civil, mechanical, and operational rectifications under standard {dept} SOP.\n"
        f"4. Upload geotagged compliance certificate and photographic verification upon completion."
    )

    return {
        "detected_language": detected_lang,
        "detected_language_code": lang_code,
        "original_language_text": original_text,
        "english_sentence": english_sentence,
        "structured_title": structured_title,
        "structured_description": english_sentence,
        "detected_department": dept,
        "incident_location": loc,
        "priority": priority,
        "directives": directives,
        "confidence": 0.82,
        "is_fallback": True,
        "note": "Processed via built-in multilingual NLP heuristics."
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

def process_multilingual_complaint(
    complaint_data: Dict[str, Any],
    uploads_dir: Optional[Path] = None,
    raw_files: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Multilingual & Multimodal Intake Engine supporting HINDI, KANNADA, and ENGLISH.
    Handles:
    - Spoken Voice Audio (Hindi / Kannada / English voice -> transcribed & converted to English sentence)
    - Photo / Image Evidence (Hindi / Kannada / English signs, handwritten letters, scene -> converted to English)
    - PDF Documents (Hindi / Kannada / English petitions -> extracted & converted to English sentence)
    - Written Text (Hindi / Kannada / English -> translated to English sentence)
    """
    client = get_gemini_client()
    if not client:
        logger.info("GEMINI_API_KEY not configured. Using intelligent NLP fallback extraction.")
        return {
            "success": True,
            "error": None,
            "extracted": fallback_nlp_extraction(complaint_data)
        }

    # Gather citizen inputs
    text_input = complaint_data.get("description") or complaint_data.get("text") or ""
    title_input = complaint_data.get("title") or ""
    citizen_name = complaint_data.get("citizen_name") or "Anonymous Citizen"
    location_input = complaint_data.get("location") or ""
    method = complaint_data.get("submission_method") or complaint_data.get("method") or "write"
    attachments = complaint_data.get("attachments") or complaint_data.get("file_references") or []

    prompt = f"""You are an expert Government Public Grievance Intake and Multilingual AI Analyst for the Indian Public Grievance Management System (PGMS).
Your official mandate is to process citizen grievances submitted in any of three official languages:
1. HINDI (हिन्दी)
2. KANNADA (ಕನ್ನಡ)
3. ENGLISH

Citizen Input Details:
- Submission Method: {method}
- Citizen Name: {citizen_name}
- Initial Title / Topic provided: {title_input}
- Incident Location provided: {location_input}
- Citizen Statement / Notes provided: {text_input}

Available Official Civic Departments:
{json.dumps(DEPARTMENTS, indent=2)}

CRITICAL MULTILINGUAL MANDATES:
1. ACCURATE LANGUAGE DETECTION:
   Detect whether the citizen grievance (voice speech, image text, PDF document, or written statement) is in 'Hindi', 'Kannada', 'English', or 'Multilingual'.
   Also provide the ISO code ('hi', 'kn', 'en', 'multi').

2. SPOKEN VOICE TRANSCRIPTION & ENGLISH CONVERSION:
   If an audio recording / voice file is attached:
   - Grasp and listen to the citizen's spoken voice completely.
   - Accurately transcribe the exact words spoken in the citizen's original language (Devanagari for Hindi, Kannada script for Kannada, or English).
   - Convert and translate that into clear, fluent, grammatically correct English sentences capturing the problem, context, urgency, and any stated landmarks.

3. IMAGE EVIDENCE OCR & CONVERSION:
   If an image / photo is attached:
   - Read and OCR all visible text (printed, handwritten, signboards, official notices, or street names) in Hindi, Kannada, or English.
   - Visually analyze the civic issue shown (e.g. damaged road/pothole, burst water pipe, garbage overflow, live electric wire, non-working streetlight).
   - Convert and translate the grievance into clear English sentences.

4. PDF PETITION EXTRACTION & CONVERSION:
   If a PDF petition is attached:
   - Extract and read all contents in Hindi, Kannada, or English.
   - Convert and translate the full grievance into clear English sentences.

5. WRITTEN TEXT TRANSLATION:
   If the citizen wrote their complaint in Hindi or Kannada, record the original text and translate it into clear English sentences.

6. FORMULATE FORMAL ADMINISTRATIVE RECORD:
   - structured_title: A crisp, professional administrative title in English (e.g., 'Burst Drinking Water Pipeline and Street Flooding in Ward 4').
   - structured_description: Comprehensive official grievance statement in English.
   - english_sentence: A direct, fluent English sentence representation of the citizen's actual words/complaint.
   - detected_department: Exactly one department from the available civic departments list above.
   - incident_location: The specific location, ward, street, or landmark mentioned by the citizen or detected from media (or '{location_input}').
   - priority: 'High' (if hazard, live electric wire, burst water pipeline, contaminated water, sewage overflow, danger to life, or school/hospital emergency) or 'Normal'.
   - directives: 4 numbered, enforceable engineering action directives for the field nodal officer.

Return ONLY a valid JSON object matching this schema:
{{
  "detected_language": "Hindi | Kannada | English | Multilingual",
  "detected_language_code": "hi | kn | en | multi",
  "original_language_text": "Spoken transcript or OCR extracted text in original language (Hindi/Kannada/English)",
  "english_sentence": "Accurate, fluent English sentence translation of the complaint",
  "structured_title": "Formal administrative subject in English",
  "structured_description": "Comprehensive official English grievance description",
  "detected_department": "Exact department name from the list",
  "incident_location": "Identified location/landmark",
  "priority": "High | Normal",
  "directives": "1. Depute team...\\n2. Assess...\\n3. Rectify...\\n4. Upload compliance certificate.",
  "confidence": 0.95
}}
"""

    contents = [prompt]

    # Attach in-memory raw files if provided directly
    if raw_files:
        for rf in raw_files:
            file_bytes = rf.get("bytes")
            mime_type = rf.get("mime_type") or "application/octet-stream"
            filename = rf.get("filename") or "upload"
            if file_bytes:
                try:
                    from google.genai import types
                    part = types.Part.from_bytes(data=file_bytes, mime_type=mime_type)
                    contents.append(part)
                    logger.info(f"Attached in-memory file {filename} ({mime_type}, {len(file_bytes)} bytes) for Gemini extraction")
                except Exception as e:
                    logger.warning(f"Could not attach in-memory file {filename}: {e}")

    # Attach media files from uploads_dir if available
    if uploads_dir and attachments:
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
                    elif ext in ['.mp3', '.wav', '.ogg', '.webm', '.m4a', '.aac']: mime_type = 'audio/webm'
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
            
            # Ensure key fields exist
            if not parsed.get("detected_language"):
                parsed["detected_language"] = detect_script_language(parsed.get("original_language_text", ""))
            if not parsed.get("detected_language_code"):
                parsed["detected_language_code"] = get_language_code(parsed["detected_language"])
            if not parsed.get("english_sentence"):
                parsed["english_sentence"] = parsed.get("structured_description", "")
            if not parsed.get("structured_title"):
                parsed["structured_title"] = title_input or "Citizen Public Grievance"
            if not parsed.get("incident_location"):
                parsed["incident_location"] = location_input or "Incident Site"

            return {
                "success": True,
                "error": None,
                "extracted": parsed
            }
        except Exception as e:
            last_error = e
            logger.warning(f"Model {model_name} failed: {e}. Trying next cascade model...")
            continue

    logger.error(f"All Gemini models failed: {last_error}. Falling back to NLP heuristics.")
    fallback = fallback_nlp_extraction(complaint_data)
    fallback["note"] = f"Gemini API error ({str(last_error)[:100]}). Falling back to NLP heuristics."
    return {
        "success": True,
        "error": str(last_error),
        "extracted": fallback
    }

def extract_multimodal_complaint(
    complaint_data: Dict[str, Any],
    uploads_dir: Path
) -> Dict[str, Any]:
    """
    Backward-compatible wrapper for existing officer extract-ai flow.
    """
    return process_multilingual_complaint(complaint_data, uploads_dir=uploads_dir)

def classify_text_with_gemini(text: str) -> Dict[str, Any]:
    """
    Classifies a raw complaint text (Hindi, Kannada, or English) using Gemini
    into category, department, priority, and provides English translation if required.
    """
    detected_lang = detect_script_language(text)
    lang_code = get_language_code(detected_lang)

    client = get_gemini_client()
    if not client:
        fallback = fallback_nlp_extraction({"description": text, "title": text[:60]})
        return {
            "category": fallback["detected_department"].replace(" Department", "").replace(" Division", "").replace(" Board", ""),
            "department": fallback["detected_department"],
            "confidence": 0.85,
            "priority": fallback["priority"],
            "detected_language": detected_lang,
            "detected_language_code": lang_code,
            "english_translation": fallback["english_sentence"],
            "is_ai": False
        }

    prompt = f"""You are an expert Government Public Grievance Redressal Classifier specializing in Hindi, Kannada, and English.
Analyze this citizen grievance text:
"{text}"

Departments:
{json.dumps(DEPARTMENTS, indent=2)}

Tasks:
1. Detect input language: 'Hindi' | 'Kannada' | 'English'.
2. If text is in Hindi or Kannada, translate it into a clear English sentence.
3. Classify into the most suitable civic Department.
4. Select a concise Category name (e.g., Water Supply, Electricity, Public Works, Sanitation, Street Lighting, Education).
5. Determine priority: 'High' | 'Normal'.

Return ONLY a JSON object:
{{
  "detected_language": "Hindi | Kannada | English",
  "detected_language_code": "hi | kn | en",
  "english_translation": "Clear English translation of the complaint",
  "category": "Short Category Name",
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
            parsed = _parse_json_response(response.text)
            parsed["is_ai"] = True
            return parsed
        except Exception as e:
            logger.warning(f"Classify model {model_name} failed: {e}")
            continue

    fallback = fallback_nlp_extraction({"description": text, "title": text[:60]})
    return {
        "category": fallback["detected_department"].replace(" Department", "").replace(" Division", "").replace(" Board", ""),
        "department": fallback["detected_department"],
        "confidence": 0.80,
        "priority": fallback["priority"],
        "detected_language": detected_lang,
        "detected_language_code": lang_code,
        "english_translation": fallback["english_sentence"],
        "is_ai": False
    }
