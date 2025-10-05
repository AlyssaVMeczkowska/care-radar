# CareRadar 
*A Clinical AI Command Center for Proactive, Data-Driven Healthcare*

---

## Inspiration
In today's healthcare landscape, clinicians are inundated with data but starved for insights. They spend hours manually reviewing patient charts and running cumbersome reports—a reactive process that delays care for at-risk patients.  

We built CareRadar to flip this paradigm: a **command center** that empowers clinicians to ask complex questions in plain English and proactively identify risks *before* they become emergencies.  

Our goal is to create a tool that feels less like a database and more like an intelligent assistant, enabling the shift from reactive to proactive, data-driven healthcare.

---

## Features

### Query Mode
- Ask natural language questions such as:  
  *“Which diabetic patients over 60 haven’t had an A1c test in six months?”*  
- Retrieves the relevant patient list  
- Generates a concise AI-powered narrative summary  

### Radar Mode
- Continuously scans population data for **emerging risks**  
- Detects anomalies like:  
  - Spikes in chest pain encounters  
  - Clusters of uncontrolled COPD cases  
- Generates prioritized, actionable alerts for staff  

### Analytics Dashboard
- Provides a **real-time overview of clinical insights and trends**  
- Key features:  
  - Patient volume trends (admissions & encounters)  
  - Encounter type distribution (Emergency, Inpatient, Outpatient, Telehealth)  
  - Top conditions and chief complaints  
- Interactive charts and graphs to make population health patterns easy to understand  

---

## Tech Stack

- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) (Python)  
- **Database**: [ClickHouse](https://clickhouse.com/) in Docker  
  - Includes synthetic dataset of 1,000 patients generated with Python + Faker  
- **AI / NLP**: [OpenAI API](https://platform.openai.com/) (`gpt-4o-mini`) for:  
  - Natural language query interpretation  
  - Narrative summaries  
  - Clinical detail views  
- **Frontend**: [React](https://react.dev/) + [Tailwind CSS](https://tailwindcss.com/)  
  - Interactive analytics with [Recharts](https://recharts.org/)  
- **Monitoring**: [Datadog MCP](https://www.datadoghq.com/) + `ddtrace` for real-time observability  

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/your-username/care-radar.git
cd care-radar

# Start backend (FastAPI + ClickHouse in Docker)
docker-compose up --build

# Install frontend dependencies
cd frontend
npm install
npm start
```

## Use Cases
- Identify diabetic patients overdue for tests  
- Detect spikes in ER visits for chest pain  
- Surface care gaps in a patient’s longitudinal record  

## Screenshots
**Query Mode:**
<img width="1510" height="859" alt="Screenshot 2025-10-04 at 9 29 29 PM" src="https://github.com/user-attachments/assets/0b3de58c-b200-4523-94bc-0d40c9ee142a" />

---

**Radar Mode:**
<img width="1511" height="863" alt="Screenshot 2025-10-04 at 9 38 19 PM" src="https://github.com/user-attachments/assets/5561e2b7-5e32-435f-8e68-655158560bda" />

---

**Analytics:**
<img width="1512" height="863" alt="Screenshot 2025-10-04 at 9 38 10 PM" src="https://github.com/user-attachments/assets/9858d5c9-94d8-4a8e-bdab-fc3f2ec78074" />

---

## Team
Built with Shantnu Kaushal at the AI Agents Hackathon hosted at Datadog HQ

