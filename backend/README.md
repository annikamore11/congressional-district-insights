# Backend - District Insights and Congressional Finance App

Flask-based API server that aggregates and serves congressional district data from FEC, congress-legislators github, and Supabase.

## Tech Stack

- **Python 3.8+**
- **Flask** - Web framework
- **Supabase** - Database (PostgreSQL)
- **FEC API** - Campaign finance data
- **Geocodio API** - Geographic data processing
- **congress-legislators github repo** - Congressional member info

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Supabase account (or PostgreSQL database)
- Required API keys (see below)

## Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create a virtual environment** (recommended)
   ```bash
   python3 -m venv venv
   
   # Activate on Windows
   venv\Scripts\activate
   
   # Activate on macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip3 install -r requirements.txt
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the backend directory:
   ```env
   # FEC API
   FEC_API_KEY=your_fec_api_key_here
   
   # Supabase
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here
   
   # Geocodio
   GEOCODIO_KEY=your_geocodio_api_key_here
   
   ```

## Getting API Keys

### FEC API Key
1. Go to [FEC API Documentation](https://api.open.fec.gov/developers/)
2. Click **"Get API Key"**
3. Fill out the form
4. Check your email for the API key
5. Add to `.env` file

### Supabase
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (SUPABASE_URL)
   - **service_role key** (SUPABASE_SERVICE_KEY) 
5. Add to `.env` file

### Geocodio API Key
1. Go to [Geocodio](https://www.geocod.io/)
2. Sign up for a free account
3. Go to **API Keys** in dashboard
4. Copy your API key
5. Add to `.env` file

## Database Setup

Before running the backend, ensure your Supabase database is set up:

## Development

Run the development server:

```bash
# Make sure virtual environment is activated
python3 app.py
```

The API will be available at `http://localhost:5002`

## Project Structure

```
backend/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── constants.py           
├── .env                   # Environment variables (create this)
├── database/
│   └── database_sql_functions.sql  # Supabase SQL functions documentation
│   └── queries.py                  # Calls Supabase SQL functions and returns results
│   └── supabase_client.py          # Supabase connection
└── functions/                      # Helper functions for FEC aggregation
    └── fec_finance.py        
```
