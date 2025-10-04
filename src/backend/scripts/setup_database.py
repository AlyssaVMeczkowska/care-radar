import csv
from clickhouse_driver import Client

# --- Database Configuration ---
CLICKHOUSE_HOST = 'localhost'
CLICKHOUSE_PORT = 9000
DATABASE_NAME = 'default'
TABLE_NAME = 'patients'
DATA_FILE = 'synthetic_patients.csv'


def get_clickhouse_client():
    """Establishes connection to the ClickHouse server."""
    try:
        client = Client(host=CLICKHOUSE_HOST, port=CLICKHOUSE_PORT)
        print("Successfully connected to ClickHouse.")
        return client
    except Exception as e:
        print(f"Error connecting to ClickHouse: {e}")
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
        print(f"Dropped existing table '{TABLE_NAME}' (if any).")
        client.execute(create_table_query)
        print(f"Table '{TABLE_NAME}' created successfully.")
    except Exception as e:
        print(f"Error creating table: {e}")


def load_data_from_csv(client):
    """Loads data from the generated CSV into the ClickHouse table."""
    try:
        with open(DATA_FILE, 'r') as f:
            # Skip header
            next(f)
            # Use generator to avoid loading all data into memory
            reader = csv.reader(f)
            data_generator = (row for row in reader)

            # Clickhouse-driver can insert directly from an iterable
            # Note: The data types must match the table schema.
            # The script `generate_data.py` prepares the data in the correct format.
            # The driver correctly handles converting string representations of numbers/dates.
            client.execute(
                f'INSERT INTO {DATABASE_NAME}.{TABLE_NAME} VALUES',
                data_generator,
                types_check=True
            )
        print(f"Data from '{DATA_FILE}' loaded successfully into '{TABLE_NAME}'.")
    except Exception as e:
        print(f"Error loading data from CSV: {e}")


def main():
    """Main function to set up the database and load data."""
    client = get_clickhouse_client()
    if client:
        create_patients_table(client)
        load_data_from_csv(client)
        # Verify count
        count = client.execute(f'SELECT count() FROM {DATABASE_NAME}.{TABLE_NAME}')[0][0]
        print(f"Verification: Found {count} records in the '{TABLE_NAME}' table.")
        client.disconnect()


if __name__ == "__main__":
    main()
