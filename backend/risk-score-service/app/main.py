from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class RiskScoreRequest(BaseModel):
    text: str

@app.post("/score")
def score_risk(req: RiskScoreRequest):
    risk = 0.5
    if "overdue" in req.text.lower():
        risk = 0.8
    elif "paid" in req.text.lower():
        risk = 0.3
    return {"risk": risk}
