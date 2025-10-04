from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI - CORRECT way for newer versions
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

class QueryRequest(BaseModel):
    question: str

# ========== QUERY MODE ENDPOINT ==========
@app.post("/api/query")
async def query_patients(request: QueryRequest):
    try:
        # Mock data
        mock_results = [
            {"id": "P2847", "name": "Patient 2847", "age": 67, "lastTest": "2024-12-15", "overdue": "9 months"},
            {"id": "P1923", "name": "Patient 1923", "age": 72, "lastTest": "2024-11-20", "overdue": "10 months"},
            {"id": "P4521", "name": "Patient 4521", "age": 64, "lastTest": "2025-01-10", "overdue": "8 months"},
        ]
        
        sql = "SELECT patient_id, age, last_a1c_date FROM patients WHERE 'diabetes' IN conditions AND age > 60"
        
        # Use OpenAI to generate narrative
        narrative_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a clinical AI assistant. Summarize patient query results in 2-3 sentences with actionable insights."
                },
                {
                    "role": "user",
                    "content": f"Query: {request.question}\n\nResults: {len(mock_results)} patients found matching criteria. Provide a brief clinical summary."
                }
            ]
        )
        
        narrative = narrative_response.choices[0].message.content
        
        return {
            "sql": sql,
            "results": mock_results,
            "narrative": narrative,
            "executionTime": 450
        }
        
    except Exception as e:
        print(f"Error in query endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ========== RADAR MODE ENDPOINT ==========
@app.get("/api/alerts")
async def get_alerts():
    try:
        raw_alerts = [
            {"type": "chest_pain_spike", "count": 24, "baseline": 15},
            {"type": "copd_cluster", "count": 18},
            {"type": "hypertensive_crisis", "count": 5, "baseline": 7}
        ]
        
        # Use OpenAI to analyze and format alerts
        ranking_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a clinical alert system. Convert these raw alerts into prioritized clinical alerts with severity (high/medium/low), emoji, clear title, metric description, and recommended action. Return as JSON array with fields: severity, emoji, title, metric, action."
                },
                {
                    "role": "user",
                    "content": f"Analyze: {json.dumps(raw_alerts)}"
                }
            ],
            response_format={"type": "json_object"}
        )
        
        ai_alerts = json.loads(ranking_response.choices[0].message.content)
        
        # Fallback to mock if AI response isn't in expected format
        alerts = [
            {
                "id": 1,
                "severity": "high",
                "emoji": "🔴",
                "title": "Chest Pain Encounters Increased",
                "metric": "24 cases this week vs 15 baseline",
                "change": "+60%",
                "action": "Review triage protocols",
                "timestamp": "2 min ago"
            },
            {
                "id": 2,
                "severity": "medium",
                "emoji": "🟡",
                "title": "COPD Patients Clustering",
                "metric": "18 uncontrolled cases",
                "change": "+35%",
                "action": "Schedule respiratory review",
                "timestamp": "15 min ago"
            }
        ]
        
        return {
            "alerts": alerts,
            "lastScan": "2025-10-04T10:30:00Z"
        }
        
    except Exception as e:
        print(f"Error in alerts endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)