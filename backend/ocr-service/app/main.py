from fastapi import FastAPI, UploadFile, HTTPException, status
import pytesseract
import hashlib
from pdf2image import convert_from_bytes
import logging
import traceback

# Setup logging
logging.basicConfig(level=logging.INFO)

app = FastAPI()

@app.post("/analyze")
async def analyze(file: UploadFile):
    try:
        # Validate file type
        if file.content_type != 'application/pdf':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF files are supported."
            )

        # Read file content
        content = await file.read()

        # Convert PDF to images
        try:
            images = convert_from_bytes(content)
            if not images:
                raise ValueError("No pages found in the PDF.")
        except Exception as e:
            logging.error(f"PDF conversion failed: {e}")
            traceback.print_exc()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"PDF to image conversion failed: {str(e)}"
            )

        # Perform OCR
        try:
            text = "".join([pytesseract.image_to_string(img) for img in images])
            if not text.strip():
                raise ValueError("OCR did not extract any text.")
        except Exception as e:
            logging.error(f"OCR failed: {e}")
            traceback.print_exc()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"OCR process failed: {str(e)}"
            )

        # Generate hash & mock CID
        hash_val = hashlib.sha256(content).hexdigest()
        cid = f"bafy{hash_val[:10]}"

        return {"text": text, "hash": hash_val, "cid": cid}

    except HTTPException as he:
        raise he  # Preserve HTTPException directly
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )
