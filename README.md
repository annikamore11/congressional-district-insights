# Congress Finance App

A simple web app to explore campaign finance data for Members of Congress.

## Demo
[Demo App](https://congress-finance-app.vercel.app/)

## Features
- Select a state and view its members of Congress
- Finance overview with charts
- Top contributors and state-level breakdowns
- Use the backend directory to find fec endpoints 

## Tech Stack
- **Frontend:** React (hosted on Vercel)
- **Backend:** Flask API (hosted on Render)
- **Data Source:** [FEC API](https://api.open.fec.gov/developers/)
- **Legislators Data Source:** [congress-legislators GitHub](https://github.com/unitedstates/congress-legislators)

## Setup

### Clone the repository
- git clone https://github.com/annikamore11/congress-finance-app.git
- cd congress-finance-app

### Backend
- cd backend
- pip install -r requirements.txt
- Set your FEC API key in a .env file
- python app.py

### Frontend
- cd frontend
- npm install
- npm start

### Deployment
- Frontend: Vercel
- Backend: Render

### Notes
- You will need your own FEC API key to run locally
- This only covers 2023-24 finance data. to query for this current cycle you can use 2026 as the cycle input.

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
I just used the by_employmor endpoint to fetch the top individual contributors for a certain year. This does not include any PAC or committee donations which is why it doesn't look the same as opensecrets data. Finding committee and PAC contributions requires much more parsing and grouping since there is no by_committee endpoint. 