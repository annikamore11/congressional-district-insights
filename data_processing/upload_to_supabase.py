import pandas as pd
from supabase import create_client
import os
from dotenv import load_dotenv
import numpy as np
import json

load_dotenv('../backend/.env')

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

def upload_csv_in_batches(csv_path, table_name, batch_size=1000):
    # Read CSV
    df = pd.read_csv(csv_path, na_values=['', ' ', 'NA', 'N/A', 'null'])
    
    print(f"\nOriginal shape: {df.shape}")
    print(f"Null counts:\n{df.isnull().sum()}\n")
    
    # CRITICAL: Fill NaN BEFORE converting to dict
    # Option 1: Replace all NaN with None
    df = df.replace({np.nan: None})
    
    # Option 2: Or use fillna (choose one approach)
    # df = df.fillna(value=np.nan).replace({np.nan: None})
    
    # Verify NaN are gone
    print(f"NaN remaining after cleaning: {df.isnull().sum().sum()}")
    
    # Convert to records
    records = df.to_dict('records')
    
    # Debug first record
    print("\nFirst record sample:")
    print(json.dumps(records[0], indent=2, default=str))
    
    total_rows = len(records)
    successful = 0
    failed = 0
    
    for i in range(0, total_rows, batch_size):
        batch = records[i:i + batch_size]
        batch_num = i//batch_size + 1
        
        try:
            response = supabase.table(table_name).insert(batch).execute()
            successful += len(batch)
            print(f"✓ Batch {batch_num}: {len(batch)} rows")
        except Exception as e:
            failed += len(batch)
            print(f"✗ Batch {batch_num} failed: {e}")
            
            # Show problematic record
            if batch_num == 1:
                print("\nFirst record in failed batch:")
                print(json.dumps(batch[0], indent=2, default=str))
            
    print(f"\n{'='*60}")
    print(f"Total: {total_rows} | Success: {successful} | Failed: {failed}")
    print(f"{'='*60}")



if __name__ == "__main__":
    upload_csv_in_batches(
        csv_path="./cleaned_data/chr_trends_cleaned.csv",
        table_name="county_health_ratings_trends",
        batch_size=1000
    )