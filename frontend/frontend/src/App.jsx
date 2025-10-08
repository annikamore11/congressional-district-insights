import { useEffect, useState } from "react";
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
} from "lucide-react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { myIssues, issueCategories, organizations } from "./data/constants.js";
import HomeContent from "./pages/homePage.jsx";
import DistrictContent from "./pages/districtPage.jsx";

function HomePage() {
  return <HomeContent />;
}

function DistrictOverview() {
  const location = useLocation();
  const { regionCode, region, lat, long } = location.state || {};

  return <DistrictContent state_name={regionCode} state_full={region} lat={lat} long={long} />;
  
}
export default function App() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [zip, setZip] = useState("");
  const [lat, setLat] = useState("");
  const [long, setLong] = useState("");
  const [region, setRegion] = useState("");
  const [regionCode, setRegionCode] = useState("");

  useEffect(() => {
    async function fetchLocation() {
      try {
        const resp = await fetch('https://ipwho.is/');
        const data = await resp.json();
        if (data) {
          setZip(data.postal);
          setLat(data.latitude);
          setLong(data.longitude);
          setRegion(data.region);
          setRegionCode(data.region_code);
        }
      } catch (err) {
        console.error("Failed to fetch IP location:", err);
      }
    }
    fetchLocation();
  })

  
  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center p-4 bg-gray-800 shadow z-10 justify-between">
        {/* Logo on the left */}
        <div className="flex-shrink-0">
          <p
            className="text-s font-semibold text-white cursor-pointer"
            onClick={() => navigate("/")}
          >
            eGutenbergPress
          </p>
        </div>

        {/* Middle Nav */}
        <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 space-x-2">
          {/* Issues Dropdown */}
          <div className="relative group">
            <button className="px-3 py-2 transparent-btn font-bold rounded">
              Issues
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-[1000px] bg-gray-200 rounded shadow-lg invisible opacity-0 pointer-events-none group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-20 p-4">
              <h3 className="font-semibold border-b border-t py-2 mb-2">
                Your Issues
              </h3>
              <ul className="grid grid-cols-5 gap-2">
                {myIssues.map((issue, idx) => (
                  <li
                    key={idx}
                    className="hover:bg-gray-100 rounded cursor-pointer"
                  >
                    {issue}
                  </li>
                ))}
              </ul>
              <div className="my-2 text-gray-200"></div>
              <h3 className="font-semibold border-b border-t py-2 my-2">
                All Issues
              </h3>

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
            <button className=" px-3 py-2 font-bold transparent-btn rounded">
              Organizations
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-[1000px] bg-gray-200 rounded shadow-lg invisible opacity-0 pointer-events-none group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-20 p-4">
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
        </div>

        {/* Buttons on the right */}
        <div className="ml-auto flex gap-2 bg-transparent">
          <button className="hidden sm:flex items-center transparent-btn px-2 py-1 rounded">
            <UserRound className="w-3 h-3 mr-1" />
            <span>Dashboard</span>
          </button>
          <button className="hidden sm:flex items-center transparent-btn px-2 py-1 rounded">
            <Building2 className="w-3 h-3 mr-1" />
            <span>Partners</span>
          </button>
          <button className="hidden sm:flex items-center transparent-btn px-2 py-1 rounded">
            <LogIn className="w-3 h-3 mr-1" />
            <span>Log-In</span>
          </button>
          <button
            onClick={() => setMenuOpen(true)}
            className="flex items-center transparent-btn px-2 py-1 rounded"
          >
            <Menu className="w-3 h-3" />
          </button>
        </div>
      </header>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black opacity-20 z-10"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}

      {/* Slide Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-20 flex flex-col ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 flex justify-center font-bold border-b">
            District Insights
          </div>
          <ul className="p-2">
            {/* Location Section */}

            <div className="p-2">
              <label htmlFor="zip" className="block text-sm text-gray-600 mb-1">
                ZIP Code
              </label>
              <input
                id="zip"
                type="text"
                value={`Zip: ${zip}`}
                onChange={(e) => setZip(e.target.value)}
                placeholder={`Zip: ${zip || "Enter ZIP"}`}
                className="border border-gray-300 px-3 py-2 rounded w-full"
              />
            </div>
            <div className="border-t border-gray-300 my-2"></div>
            {/* District Info */}
            <li 
            key={region}
            className="flex items-center p-2 rounded hover:bg-gray-200 cursor-pointer text-gray-700"
            onClick={() =>
              navigate("/district-overview", {
                state: { regionCode, region, lat, long },
              })
            }
            >
              <MapPinHouse className="w-5 h-5 mr-2" />
              <span>{region} Overview</span>
            </li>
            <div className="border-t border-gray-300 my-2"></div>
            <li className="flex items-center p-2 rounded hover:bg-gray-200 cursor-pointer text-gray-700">
              <User className="w-5 h-5 mr-2" />
              <span>Dashboard</span>
            </li>
            <li className="flex items-center p-2 rounded hover:bg-gray-200 cursor-pointer text-gray-700">
              <Building2 className="w-5 h-5 mr-2" />
              <span>Partners</span>
            </li>
            <li className="flex items-center p-2 border border-gray-300 rounded hover:bg-gray-200 cursor-pointer text-gray-700">
              <LogOut className="w-5 h-5 mr-2" />
              <span>Log-out</span>
            </li>
          </ul>
        </div>
      </div>

      

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto text-gray-600">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/district-overview" element={<DistrictOverview />} />
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
