from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class FraudCheckRequest(BaseModel):
    hash: str

@app.post("/check")
def check_fraud(req: FraudCheckRequest):
    if req.hash[-1] in "02468":
        return {"is_legit": True}
    return {"is_legit": False}
