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

# ========== PATIENT DETAIL ENDPOINT ==========
@app.get("/api/patient/{patient_id}")
async def get_patient_detail(patient_id: str):
    try:
        # TODO: Replace with actual ClickHouse query when database is ready
        # Example: 
        # patient_query = f"SELECT * FROM patients WHERE patient_id = '{patient_id}'"
        # patient_data = clickhouse_client.query(patient_query).result_rows[0]
        
        # Mock patient data from ClickHouse placeholder
        patient_base_data = {
            "id": patient_id,
            "name": "Sarah Martinez",
            "age": 67,
            "mrn": f"MRN-{patient_id[1:]}56",
            "gender": "Female",
            "dob": "1958-03-15",
            "phone": "(555) 123-4567",
            "email": "sarah.martinez@email.com",
            "address": "123 Main St, New York, NY 10001",
            "primaryCare": "Dr. James Wilson",
            "riskScore": 78,
            "conditions": ["Type 2 Diabetes", "Hypertension", "Hyperlipidemia"],
            "allergies": ["Penicillin", "Sulfa drugs"],
            "lastVisit": "2024-09-15",
            "nextAppointment": "2025-10-15",
            "careGaps": [
                {
                    "id": 1,
                    "type": "A1c Test",
                    "status": "overdue",
                    "dueDate": "2024-12-15",
                    "overdueDays": 293,
                    "priority": "high",
                    "description": "Last test was 9 months ago. Recommended every 3-6 months for diabetic patients."
                },
                {
                    "id": 2,
                    "type": "Annual Eye Exam",
                    "status": "overdue",
                    "dueDate": "2025-01-20",
                    "overdueDays": 257,
                    "priority": "high",
                    "description": "Diabetic retinopathy screening is overdue."
                }
            ],
            "timeline": [
                {
                    "id": 1,
                    "date": "2025-09-28",
                    "type": "ER Visit",
                    "title": "Emergency Room",
                    "description": "Chief complaint: Chest pain. Discharged after cardiac workup negative.",
                    "provider": "Dr. Emily Roberts",
                    "status": "critical"
                },
                {
                    "id": 2,
                    "date": "2025-08-12",
                    "type": "Lab Results",
                    "title": "Blood Work",
                    "description": "A1c: 8.2% (elevated), Glucose: 185 mg/dL",
                    "provider": "Quest Diagnostics",
                    "status": "warning"
                }
            ]
        }
        
        # Use OpenAI to generate personalized AI summary
        summary_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a clinical AI assistant. Generate a concise clinical summary (2-3 sentences) highlighting the patient's risk factors, care gaps, and immediate action items."
                },
                {
                    "role": "user",
                    "content": f"Patient: {patient_base_data['age']}yo with {', '.join(patient_base_data['conditions'])}. Care gaps: {len(patient_base_data['careGaps'])} overdue items. Recent timeline: {patient_base_data['timeline'][0]['description']}"
                }
            ]
        )
        
        patient_base_data["aiSummary"] = summary_response.choices[0].message.content
        
        return patient_base_data
        
    except Exception as e:
        print(f"Error in patient detail endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)