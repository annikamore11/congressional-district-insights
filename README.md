# Congress Finance App

A simple web app to explore campaign finance data for Members of Congress.

## Demo
👉 [Live App](https://your-vercel-url.vercel.app)

## Features
- Select a state and view its members of Congress
- Finance overview with charts
- Top contributors and state-level breakdowns

## Tech Stack
- **Frontend:** React (hosted on Vercel)
- **Backend:** Flask API (hosted on Render)
- **Data Source:** [FEC API](https://api.open.fec.gov/developers/)
- **Legislators Data Source:** [congress-legislators GitHub](https://github.com/unitedstates/congress-legislators)

## Setup

### Clone the repository
git clone https://github.com/annikamore11/congress-finance-app.git
cd congress-finance-app

### Backend
cd backend
pip install -r requirements.txt
# Set your FEC API key in a .env file
python app.py

### Frontend
cd frontend
npm install
npm start

### Deployment
- Frontend: Vercel
- Backend: Render

### Notes
You will need your own FEC API key to run locally