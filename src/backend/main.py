from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv
import json
import time
import logging

# Import and configure ddtrace for Datadog
import ddtrace
from ddtrace.llmobs import LLMObs

# --- Configuration & Initialization ---

# Load environment variables from .env file
load_dotenv()

# Set up basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Enable LLM Observability with Datadog
LLMObs.enable()

# Initialize FastAPI app
app = FastAPI()

# --- In-Memory Metrics Store ---
# For a hackathon, in-memory is fine. In production, you'd use Redis or another tool.
metrics = {
    "total_requests": 0,
    "total_errors": 0,
    "total_openai_calls": 0
}

# --- Middleware for Logging and Metrics ---
@app.middleware("http")
async def log_requests_and_metrics(request: Request, call_next):
    metrics["total_requests"] += 1
    start_time = time.time()
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        logging.info(f"Request: {request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.4f}s")
        return response
    except Exception as e:
        metrics["total_errors"] += 1
        process_time = time.time() - start_time
        logging.error(f"Request failed: {request.method} {request.url.path} - Error: {str(e)} - Time: {process_time:.4f}s")
        # Re-raise the exception to be handled by FastAPI's default error handling
        raise e

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- OpenAI Client Initialization ---
# This automatically picks up the OPENAI_API_KEY from your .env file
client = OpenAI()

# --- Pydantic Models ---
class QueryRequest(BaseModel):
    question: str

# --- Helper function to wrap OpenAI calls for Datadog MCP ---
@ddtrace.llmobs.llm(model_name="gpt-4o-mini", name="clinical_summary")
def create_traced_completion(messages):
    """Wraps the OpenAI call to send context to Datadog."""
    metrics["total_openai_calls"] += 1
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
        )
        return response
    except Exception as e:
        logging.error(f"OpenAI API call failed: {str(e)}")
        span = ddtrace.tracer.current_span()
        if span:
            span.set_tag("error", True)
            span.set_tag("error.message", str(e))
        raise

@ddtrace.llmobs.llm(model_name="gpt-4o-mini", name="alert_ranking")
def create_traced_json_completion(messages):
    """Wraps JSON-formatted OpenAI calls for Datadog."""
    metrics["total_openai_calls"] += 1
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            response_format={"type": "json_object"}
        )
        return response
    except Exception as e:
        logging.error(f"OpenAI JSON API call failed: {str(e)}")
        span = ddtrace.tracer.current_span()
        if span:
            span.set_tag("error", True)
            span.set_tag("error.message", str(e))
        raise

# ========== API ENDPOINTS ==========

@app.get("/api/metrics")
async def get_metrics():
    """Exposes internal application metrics."""
    return metrics

# ========== QUERY MODE ENDPOINT ==========
@app.post("/api/query")
async def query_patients(request: QueryRequest):
    try:
        mock_results = [
            {"id": "P2847", "name": "Patient 2847", "age": 67, "lastTest": "2024-12-15", "overdue": "9 months"},
            {"id": "P1923", "name": "Patient 1923", "age": 72, "lastTest": "2024-11-20", "overdue": "10 months"},
            {"id": "P4521", "name": "Patient 4521", "age": 64, "lastTest": "2025-01-10", "overdue": "8 months"},
        ]
        
        sql = "SELECT patient_id, age, last_a1c_date FROM patients WHERE 'diabetes' IN conditions AND age > 60"
        
        # Use OpenAI to generate narrative (NOW TRACED)
        narrative_response = create_traced_completion(
            messages=[
                {"role": "system", "content": "You are a clinical AI assistant. Summarize patient query results in 2-3 sentences with actionable insights."},
                {"role": "user", "content": f"Query: {request.question}\n\nResults: {len(mock_results)} patients found matching criteria. Provide a brief clinical summary."}
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
        logging.error(f"Error in query endpoint: {str(e)}")
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
        
        # Use OpenAI to analyze and format alerts (NOW TRACED)
        ranking_response = create_traced_json_completion(
             messages=[
                {"role": "system", "content": "You are a clinical alert system. Convert these raw alerts into prioritized clinical alerts with severity (high/medium/low), emoji, clear title, metric description, and recommended action. Return as JSON array with fields: severity, emoji, title, metric, action."},
                {"role": "user", "content": f"Analyze: {json.dumps(raw_alerts)}"}
            ]
        )
        
        ai_alerts = json.loads(ranking_response.choices[0].message.content)
        
        alerts = [
            {"id": 1, "severity": "high", "emoji": "🔴", "title": "Chest Pain Encounters Increased", "metric": "24 cases this week vs 15 baseline", "change": "+60%", "action": "Review triage protocols", "timestamp": "2 min ago"},
            {"id": 2, "severity": "medium", "emoji": "🟡", "title": "COPD Patients Clustering", "metric": "18 uncontrolled cases", "change": "+35%", "action": "Schedule respiratory review", "timestamp": "15 min ago"}
        ]
        
        return {
            "alerts": alerts,
            "lastScan": "2025-10-04T10:30:00Z"
        }
        
    except Exception as e:
        logging.error(f"Error in alerts endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ========== PATIENT DETAIL ENDPOINT ==========
@app.get("/api/patient/{patient_id}")
async def get_patient_detail(patient_id: str):
    try:
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
            "careGaps": [
                {"id": 1, "type": "A1c Test", "status": "overdue", "dueDate": "2024-12-15", "overdueDays": 293, "priority": "high", "description": "Last test was 9 months ago. Recommended every 3-6 months for diabetic patients."},
                {"id": 2, "type": "Annual Eye Exam", "status": "overdue", "dueDate": "2025-01-20", "overdueDays": 257, "priority": "high", "description": "Diabetic retinopathy screening is overdue."}
            ],
            "timeline": [
                {"id": 1, "date": "2025-09-28", "type": "ER Visit", "title": "Emergency Room", "description": "Chief complaint: Chest pain. Discharged after cardiac workup negative.", "provider": "Dr. Emily Roberts", "status": "critical"},
                {"id": 2, "date": "2025-08-12", "type": "Lab Results", "title": "Blood Work", "description": "A1c: 8.2% (elevated), Glucose: 185 mg/dL", "provider": "Quest Diagnostics", "status": "warning"}
            ]
        }
        
        # Use OpenAI to generate personalized AI summary (NOW TRACED)
        summary_response = create_traced_completion(
            messages=[
                {"role": "system", "content": "You are a clinical AI assistant. Generate a concise clinical summary (2-3 sentences) highlighting the patient's risk factors, care gaps, and immediate action items."},
                {"role": "user", "content": f"Patient: {patient_base_data['age']}yo with {', '.join(patient_base_data['conditions'])}. Care gaps: {len(patient_base_data['careGaps'])} overdue items. Recent timeline: {patient_base_data['timeline'][0]['description']}"}
            ]
        )
        
        patient_base_data["aiSummary"] = summary_response.choices[0].message.content
        
        return patient_base_data
        
    except Exception as e:
       logging.error(f"Error in patient detail endpoint: {str(e)}")
       raise HTTPException(status_code=500, detail=str(e))

# --- Main Execution ---
if __name__ == "__main__":
    import uvicorn
    # Remember to run with: ddtrace-run python main.py
    uvicorn.run(app, host="0.0.0.0", port=8000)
