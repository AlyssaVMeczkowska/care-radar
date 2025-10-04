import os
import csv
import ast
from clickhouse_driver import Client
from dotenv import load_dotenv
from datetime import datetime

# --- Load Environment Variables ---
# This line looks for a .env file in the current directory and loads its variables
load_dotenv() 

# --- Database Configuration ---
# Safely get variables from the environment, with default values as fallbacks
CLICKHOUSE_HOST = os.getenv('CLICKHOUSE_HOST', 'localhost')
CLICKHOUSE_PORT = int(os.getenv('CLICKHOUSE_PORT', 9000))
DATABASE_NAME = os.getenv('CLICKHOUSE_DB')
CLICKHOUSE_USER = os.getenv('CLICKHOUSE_USER')
CLICKHOUSE_PASSWORD = os.getenv('CLICKHOUSE_PASSWORD')

TABLE_NAME = 'patients'
DATA_FILE = 'synthetic_patients.csv'


def get_clickhouse_client():
    """Establishes connection to the ClickHouse server."""
    try:
        client = Client(
            host=CLICKHOUSE_HOST,
            port=CLICKHOUSE_PORT,
            user=CLICKHOUSE_USER,
            password=CLICKHOUSE_PASSWORD,
            database=DATABASE_NAME
        )
        client.execute('SELECT 1')
        print("✅ Successfully connected to ClickHouse.")
        return client
    except Exception as e:
        print(f"❌ Error connecting to ClickHouse: {e}")
        return None

def create_patients_table(client):
    """Creates the patients table in ClickHouse."""
    create_table_query = f"""
    CREATE TABLE IF NOT EXISTS {DATABASE_NAME}.{TABLE_NAME} (
        patient_id String,
        age Int32,
        conditions Array(String),
        last_a1c_date Date,
        encounter_date DateTime,
        chief_complaint String,
        encounter_type String
    ) ENGINE = MergeTree()
    ORDER BY patient_id;
    """
    try:
        client.execute(f"DROP TABLE IF EXISTS {DATABASE_NAME}.{TABLE_NAME}")
        print(f"🧹 Dropped existing table '{TABLE_NAME}' (if any).")
        client.execute(create_table_query)
        print(f"✅ Table '{TABLE_NAME}' created successfully.")
    except Exception as e:
        print(f"❌ Error creating table: {e}")

def load_data_from_csv(client):
    """Loads data from the generated CSV into the ClickHouse table."""
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            next(reader)  # Skip header row

            processed_rows = []
            for row in reader:
                # Convert data types for each column to match the ClickHouse schema
                processed_row = [
                    row[0],                             # patient_id (String)
                    int(row[1]),                        # age (String -> Int32)
                    ast.literal_eval(row[2]),           # conditions (String -> Array(String))
                    datetime.strptime(row[3], '%Y-%m-%d').date(), # last_a1c_date (String -> Date)
                    datetime.strptime(row[4], '%Y-%m-%d %H:%M:%S'), # encounter_date (String -> DateTime)
                    row[5],                             # chief_complaint (String)
                    row[6]                              # encounter_type (String)
                ]
                processed_rows.append(processed_row)

            client.execute(
                f'INSERT INTO {DATABASE_NAME}.{TABLE_NAME} VALUES',
                processed_rows
            )
            print(f"✅ Data from '{DATA_FILE}' loaded successfully into '{TABLE_NAME}'.")
    except Exception as e:
        print(f"❌ Error loading data from CSV: {e}")

def main():
    """Main function to set up the database and load data."""
    client = get_clickhouse_client()
    if client:
        create_patients_table(client)
        load_data_from_csv(client)
        
        # Verify the number of records loaded
        count = client.execute(f'SELECT count() FROM {DATABASE_NAME}.{TABLE_NAME}')[0][0]
        print(f"📊 Verification: Found {count} records in the '{TABLE_NAME}' table.")
        
        client.disconnect()


if __name__ == "__main__":
    main()