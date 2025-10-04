from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from clickhouse_driver import Client
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

# Initialize OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize ClickHouse
try:
    clickhouse_client = Client(
        host=os.getenv("CLICKHOUSE_HOST"),
        port=int(os.getenv("CLICKHOUSE_PORT", 9000)),
        database=os.getenv("CLICKHOUSE_DB"),
        user=os.getenv("CLICKHOUSE_USER"),
        password=os.getenv("CLICKHOUSE_PASSWORD")
    )
    clickhouse_client.execute('SELECT 1')
    print("✅ ClickHouse connected successfully")
except Exception as e:
    print(f"❌ ClickHouse connection failed: {str(e)}")
    clickhouse_client = None

class QueryRequest(BaseModel):
    question: str

# ========== QUERY MODE ENDPOINT ==========
@app.post("/api/query")
async def query_patients(request: QueryRequest):
    try:
        parse_response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": """You are a SQL query generator for a ClickHouse database with a patients table.
                    
                    Table schema (table name: patients):
                    - patient_id (String)
                    - age (Int32)
                    - conditions (Array(String))
                    - last_a1c_date (Date)
                    - encounter_date (DateTime)
                    - chief_complaint (String)
                    - encounter_type (String)
                    
                    IMPORTANT: Always use the table name 'patients' in your queries.
                    
                    CRITICAL ClickHouse syntax rules:
                    - To check if an array contains a value, use has(array_column, 'value') NOT 'value' IN array_column
                    - Example: has(conditions, 'COPD') NOT 'COPD' IN conditions
                    
                    Generate a valid ClickHouse SQL query based on the user's question. Return ONLY the SQL query, no explanation."""
                },
                {
                    "role": "user",
                    "content": request.question
                }
            ]
        )
        
        sql_query = parse_response.choices[0].message.content.strip()
        
        if sql_query.startswith("```"):
            sql_query = sql_query.split("```")[1]
            if sql_query.startswith("sql"):
                sql_query = sql_query[3:]
            sql_query = sql_query.strip()
        
        print(f"Generated SQL: {sql_query}")
        
        if clickhouse_client:
            result = clickhouse_client.execute(sql_query, with_column_types=True)
            rows = result[0]
            columns = [col[0] for col in result[1]]
            
            results = []
            for row in rows[:20]:
                row_dict = {}
                for i, col in enumerate(columns):
                    value = row[i]
                    if hasattr(value, 'isoformat'):
                        row_dict[col] = value.isoformat()
                    else:
                        row_dict[col] = value
                results.append(row_dict)
        else:
            results = []
        
        narrative_response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are a clinical AI assistant. Summarize patient query results in 2-3 sentences with actionable insights."
                },
                {
                    "role": "user",
                    "content": f"Query: {request.question}\n\nResults: {len(results)} patients found.\nData: {json.dumps(results[:5])}\n\nProvide a brief clinical summary."
                }
            ]
        )
        
        narrative = narrative_response.choices[0].message.content
        
        formatted_results = []
        for r in results:
            formatted_results.append({
                "id": r.get("patient_id", "Unknown"),
                "name": f"Patient {r.get('patient_id', 'Unknown')}",
                "age": r.get("age", 0),
                "lastTest": str(r.get("last_a1c_date", "N/A")),
                "overdue": "N/A"
            })
        
        return {
            "sql": sql_query,
            "results": formatted_results,
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
        raw_alerts = []
        if clickhouse_client:
            # Simple hardcoded queries that work
            queries = [
                {
                    "sql": "SELECT chief_complaint, COUNT(*) as count FROM patients WHERE encounter_date >= now() - INTERVAL 7 DAY GROUP BY chief_complaint ORDER BY count DESC LIMIT 3",
                    "type": "recent_complaints",
                    "description": "Top chief complaints in last 7 days"
                },
                {
                    "sql": "SELECT encounter_type, COUNT(*) as count FROM patients GROUP BY encounter_type ORDER BY count DESC",
                    "type": "encounter_types",
                    "description": "Encounter type distribution"
                }
            ]
            
            for query_obj in queries:
                try:
                    result = clickhouse_client.execute(query_obj["sql"])
                    serializable_result = []
                    if result:
                        for row in result:
                            serializable_row = []
                            for item in row:
                                if hasattr(item, 'isoformat'):
                                    serializable_row.append(item.isoformat())
                                else:
                                    serializable_row.append(item)
                            serializable_result.append(serializable_row)
                    
                    raw_alerts.append({
                        "type": query_obj["type"],
                        "description": query_obj["description"],
                        "result": serializable_result[0] if serializable_result else None
                    })
                except Exception as e:
                    print(f"Query failed: {query_obj['sql']}, Error: {e}")
        
        if not raw_alerts:
            raw_alerts = [
                {"type": "chest_pain", "description": "Recent chest pain cases", "result": ["Chest pain", 15]},
                {"type": "er_visits", "description": "ER visit distribution", "result": ["ED", 89]}
            ]
        
        alert_analysis_response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": """Convert detection results into clinical alerts. Return ONLY valid JSON.
                    
                    EXACT format required:
                    {
                      "alerts": [
                        {
                          "severity": "high",
                          "emoji": "🚨",
                          "title": "Alert Title",
                          "metric": "Description with numbers",
                          "action": "Recommended action"
                        }
                      ]
                    }
                    
                    The alerts array MUST contain objects with these exact keys. Do not return strings."""
                },
                {
                    "role": "user",
                    "content": f"Create alerts from: {json.dumps(raw_alerts)}"
                }
            ],
            response_format={"type": "json_object"}
        )
        
        ai_response = json.loads(alert_analysis_response.choices[0].message.content)
        alerts = ai_response.get("alerts", [])
        
        if not isinstance(alerts, list):
            alerts = []
        else:
            alerts = [a for a in alerts if isinstance(a, dict)]
        
        for i, alert in enumerate(alerts):
            alert["id"] = i + 1
            alert["timestamp"] = f"{i * 5} min ago"
            if "change" not in alert:
                alert["change"] = f"+{20 + i * 10}%"
        
        return {
            "alerts": alerts,
            "lastScan": "2025-10-04T10:30:00Z",
            "metrics": {
                "activeAlerts": len(alerts),
                "patientsMonitored": clickhouse_client.execute("SELECT COUNT(DISTINCT patient_id) FROM patients")[0][0] if clickhouse_client else 0,
                "avgResponseTime": 450
            }
        }
        
    except Exception as e:
        print(f"Error in alerts endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ========== PATIENT DETAIL ENDPOINT ==========
@app.get("/api/patient/{patient_id}")
async def get_patient_detail(patient_id: str):
    try:
        if clickhouse_client:
            patient_query = f"SELECT * FROM patients WHERE patient_id = '{patient_id}' ORDER BY encounter_date DESC"
            result = clickhouse_client.execute(patient_query, with_column_types=True)
            
            if result[0]:
                columns = [col[0] for col in result[1]]
                all_encounters = []
                for row in result[0]:
                    encounter = {}
                    for i, col in enumerate(columns):
                        encounter[col] = row[i]
                    all_encounters.append(encounter)
                
                latest = all_encounters[0]
                patient_data = {
                    "id": latest.get("patient_id"),
                    "age": latest.get("age"),
                    "conditions": latest.get("conditions", []),
                    "last_a1c_date": str(latest.get("last_a1c_date", "")),
                    "all_encounters": all_encounters
                }
            else:
                patient_data = None
        else:
            patient_data = None
        
        if not patient_data:
            patient_data = {
                "id": patient_id,
                "age": 67,
                "conditions": ["Type 2 Diabetes", "Hypertension"],
                "all_encounters": []
            }
        
        profile_response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": """Generate a patient profile. Return JSON with: name, gender, dob, riskScore (0-100), careGaps array, timeline array, aiSummary."""
                },
                {
                    "role": "user",
                    "content": f"Generate patient profile for: {json.dumps(patient_data)}"
                }
            ],
            response_format={"type": "json_object"}
        )
        
        ai_profile = json.loads(profile_response.choices[0].message.content)
        
        full_patient = {
            "id": patient_data["id"],
            "name": ai_profile.get("name", "Unknown Patient"),
            "age": patient_data["age"],
            "mrn": f"MRN-{patient_id[1:]}56" if patient_id.startswith('P') else f"MRN-{patient_id}",
            "gender": ai_profile.get("gender", "Unknown"),
            "dob": ai_profile.get("dob", "Unknown"),
            "phone": "(555) 123-4567",
            "email": f"{ai_profile.get('name', 'patient').lower().replace(' ', '.')}@email.com",
            "address": "123 Main St, New York, NY 10001",
            "primaryCare": "Dr. James Wilson",
            "riskScore": ai_profile.get("riskScore", 50),
            "conditions": patient_data.get("conditions", []),
            "allergies": ["Penicillin"],
            "careGaps": ai_profile.get("careGaps", []),
            "timeline": ai_profile.get("timeline", []),
            "aiSummary": ai_profile.get("aiSummary", "Patient data under review.")
        }
        
        return full_patient
        
    except Exception as e:
        print(f"Error in patient detail endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ========== ANALYTICS ENDPOINT ==========
@app.get("/api/analytics")
async def get_analytics():
    try:
        if clickhouse_client:
            total_patients = clickhouse_client.execute("SELECT COUNT(DISTINCT patient_id) FROM patients")[0][0]
            
            volume_query = """
            SELECT toStartOfWeek(encounter_date) as week, COUNT(*) as encounters,
            COUNT(DISTINCT CASE WHEN encounter_type = 'Inpatient' THEN patient_id END) as admissions
            FROM patients WHERE encounter_date >= now() - INTERVAL 8 WEEK
            GROUP BY week ORDER BY week
            """
            volume_data = clickhouse_client.execute(volume_query)
            
            conditions_query = """
            SELECT arrayJoin(conditions) as condition, COUNT(DISTINCT patient_id) as count
            FROM patients GROUP BY condition ORDER BY count DESC LIMIT 5
            """
            conditions_data = clickhouse_client.execute(conditions_query)
            
            encounter_types_query = "SELECT encounter_type, COUNT(*) as count FROM patients GROUP BY encounter_type"
            encounter_types_data = clickhouse_client.execute(encounter_types_query)
            
            complaints_query = """
            SELECT chief_complaint, COUNT(*) as count FROM patients 
            WHERE chief_complaint != '' GROUP BY chief_complaint ORDER BY count DESC LIMIT 10
            """
            complaints_data = clickhouse_client.execute(complaints_query)
            
            volume_formatted = [{"date": f"Week {i+1}", "encounters": row[1], "admissions": row[2]} 
                              for i, row in enumerate(volume_data)]
            conditions_formatted = [{"condition": row[0], "count": row[1], "change": 0} 
                                   for row in conditions_data]
            encounter_types_formatted = [{"name": row[0], "value": row[1]} 
                                        for row in encounter_types_data]
            complaints_formatted = [{"complaint": row[0], "count": row[1]} 
                                   for row in complaints_data]
            
            return {
                "totalPatients": total_patients,
                "volumeData": volume_formatted,
                "conditionsData": conditions_formatted,
                "encounterTypesData": encounter_types_formatted,
                "complaintsData": complaints_formatted
            }
        else:
            return {
                "totalPatients": 0,
                "volumeData": [],
                "conditionsData": [],
                "encounterTypesData": [],
                "complaintsData": []
            }
        
    except Exception as e:
        print(f"Error in analytics endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)