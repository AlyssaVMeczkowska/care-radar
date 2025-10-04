# CareRadar
## Inspiration

In today's healthcare landscape, clinicians are inundated with data but starved for insights. They spend hours manually reviewing patient charts and running cumbersome reports, a reactive process that delays care for at-risk patients. We were inspired to build a tool that flips this paradigm on its head. We imagined a "command center" that would empower clinicians to ask complex questions in plain English and, more importantly, proactively identify clinical risks before they become emergencies. Our goal was to create a tool that feels less like a database and more like an intelligent assistant, enabling a shift from reactive to proactive, data-driven healthcare.

## What it does

CareRadar is a Clinical AI Command Center designed to provide clinicians with rapid, actionable insights from patient data. It operates in three primary modes:

* **Query Mode**: Allows clinicians to ask natural language questions like, "Which diabetic patients over 60 haven't had an A1c test in six months?". The system retrieves the relevant patient list and uses AI to generate a concise narrative summary of the findings.
* **Radar Mode**: Works 24/7 to automatically scan population data for emerging trends and risks. It identifies anomalies like spikes in chest pain encounters or clusters of uncontrolled COPD cases, then generates prioritized, actionable alerts for clinical staff.
* **Patient Detail View**: Provides a comprehensive 360-degree view of a single patient, including their risk score, care gaps, allergies, and a full timeline of recent medical events, all summarized by an AI assistant to highlight the most critical information.

## How we built it

We built CareRadar on a modern, high-performance tech stack designed for speed and intelligence:

* **Backend**: We developed a robust API using **Python** with **FastAPI**, which serves all the data to our frontend.
* **Database**: We chose **ClickHouse**, running in **Docker**, for its incredible speed in handling large-scale analytical queries—perfect for scanning thousands of patient records in milliseconds. We generated a realistic synthetic dataset of 1,000 patients using a Python script and the Faker library.
* **AI and NLP**: The core of our application's intelligence is the **OpenAI API (gpt-4o-mini)**. We leveraged it to interpret natural language queries, generate narrative summaries from query results, and create concise clinical summaries for individual patients.
* **Frontend**: The user interface is a dynamic single-page application built with **React** and styled with **Tailwind CSS**. For data visualization, we used **Recharts** to create the interactive charts on our Analytics dashboard.
* **Monitoring**: From the start, we integrated **Datadog's Model Context Protocol (MCP)** using the `ddtrace` library. This gave us invaluable, real-time observability into our OpenAI API calls, allowing us to monitor performance, latency, and costs throughout the hackathon.

## Challenges we ran into

* **Dependency Management**: We initially faced a significant blocker when our `pip install` command failed. We discovered that the pinned version of the Datadog library was incompatible with our modern Python 3.13 environment. We resolved this by removing the version pin in our `requirements.txt` file to allow pip to fetch the latest compatible version.
* **Version Control Mishap**: In the heat of the hackathon, an incorrect merge messed up our main branch. It was a stressful moment, but it forced us to pause and carefully use `git reset` to revert to a stable state. It was a powerful lesson in the importance of disciplined version control, even when moving quickly.
* **AI Prompt Engineering**: Getting the AI to reliably return structured JSON for our clinical alerts was a major challenge. It took several iterations of careful prompt engineering—specifying the exact fields, data types, and desired tone—to get consistent, machine-readable output from the model.

## Accomplishments that we're proud of

* **The Natural Language Interface**: We're incredibly proud of the Query Mode. Building an interface that allows a non-technical user to ask a complex question in plain English and get an immediate, accurate answer is a huge accomplishment.
* **Proactive Alerting System**: The Radar Mode is the heart of our project's vision. Successfully creating a system that can automatically surface risks from a sea of data feels like a genuine step forward for proactive healthcare.
* **Full End-to-End Integration**: In just a weekend, we managed to wire together a complex, full-stack application, integrating a frontend, backend, database, and multiple third-party APIs (OpenAI and Datadog) into a cohesive, functional prototype.

## What we learned

* **LLMs as "Co-pilots"**: We learned that Large Language Models are more than just text generators. We used them as a co-pilot for data analysis, summarization, and even structured data generation. This opened our eyes to how AI can augment, rather than replace, professional workflows.
* **The Power of Observability**: Integrating Datadog from the start wasn't an afterthought; it was a lifesaver. Being able to see exactly what prompts we were sending, how long the AI was taking, and where errors were occurring saved us countless hours of debugging.
* **Infrastructure as Code**: Using `docker-compose` to manage our ClickHouse database meant that our database setup was reproducible, consistent, and easy to manage.

## What's next for CareRadar

* **Real-time NL-to-SQL**: Our next major step is to fully implement the Natural Language-to-SQL translation layer, moving beyond hardcoded queries to dynamically generate ClickHouse SQL from user questions.
* **Enhanced Radar Analytics**: We plan to expand the Radar Mode's capabilities to include more sophisticated analytics, such as geographic cluster detection (e.g., mapping flu outbreaks) and multi-factor risk stratification.
* **Real-Time Push Notifications**: We want to replace the current polling mechanism for alerts with WebSockets to provide instant, real-time push notifications to clinicians as soon as a risk is detected.
* **Personalization and User Accounts**: We envision a future where clinicians can log in, save their most common queries, and customize the Radar Mode to monitor the specific patient panels they are responsible for.