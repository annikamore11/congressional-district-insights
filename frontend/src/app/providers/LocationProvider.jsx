"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MapPin, Menu, X, Users } from "lucide-react";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import NavButton from "@/components/navButton";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:5002";

const LocationContext = createContext({
  locationData: "",
  fetchLocation: () => {},
  displayAddress: "",
});

// Shared access to the geocoded location across all pages.
export function useLocationData() {
  return useContext(LocationContext);
}

// Inline nav link for the desktop header.
function HeaderNavLink({ to, label }) {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = pathname === to;

  return (
    <button
      onClick={() => router.push(to)}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? "text-slate-100 bg-slate-800/60"
          : "text-slate-300 hover:text-slate-100 hover:bg-slate-800/30"
      }`}
    >
      {label}
    </button>
  );
}

export default function LocationProvider({ children }) {
  const router = useRouter();
  const [locationData, setLocationData] = useState("");
  const [displayAddress, setDisplayAddress] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Single fetch function for both ZIP and address
  const fetchLocation = async (query) => {
    if (!query) return;

    setIsLoadingLocation(true);
    try {
      const resp = await fetch(
        `${API_BASE}/api/geocode?q=${encodeURIComponent(query)}`
      );
      const data = await resp.json();

      if (data) {
        setLocationData(data);
        setDisplayAddress(query); // Keep whatever user entered
      }
    } catch (err) {
      console.error("Failed to fetch location:", err);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Initial ZIP code from IP address on load
  useEffect(() => {
    async function fetchInitialLocation() {
      try {
        const resp = await fetch("https://ipapi.co/json/");
        const data = await resp.json();

        if (data && !data.error && data.postal) {
          fetchLocation(data.postal); // Use the single function
        }
      } catch (err) {
        console.error("Failed to fetch IP location:", err);
      }
    }
    fetchInitialLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ locationData, fetchLocation, displayAddress }}>
      <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-slate-500 to-slate-700 pt-2 overflow-x-hidden">
        {/* Header */}
        <header className="flex items-center p-6 px-4 lg:px-20 z-50 justify-between border-b border-slate-200/20">
          {/* Logo + desktop navigation */}
          <div className="flex items-center gap-6 lg:gap-10">
            <p
              className="text-md font-bold text-slate-100 cursor-pointer flex-shrink-0"
              onClick={() => router.push("/")}
            >
              CivicLens
            </p>

            <nav className="hidden md:flex items-center gap-1">
              <HeaderNavLink to="/district-insights" label="District Data" />
              <HeaderNavLink to="/representatives" label="Your Representatives" />
            </nav>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-4">
            {/* Unified Address/ZIP Input */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-200 md:inline hidden">
                Change Location:
              </span>

              {/* Desktop: Inline input */}
              <div className="relative hidden md:block">
                <AddressAutocomplete
                  initialValue={displayAddress}
                  onSelectAddress={(query) => fetchLocation(query)}
                  onCancel={() => {}}
                  isMobile={false}
                />

                {isLoadingLocation && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Mobile: Same component with mobile mode */}
              <div className="relative md:hidden">
                <AddressAutocomplete
                  initialValue={displayAddress}
                  onSelectAddress={(query) => fetchLocation(query)}
                  onCancel={() => {}}
                  isMobile={true}
                />

                {isLoadingLocation && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Toggle Button — mobile only */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex md:hidden items-center text-slate-100 hover:text-slate-300 transition-colors px-2 py-1.5 rounded gap-2"
              aria-label="Open navigation menu"
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
        <nav
          className={`
          fixed top-0 right-0 h-full w-full md:w-80 bg-slate-600 border-l border-slate-100/20 z-50
          transform transition-transform duration-300 ease-in-out shadow-2xl
          ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
        `}
        >
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
              onClick={() => setSidebarOpen(false)}
            />
            <NavButton
              to="/district-insights"
              icon={<MapPin size={20} />}
              label="District Data"
              onClick={() => setSidebarOpen(false)}
            />
          </div>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100/20">
            <p className="text-slate-100 text-xs text-center">
              CivicLens © 2025
            </p>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto text-gray-600">
          {children}

          {/* Footer */}
          <footer className="relative bg-slate-900 text-slate-300 border-t border-slate-700 z-10">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Brand Section */}
                <div>
                  <h3 className="text-xl font-bold text-slate-100 mb-3">
                    CivicLens
                  </h3>
                  <p className="text-sm text-slate-400">
                    Making civic data accessible, transparent, and actionable
                    for informed voters.
                  </p>
                </div>

                {/* Quick Links */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-100 mb-3 uppercase tracking-wider">
                    Quick Links
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <button
                        onClick={() => router.push("/")}
                        className="hover:text-slate-100 transition-colors text-left"
                      >
                        Home
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => router.push("/district-insights")}
                        className="hover:text-slate-100 transition-colors text-left"
                      >
                        District Data
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => router.push("/representatives")}
                        className="hover:text-slate-100 transition-colors text-left"
                      >
                        Your Representatives
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Data Sources */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-100 mb-3 uppercase tracking-wider">
                    Data Sources
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a
                        href="https://www.fec.gov/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-slate-100 transition-colors"
                      >
                        Federal Election Commission
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.census.gov/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-slate-100 transition-colors"
                      >
                        U.S. Census Bureau
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/VOQCHQ"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-slate-100 transition-colors"
                      >
                        MIT Data Election Data
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.countyhealthrankings.org/health-data/methodology-and-sources/data-documentation"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-slate-100 transition-colors"
                      >
                        County Health Rankings
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://github.com/unitedstates"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-slate-100 transition-colors"
                      >
                        @unitedstates Github
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="mt-8 pt-6 border-t border-slate-800 text-center text-sm text-slate-500">
                <p>
                  &copy; {new Date().getFullYear()} CivicLens. All rights
                  reserved.
                </p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </LocationContext.Provider>
  );
}
