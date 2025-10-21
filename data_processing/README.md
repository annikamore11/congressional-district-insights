# Data Processing - District Insights and Congressional Finance App

Data pipeline for collecting, cleaning, and preparing district level data for import into Supabase.

## Purpose

This directory contains scripts and data for:
- Initial database setup with cleaned datasets
- Updating data when new releases come out (new census years, election cycles)
- Processing raw data from multiple sources into a unified format

## Tech Stack

- **R** - Primary data cleaning and processing and Census API queries
- **Python** - Uploading data to Supabase tables
- **Census API** - District data
- **Supabase** - Database storage

## Prerequisites

- R (v4.0 or higher)
- Python (v3.8 or higher)
- Census Bureau API Key
- Supabase account (or your own PostgreSQL database)

## Directory Structure

```
data-processing/
├── README.md                    # This file
├── raw_data/                    # Raw CSV files (DOWNLOAD REQUIRED)
│   ├── chr_trends_csv_2025.csv  # County Health Rankings trends data
│   ├── countypres_2000-2024.csv # MIT Election data
│   └── README.md               # Download instructions
├── cleaned_data/                # Cleaned datasets ready for import
│   ├── census_data.csv
│   ├── census_economic_data.csv
│   ├── chr_trends_cleaned.csv
│   ├── cleaned_countypres_2000-2024.csv
├── scripts/
│   ├── census_data.R           # Fetches dem/educ variables and manipulates
│   ├── census_economic_data.R  # Fetches economic variables and manipulates
│   ├── county_health_ratings.R # Cleans and renames health data
│   ├── electionDataCleaning.R  # Cleans and standardizes election data
│   └── upload_to_supabase.py   # Connects to Supabase/ uploads files into tables
```

## Getting API Keys

### Census Bureau API Key
1. Go to [Census API Key Signup](https://api.census.gov/data/key_signup.html)
2. Fill out the form with your name and email
3. Check your email for the API key
4. Save it for use in R scripts

## Initial Setup (First Time)

If you're setting up the database for the first time, follow these steps:

### Step 1: Update Raw Data (if needed)

Navigate to `raw_data/` directory and follow the instructions in `raw_data/README.md` to update data when new releases come out:

1. **County Health Rankings**
   - Visit: https://www.countyhealthrankings.org/explore-health-rankings/rankings-data-documentation
   - Download latest year's TREND data
   - Save as `chr_trends_csv_2025.csv`

2. **MIT Election Data and Science Lab**
   - Visit: https://electionlab.mit.edu/data#data
   - Download County Presidential Election Returns 2000-2024 (or new year)
   - Save as `countypres_2000-2024.csv`

#### R: Clean All Datasets

```bash
cd scripts/

# Install required R packages (first time only)
Rscript -e "install.packages(c('tidyverse', 'readr', 'dplyr', 'stringr'))"

# Run cleaning scripts
Rscript census_data.R
Rscript clean_economic_data.R
Rscript county_health_ratings.R
Rscript election_data_cleaning.R
```

This will process raw/API data and output cleaned CSVs to `cleaned_data/` directory. In new data releases, cleaning scripts may need to be tweaked for differences in naming etc.

### Step 3: Set Up Supabase Database

#### Create Tables

Go to Supabase Dashboard and create tables for each cleaned_data file.

#### Import Cleaned Data

CSV files are generally too big for Supabase dashboard import. Use `scripts/upload_to_supabase.py` and edit the function calls at the bottom to upload different csvs.

### Step 4: Create SQL Functions

Go to Supabase Dashboard → SQL Editor

Copy and paste the entire contents of `../backend/database/database_sql_functions.sql` and execute.

## Updating Data (Annual/Periodic Updates)

When new data releases come out:

### Step 1: Update Raw Data
1. Download new year's data from MIT election and County Health Rankings
2. Replace files in `raw_data/` directory
3. Rerun Census cleaning scripts with updated year
4. Update cleaning scripts if variable names or structure changes

### Step 2: Re-run Processing Scripts and Importing Scripts. 
Make sure to truncate old data in Supabase.