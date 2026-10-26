import os
import sys
from pathlib import Path
from fastapi.testclient import TestClient
sys.path.insert(0, os.path.dirname(__file__))
from main import app

client = TestClient(app)

# 1. Test PDF upload
pdf_sample = b"%PDF-1.4\n1 0 obj\n<< /Title (Citizen Petition - Kannada) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF"
files = {
    "pdfFile": ("complaint_letter.pdf", pdf_sample, "application/pdf")
}
data = {
    "title": "ರಸ್ತೆ ಡಾಂಬರೀಕರಣ ಅರ್ಜಿ",
    "description": "ನಮ್ಮ ಗ್ರಾಮದ ಮುಖ್ಯ ರಸ್ತೆ ಸಂಪೂರ್ಣ ಹಾಳಾಗಿದೆ, ಮಳೆಗಾಲದಲ್ಲಿ ಸಂಚಾರ ಅಸಾಧ್ಯವಾಗಿದೆ.",
    "location": "ಗ್ರಾಮ ಪಂಚಾಯತ್ ವ್ಯಾಪ್ತಿ",
    "method": "pdf"
}
res = client.post("/api/multimodal/process", data=data, files=files)
print("PDF test status:", res.status_code)
assert res.status_code == 200
pdata = res.json()
print("PDF Detected Language:", pdata.get("detected_language"))
print("PDF English Translation:", pdata.get("english_sentence"))
print("PDF Structured Title:", pdata.get("structured_title"))

# 2. Test Image upload
# 1x1 transparent PNG
png_bytes = bytes.fromhex("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082")
img_files = {
    "imageFile": ("pothole_photo.png", png_bytes, "image/png")
}
img_data = {
    "title": "सड़क पर बड़ा गड्ढा",
    "description": "यह तस्वीर मुख्य बाजार की है जहां बड़ा गड्ढा है और पानी भरा हुआ है।",
    "location": "मुख्य बाजार",
    "method": "image"
}
res_img = client.post("/api/multimodal/process", data=img_data, files=img_files)
print("\nImage test status:", res_img.status_code)
assert res_img.status_code == 200
idata = res_img.json()
print("Image Detected Language:", idata.get("detected_language"))
print("Image English Translation:", idata.get("english_sentence"))
print("Image Structured Title:", idata.get("structured_title"))
print("\nPDF AND IMAGE MULTIMODAL INTAKE TESTS PASSED!")
