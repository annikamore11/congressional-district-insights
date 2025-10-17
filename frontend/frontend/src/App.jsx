import { useEffect, useState } from "react";
import { useLocation as useRouterLocation } from "react-router-dom";
import {
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Building2,
  LogIn,
  LogOut,
  UserRound,
  MapPinHouse,
  MapPin,
  User,
  UserPlus,
} from "lucide-react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { issueCategories, organizations } from "./data/constants.js";
import HomeContent from "./pages/homePage.jsx";
import DistrictContent from "./pages/districtPage.jsx";

function HomePage() {
  return <HomeContent />;
}

// Update the DistrictOverview component:
function DistrictOverview() {
  const location = useRouterLocation();
  const { regionCode, region, lat, long } = location.state || {};

  // Use key prop to force re-mount when state changes
  return (
    <DistrictContent 
      key={`${regionCode}-${lat}-${long}`} // Forces re-mount on change
      state_name={regionCode} 
      state_full={region} 
      lat={lat} 
      long={long} 
    />
  );
}

export default function App() {
  const GEOCODIO_KEY = import.meta.env.VITE_GEOCODIO_KEY;

  const navigate = useNavigate();
  const location = useLocation();
  const [zip, setZip] = useState("");
  const [lat, setLat] = useState("");
  const [long, setLong] = useState("");
  const [region, setRegion] = useState("");
  const [regionCode, setRegionCode] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [addressMode, setAddressMode] = useState('zip'); // 'zip' or 'address'
  const [fullAddress, setFullAddress] = useState('');

  // Fetch location based on ZIP code
  const fetchLocationFromZip = async (zipCode) => {
    if (!zipCode || zipCode.length < 5) return;
    
    setIsLoadingLocation(true);
    try {
      const resp = await fetch(
        `https://api.geocod.io/v1.9/geocode?q=${zipCode}&fields=cd&api_key=${GEOCODIO_KEY}`
      );
      const data = await resp.json();
      
      if (data && data.results && data.results.length > 0) {
        const result = data.results[0];
        const location = result.location;
        const components = result.address_components;

        const newLat = location.lat;
        const newLong = location.lng;
        const newRegion = components.state;
        const newRegionCode = components.state; // You might need state abbreviation mapping

        setLat(newLat);
        setLong(newLong);
        setRegion(newRegion);
        setRegionCode(newRegionCode);
        
        // If already on district page, navigate again to trigger refresh
        if (location.pathname === '/') {
          navigate("/", {
            state: { 
              regionCode: newRegionCode, 
              region: newRegion, 
              lat: newLat, 
              long: newLong 
            },
            replace: true // Replace current history entry instead of adding new one
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch location from ZIP:", err);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const fetchLocationFromAddress = async (address) => {
    console.log(address)
    if (!address) return;
    
    setIsLoadingLocation(true);
    try {
      const resp = await fetch(
        `https://api.geocod.io/v1.9/geocode?q=${address}&fields=cd&api_key=${GEOCODIO_KEY}`
      );
      const data = await resp.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const location = result.location;
        const components = result.address_components;
        
        const newLat = location.lat;
        const newLong = location.lng;
        const newRegion = components.state;
        const newRegionCode = components.state; // You might need state abbreviation mapping
        const newZip = components.zip;
        
        setLat(newLat);
        setLong(newLong);
        setRegion(newRegion);
        setRegionCode(newRegionCode);
        setZip(newZip);
        
        if (location.pathname === '/') {
          navigate("/", {
            state: { 
              regionCode: newRegionCode, 
              region: newRegion, 
              lat: newLat, 
              long: newLong,
              zip: newZip
            },
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

  // Initial location fetch from IP
  useEffect(() => {
      async function fetchLocation() {
        try {
          const resp = await fetch('https://ipwho.is/');
          const data = await resp.json();
          
          console.log('IP location data:', data); // Debug log
          
          if (data && data.success !== false) {
            setZip(data.postal || '');
            setLat(data.latitude || '');
            setLong(data.longitude || '');
            setRegion(data.region || '');
            setRegionCode(data.region_code || '');
          } else {
            console.error('IP location fetch failed:', data);
            // Fallback to default location or show error
          }
        } catch (err) {
          console.error("Failed to fetch IP location:", err);
        }
      }
      fetchLocation();
    }, []);

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
    <div className="h-screen w-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center p-4 bg-gray-800 shadow z-50 justify-between">
        {/* Logo on the left */}
        <div className="flex-shrink-0">
          <p
            className="text-s font-semibold text-white cursor-pointer"
            onClick={() => navigate("/home")}
          >
            eGutenbergPress
          </p>
        </div>

        {/* Middle Nav - Centered */}
        <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 space-x-2">
          {/* Issues Dropdown */}
          <div className="relative group">
            <button className="px-3 py-2 transparent-btn font-bold rounded">
              Issues
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-[1000px] bg-gray-200 rounded shadow-lg invisible opacity-0 pointer-events-none group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 p-4">
              <ul className="grid grid-cols-5 gap-2">
                {issueCategories.map((issue, idx) => (
                  <li
                    key={idx}
                    className="hover:bg-gray-100 p-2 rounded cursor-pointer"
                  >
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Organizations Dropdown */}
          <div className="relative group">
            <button className="px-3 py-2 font-bold transparent-btn rounded">
              Organizations
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-[1000px] bg-gray-200 rounded shadow-lg invisible opacity-0 pointer-events-none group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 p-4">
              <ul className="grid grid-cols-3 gap-2">
                {organizations.map((org, idx) => (
                  <li
                    key={idx}
                    className="hover:bg-gray-100 p-2 rounded cursor-pointer"
                  >
                    {org}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* District Data Link */}
          <button 
            className="px-3 py-2 transparent-btn font-bold rounded flex items-center gap-1"
            onClick={() =>
              navigate("/", {
                state: { regionCode, region, lat, long },
              })
            }
          >
            District Data
          </button>
        </div>

        {/* Right side controls */}
        <div className="ml-auto flex items-center gap-2">
          {/* Enhanced Location Input with Toggle */}
          <div className="hidden md:block relative">
            {addressMode === 'zip' ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={zip}
                  onChange={handleZipChange}
                  onKeyPress={handleZipKeyPress}
                  placeholder="ZIP Code"
                  className="border border-gray-600 bg-gray-700 text-white placeholder-gray-400 px-3 py-1.5 rounded-l text-sm w-28 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={() => setAddressMode('address')}
                  className="bg-gray-700 border border-l-0 border-gray-600 text-gray-300 px-2 py-1.5 rounded-r text-xs hover:bg-gray-600 flex items-center"
                  title="Use full address for better accuracy"
                >
                  <MapPin size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <input
                  type="text"
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      fetchLocationFromAddress(fullAddress);
                    }
                  }}
                  placeholder="Full address..."
                  className="border border-gray-600 bg-gray-700 text-white placeholder-gray-400 px-3 py-1.5 rounded-l text-sm w-48 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={() => setAddressMode('zip')}
                  className="bg-gray-700 border border-l-0 border-gray-600 text-gray-300 px-2 py-1.5 rounded-r text-xs hover:bg-gray-600 flex items-center"
                  title="Switch to ZIP code"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {isLoadingLocation && (
              <div className="absolute right-10 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          

          {/* Login Button */}
          <button className="hidden sm:flex items-center transparent-btn px-3 py-1.5 rounded gap-1">
            <span>Log In</span>
          </button>

          {/* Sign Up Button */}
          <button className="hidden sm:flex items-center bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded gap-1 transition-colors">
            <span>Sign Up</span>
          </button>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden flex items-center transparent-btn px-2 py-1.5 rounded"
            onClick={() =>
              navigate("/", {
                state: { regionCode, region, lat, long },
              })
            }
          >
            <MapPinHouse className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto text-gray-600">
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/" element={<DistrictOverview />} />
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
