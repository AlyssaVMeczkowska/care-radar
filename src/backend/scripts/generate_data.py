import csv
from faker import Faker
import random
from datetime import datetime, timedelta

# --- Configuration ---
NUM_RECORDS = 1000
OUTPUT_FILE = 'synthetic_patients.csv'

# --- Initialize Faker ---
fake = Faker()

# --- Sample Data ---
conditions = [
    "Hypertension", "Type 2 Diabetes", "Asthma", "Coronary Artery Disease",
    "Chronic Kidney Disease", "COPD", "Atrial Fibrillation", "Depression",
    "Anxiety", "Osteoarthritis", "Rheumatoid Arthritis", "Hypothyroidism"
]

chief_complaints = [
    "Chest pain", "Abdominal pain", "Headache", "Shortness of breath",
    "Fever", "Cough", "Back pain", "Fatigue", "Dizziness", "Nausea and vomiting",
    "Annual physical", "Medication refill"
]

encounter_types = ["Inpatient", "Outpatient", "Emergency", "Telehealth"]


def create_synthetic_patient(patient_id):
    """Generates a single synthetic patient record."""
    age = random.randint(18, 90)
    num_conditions = random.randint(0, 4)
    patient_conditions = random.sample(conditions, num_conditions)

    # Generate a recent date for last_a1c_date
    last_a1c_date = (datetime.now() - timedelta(days=random.randint(10, 365))).date()

    # Generate a recent encounter date
    encounter_date = fake.date_time_between(start_date="-1y", end_date="now")

    return {
        "patient_id": patient_id,
        "age": age,
        "conditions": patient_conditions,
        "last_a1c_date": last_a1c_date.strftime('%Y-%m-%d'),
        "encounter_date": encounter_date.strftime('%Y-%m-%d %H:%M:%S'),
        "chief_complaint": random.choice(chief_complaints),
        "encounter_type": random.choice(encounter_types)
    }

def main():
    """Generates a CSV file with synthetic patient data."""
    header = [
        "patient_id", "age", "conditions", "last_a1c_date",
        "encounter_date", "chief_complaint", "encounter_type"
    ]

    with open(OUTPUT_FILE, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(header)

        for i in range(NUM_RECORDS):
            patient_id = fake.uuid4()
            patient_record = create_synthetic_patient(patient_id)

            # Format the array of strings for ClickHouse CSV format
            conditions_str = "['" + "','".join(patient_record["conditions"]) + "']"

            writer.writerow([
                patient_record["patient_id"],
                patient_record["age"],
                conditions_str,
                patient_record["last_a1c_date"],
                patient_record["encounter_date"],
                patient_record["chief_complaint"],
                patient_record["encounter_type"]
            ])

    print(f"Successfully generated {NUM_RECORDS} records in '{OUTPUT_FILE}'.")


if __name__ == "__main__":
    main()
