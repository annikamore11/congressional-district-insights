"""Upload one new ACS year to Supabase without duplicating earlier years.

Usage (run from data_processing/):
    python scripts/upload_census_year.py 2025

Steps each year:
  1. Bump `years` and `load_variables(...)` in census_data.R and
     census_economic_data.R, then re-run both to rebuild the cleaned CSVs.
  2. Run this script with the new year.

Only rows for the given year are inserted, and a table that already has rows
for that year is skipped, so re-running is safe.

The database tables have two columns the CSVs don't: `state` (postal code)
and `county` (place name). The backend queries on those, so they're derived
here; rows without them are invisible to the app.
"""
import os
import sys

import numpy as np
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client

TABLES = {
    "census_data": "cleaned_data/census_data.csv",
    "census_economic_data": "cleaned_data/census_economic_data.csv",
}

# State FIPS -> postal code. Puerto Rico (72) is deliberately absent: earlier
# years were loaded with state left null (county filled) for PR; this matches.
FIPS_TO_POSTAL = {
    "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO",
    "09": "CT", "10": "DE", "11": "DC", "12": "FL", "13": "GA", "15": "HI",
    "16": "ID", "17": "IL", "18": "IN", "19": "IA", "20": "KS", "21": "KY",
    "22": "LA", "23": "ME", "24": "MD", "25": "MA", "26": "MI", "27": "MN",
    "28": "MS", "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
    "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND", "39": "OH",
    "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC", "46": "SD",
    "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA",
    "54": "WV", "55": "WI", "56": "WY",
}


def derive_state_county(row):
    """Return (state, county) the way the backend expects them.

    us:     ("US", "United States")
    state:  ("KS", "Kansas")
    county: ("MI", "Ontonagon County")
    congressional district: ("AL", "Congressional District 1 (119th Congress)")
    """
    if row["geography"] == "us":
        return "US", "United States"
    geoid = str(row["GEOID"]).zfill(2) if row["geography"] == "state" else str(row["GEOID"])
    name = row["state_name"]
    county = name if row["geography"] == "state" else name.rsplit(", ", 1)[0]
    return FIPS_TO_POSTAL.get(geoid[:2]), county


def prepare(csv_path, year):
    df = pd.read_csv(csv_path, dtype={"GEOID": str},
                     na_values=["", " ", "NA", "N/A", "null"])
    df = df[df["year"] == year].copy()
    df[["state", "county"]] = df.apply(
        lambda r: pd.Series(derive_state_county(r)), axis=1)
    # Columns with blanks are read as floats; integer DB columns reject "1413.0".
    for c in df.select_dtypes("float").columns:
        nn = df[c].dropna()
        if len(nn) and (nn % 1 == 0).all():
            df[c] = df[c].astype("Int64")
    return df.astype(object).where(df.notna(), None)


def count_year(sb, table, year):
    return (sb.table(table).select("year", count="exact")
            .eq("year", year).limit(1).execute().count)


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    year = int(sys.argv[1])

    load_dotenv("../backend/.env")
    sb = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

    for table, path in TABLES.items():
        existing = count_year(sb, table, year)
        if existing:
            print(f"{table}: already has {existing} rows for {year}, skipping")
            continue
        records = prepare(path, year).to_dict("records")
        if not records:
            print(f"{table}: no {year} rows in {path} - re-run the R script first")
            continue
        for i in range(0, len(records), 1000):
            sb.table(table).insert(records[i:i + 1000]).execute()
        print(f"{table}: inserted {len(records)}, "
              f"now {count_year(sb, table, year)} rows for {year}")


if __name__ == "__main__":
    main()
