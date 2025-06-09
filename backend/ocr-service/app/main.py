from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
import pytesseract
from pdf2image import convert_from_bytes
import base64
import logging
import traceback
import requests
import tempfile
import os

logging.basicConfig(level=logging.INFO)
app = FastAPI()

class OCRRequest(BaseModel):
    file_b64: str

@app.post("/analyze")
async def analyze(req: OCRRequest):
    try:
        # Decode base64 PDF content
        content = base64.b64decode(req.file_b64)

        # Convert PDF to images for OCR
        images = convert_from_bytes(content)
        if not images:
            raise ValueError("No pages found in the PDF.")

        # Run OCR on all pages
        text = "".join([pytesseract.image_to_string(img) for img in images])
        if not text.strip():
            raise ValueError("OCR did not extract any text.")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            temp_pdf.write(content)
            temp_pdf_path = temp_pdf.name

        with open(temp_pdf_path, 'rb') as f:
            response = requests.post('http://127.0.0.1:5001/api/v0/add', files={'file': f})
            response.raise_for_status()
            ipfs_result = response.json()
            cid = ipfs_result['Hash']
            print("✅ Uploaded to IPFS:", cid)

        os.remove(temp_pdf_path)  

        return {"text": text, "cid": cid}

    except HTTPException as he:
        raise he
    except Exception as e:
        logging.error(f"OCR failed: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OCR error: {str(e)}"
        )
