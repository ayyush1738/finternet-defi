from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
import pytesseract
import hashlib
from pdf2image import convert_from_bytes
import base64
import logging
import traceback

logging.basicConfig(level=logging.INFO)
app = FastAPI()

class OCRRequest(BaseModel):
    file_b64: str

@app.post("/analyze")
async def analyze(req: OCRRequest):
    try:
        content = base64.b64decode(req.file_b64)

        images = convert_from_bytes(content)
        if not images:
            raise ValueError("No pages found in the PDF.")

        text = "".join([pytesseract.image_to_string(img) for img in images])
        if not text.strip():
            raise ValueError("OCR did not extract any text.")

        hash_val = hashlib.sha256(content).hexdigest()
        cid = f"bafy{hash_val[:10]}"

        return {"text": text, "hash": hash_val, "cid": cid}

    except HTTPException as he:
        raise he
    except Exception as e:
        logging.error(f"OCR failed: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"OCR error: {str(e)}")
