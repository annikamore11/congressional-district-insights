# Frontend - District Insights and Congressional Finance App

React-based frontend for visualizing congressional campaign finance and district data with interactive geographic navigation.

## Tech Stack

- **React.js** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Google Maps API** - Address autocomplete

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google API Key with Maps JavaScript API enabled

## Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5001
   VITE_GOOGLE_API_KEY=your_google_api_key_here
   ```

## Getting API Keys

### Google API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Maps JavaScript API**
4. Go to **Credentials** → **Create Credentials** → **API Key**

## Development

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is in use).

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   │   ├── districtTabs/
│   │   │   ├── CivicsTab.jsx
│   │   │   ├── DemographicsTab.jsx
│   │   │   ├── EconomyTab.jsx
│   │   │   ├── EducationTab.jsx
│   │   │   ├── HealthTab.jsx
│   │   │   ├── RepCard.jsx      # Styling for representative cards
│   │   │   └── StatCarousel.jsx # Card styling for mobile layout
│   │   └── AddressAutoComplete.jsx     
│   ├── pages/                      # Page components
│   │   ├── districtPage.jsx        # District Insights
│   │   └── homePage.jsx            # Campaign Finance 
│   ├── App.jsx                     # Main app component
│   ├── main.jsx                    # Entry point
│   ├── constants.js             
│   └── index.css 
├── README.md      
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
├── package-lock.json
├── package.json        
└── .env                # Environment variables (create this)
```