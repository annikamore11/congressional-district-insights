import { useEffect, useState } from "react";
import {
  MapPinHouse,
  MapPin,
  Menu,
  X,
  Users
} from "lucide-react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import AddressAutocomplete from "./components/AddressAutocomplete.jsx";
import NavButton from "./components/navButton.jsx";
import LandingContent from "./pages/landingPage.jsx";
import DistrictContent from "./pages/districtPage.jsx";
import RepresentativesPage from "./pages/repPage.jsx";

function LandingPage( {locationData} ) {
  return (
    <LandingContent 
      locationData={locationData}
    />
  );
}

function FECPage() {
  return <FECContent />;
}

function DistrictOverview() {
  const location = useLocation();
  const { locationData } = location.state || {};

  return (
    <DistrictContent 
      key={`${locationData}`} // Forces re-mount on change
      locationData={locationData}
    />
  );
}

function RepPage() {
  const location = useLocation();
  const { locationData } = location.state || {};

  return (
    <RepresentativesPage
      locationData={locationData}
    />
  );
}

export default function App() {
  const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5002";

  const navigate = useNavigate();
  const location = useLocation();
  const [locationData, setLocationData] = useState("");
  const [zip, setZip] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [addressMode, setAddressMode] = useState('zip'); 
  const [sidebarOpen, setSidebarOpen] = useState(false);

  
  // Fetch location based on ZIP code
  const fetchLocationFromZip = async (zipCode) => {
      if (!zipCode || zipCode.length < 5) return;
      
      setIsLoadingLocation(true);
      try {
        const resp = await fetch(`${API_BASE}/api/geocode?q=${zipCode}`);
        const data = await resp.json();
        
        if(data) {
          setLocationData(data);
          setZip(data.zip);
          
          if (location.pathname === '/') {
            navigate("/district-insights", {
              state: { locationData: data },
              replace: true
            });
          } else if (location.pathname === '/representatives' || location.pathname === '/district-insights') {
            // ✅ Re-navigate to current page with new data
            navigate(location.pathname, {
              state: { locationData: data },
              replace: true
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch location from ZIP:", err);
      } finally {
        setIsLoadingLocation(false);
      }
    };

  // Fetch location based on address
  const fetchLocationFromAddress = async (address) => {
      if (!address) return;
      
      setIsLoadingLocation(true);
      try {
        const resp = await fetch(`${API_BASE}/api/geocode?q=${encodeURIComponent(address)}`);
        const data = await resp.json();
        
        if(data) {
          setLocationData(data);
          setZip(data.zip);
          
          if (location.pathname === '/') {
            navigate("/district-insights", {
              state: { locationData: data },
              replace: true
            });
          } else if (location.pathname === '/representatives' || location.pathname === '/district-insights') {
            // ✅ Re-navigate to current page with new data
            navigate(location.pathname, {
              state: { locationData: data },
              replace: true
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch location from address:", err);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    // Initial Zip code from IP address load
    useEffect(() => {
      async function fetchLocation() {
        try {
          const resp = await fetch('https://ipwho.is/');
          const data = await resp.json();
          
          if (data && data.success !== false && data.postal) {
            // Fetch location data using lat/lng
            const geocodeResp = await fetch(
              `${API_BASE}/api/geocode?q=${data.postal}`
            );
            const geocodeData = await geocodeResp.json();

            if (geocodeData) {
              setLocationData(geocodeData);
              setZip(geocodeData.zip || data.postal || '');
            }
          }
        } catch (err) {
          console.error("Failed to fetch IP location:", err);
        }
        }
        fetchLocation();
    }, [API_BASE]);
    

    // Handle ZIP code change with debounce
    const handleZipChange = (e) => {
      const newZip = e.target.value.replace(/\D/g, '').slice(0, 5); // Only numbers, max 5 digits
      setZip(newZip);
      
      // Fetch location when ZIP is complete (5 digits)
      if (newZip.length === 5) {
        fetchLocationFromZip(newZip);
      }
    };

    // Handle Enter key press
    const handleZipKeyPress = (e) => {
      if (e.key === 'Enter' && zip.length === 5) {
        fetchLocationFromZip(zip);
      }
    };

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-slate-500 to-slate-700 pt-2">
      {/* Header */}
      <header className="flex items-center p-6 px-20 z-50 justify-between border-b border-slate-200/20">
        {/* Logo on the left */}
        <div className="flex-shrink-0">
          <p
            className="text-md font-semibold text-slate-100 cursor-pointer"
            onClick={() =>
              navigate("/")
            }
          >
            CivicLens
          </p>
        </div>

        {/* Right side controls */}
        <div className="ml-auto flex items-center gap-4">
          {/* Unified Address/ZIP Input */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-slate-200">Change Location:</span>
            <div className="relative">
              <AddressAutocomplete
                onSelectAddress={(query) => {
                  // Check if it's a ZIP code (5 digits) or full address
                  if (/^\d{5}$/.test(query.trim())) {
                    fetchLocationFromZip(query.trim());
                  } else {
                    fetchLocationFromAddress(query);
                  }
                }}
                onCancel={() => {}}
              />
              
              {isLoadingLocation && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          {/* Login Button */}
          <button className="hidden sm:flex items-center text-slate-100 hover:text-slate-300 text-md transition-colors px-3 py-1.5 rounded gap-1">
            <span>Log In</span>
          </button>

          {/* Sign Up Button */}
          <button className="hidden sm:flex items-center bg-slate-900 hover:bg-slate-700 shadow-sm shadow-slate-500/30 text-slate-100 text-md px-3 py-1.5 rounded gap-1 transition-colors">
            <span>Sign Up</span>
          </button>

          

        {/* Sidebar Toggle Button */}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center text-slate-100 hover:text-slate-300 transition-colors px-2 py-1.5 rounded gap-2"
          >
            <Menu size={25} />
          </button>
        </div>
      </header>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Slides in from right */}
      <nav className={`
        fixed top-0 right-0 h-full sm:w-full lg:w-80 bg-slate-600 border-l border-slate-100/20 z-50
        transform transition-transform duration-300 ease-in-out shadow-2xl
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100/20">
          <h2 className="text-slate-100 font-bold text-xl">Navigation</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-4 space-y-2">
          <NavButton 
            to="/representatives" 
            icon={<Users size={20} />} 
            label="Your Representatives"
            locationData={locationData}
            onClick={() => setSidebarOpen(false)}
          />
          <NavButton 
            to="/district-insights" 
            icon={<MapPin size={20} />} 
            label="District Data"
            locationData={locationData}
            onClick={() => setSidebarOpen(false)}
          />
          {/* <NavButton 
            to="/ai-overview" 
            icon={<Sparkles size={20} />} 
            label="AI Overview"
            onClick={() => setSidebarOpen(false)}
          /> */}
        </div>

        {/* Sidebar Footer (Optional) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100/20">
          <p className="text-slate-100 text-xs text-center">
            CivicLens © 2025
          </p>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto text-gray-600">
        <Routes>
          <Route path="/" element={<LandingPage locationData={locationData} />} />
          <Route path="/district-insights" element={<DistrictOverview />} />
          <Route path="/representatives" element={<RepPage />} />
        </Routes>
      </main>
    </div>
  );
}

// Wrap App in Router
export function Root() {
  return (
    <Router>
      <App />
    </Router>
  );
}
