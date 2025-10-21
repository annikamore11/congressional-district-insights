# District Insights and Congressional Finance App

A web application that provides district-level insights across multiple categories including demographics, economy, civics, education, and health, with integrated congressional campaign finance data visualizations from the Federal Election Commission (FEC).

## Overview

This application allows users to explore geographic data at both state and county levels, combining data from The Census Bureau, County Health Rankings, MIT Election Data and Science Lab, congress-legislators github, and The FEC through an interactive interface.

## Demo App

https://congressional-district-insights.vercel.app/

Takes a minute to initially load

## Architecture

```
congress-finance-app/
├── frontend/          # React + Vite + Tailwind CSS
├── backend/           # Flask API server
└── data-processing/   # R & Python data pipeline
```

**Data Flow:**
1. Raw data collected from Census API, County Health Rankings, and MIT Election Lab
2. Data processed and cleaned using R
3. Cleaned data imported through Python script into Supabase database
4. Backend fetches and aggregates data from FEC API, congress-legislators github repo and Supabase
5. Frontend visualizes data with interactive geography switching

## Quick Start

### Prerequisites

- **Node.js** (v16+)
- **Python** (v3.8+)
- **R** (v4.0+)
- **Supabase Account** (or your own PostgreSQL database)
- **API Keys** (see below)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/annikamore11/congress-finance-app.git
   cd congress-finance-app
   ```

2. **Set up the database**
   - Follow instructions in `/data-processing/README.md`
   - Import cleaned data into your database or use upload_to_supabase.py script in data_processing directory if using Supabase
   - SQL functions used in `/backend/database/queries.py` are documented in `/backend/database/database_sql_functions.sql` and stored as functions in Supabase

3. **Set up the backend**
   - See `/backend/README.md`
   - Configure environment variables
   - Install dependencies and run

4. **Set up the frontend**
   - See `/frontend/README.md`
   - Configure environment variables
   - Install dependencies and run

## Required API Keys

You'll need to obtain the following API keys before running the application:

### Backend APIs
1. **FEC API Key**
   - Get it at: https://api.open.fec.gov/developers/
   - Used for: Campaign finance data

2. **Supabase**
   - Create project at: https://supabase.com
   - Get: Project URL and Service Role Key
   - Used for: Database operations

3. **Geocodio API Key**
   - Get it at: https://www.geocod.io/
   - Used for: Geographic data processing

### Frontend APIs
1. **Google API Key**
   - Get it at: https://console.cloud.google.com/
   - Enable: Maps JavaScript API
   - Used for: Address Auto-complete

### Data Processing APIs
1. **Census Bureau API Key**
   - Get it at: https://api.census.gov/data/key_signup.html
   - Used for: Fetching demographic and economic data

## Data Sources

- [**U.S. Census Bureau**](https://www.census.gov/programs-surveys/acs.html) - Demographics, economic, health, and education metrics
- [**County Health Rankings**](https://www.countyhealthrankings.org/health-data/methodology-and-sources/data-documentation) - Health and Education metrics
- [**MIT Election Data and Science Lab**](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/VOQCHQ) - Civics metrics
- [**Federal Election Commission (FEC)**](https://www.fec.gov/) - Campaign finance data
- [**congress-legislators Github Repo**](https://github.com/unitedstates/congress-legislators) - Congressional Member Info

## Deployment

- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Render

See individual README files for deployment instructions.

## Project Structure

```
congress-finance-app/
├── README.md                          # This file
├── frontend/
│   ├── README.md                      # Frontend setup guide
│   ├── src/
├── backend/
│   ├── README.md                      # Backend setup guide
│   └── database/
│   └── functions/                
└── data-processing/
    ├── README.md                      # Data pipeline guide
    ├── raw_data/                      # Raw CSV files (download required)
    ├── cleaned_data/                  # Cleaned datasets for import
    └── scripts/                       # R and Python processing scripts
```

## Updating Data

When new data releases (e.g., new census year, presidential election cycle, County Health Rankings):

1. Navigate to `/data-processing/`
2. Follow the data update procedures in that directory's README
3. Re-import cleaned data into Supabase
4. Backend will automatically use updated data

FEC and congress-legislators data are fetched directly from their respective APIs/repositories in real-time and do not require manual updates. The application always displays the most current data available from these sources.

## Documentation

- [Frontend Setup](./frontend/README.md)
- [Backend Setup](./backend/README.md)
- [Data Processing Guide](./data_processing/README.md)

## FEC Notes
### Missing FEC Data
Some legislators have missing fec data due to being elected through a special election in 2025 or missing years on fec website. Below are the legislators missing for the 2023-24 cycle.
- James Walkinshaw - VA - special election in 2025 so didnt have campaign finance in 2024
- Randy Fine - FL - special election in 2025 so no campaign finance in 2024 
- John Mcguire - VA - missing data on fec site for no reason
- Jimmy Patronis - FL - special election so no campaign finance data in 2024 
- Marlin Stutzman - IN - Missing FEC data for no reason
- Jon Husted - OH - special election after JD Vance left office
- Ashley Moody - FL - special election in 2025

### Top Contributors Data
I used the by_employmor endpoint to fetch the top individual contributors for a certain year. This does not include any PAC or committee donations which is why it doesn't look the same as opensecrets data. Finding committee and PAC contributions requires much more parsing and grouping since there is no by_committee endpoint. 

## Author

Annika More