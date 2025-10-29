import React, { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import AccuracyBanner from "../components/addressBanner";
import CivicsTab from "../components/districtTabs/CivicsTab";
import DemographicsTab from "../components/districtTabs/DemographicsTab";
import EconomyTab from "../components/districtTabs/EconomyTab";
import HealthTab from "../components/districtTabs/HealthTab";
import EducationTab from "../components/districtTabs/EducationTab";

export default function DistrictContent({ locationData }) {
    const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5002";

    if (!locationData) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-gray-500">Loading location data...</p>
            </div>
        );
    }

    const [activeTab, setActiveTab] = useState("state");
    const [activeSubTab, setActiveSubTab] = useState("civics");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Store all data in a single state object
    const [allData, setAllData] = useState({
        state: {
            civics: [],
            health: [],
            demographics: [],
            education: [],
            economy: [],
            loaded: false  // Add loaded flag
        },
        county: {
            civics: [],
            health: [],
            demographics: [],
            education: [],
            economy: [],
            loaded: false  // Add loaded flag
        }
    });

    const state_abbr = locationData.state;
    const state_full = locationData.state_full;
    const county = locationData.county;

    // Get current data based on active tab
    const currentData = allData[activeTab];

    // Add this useEffect to reset cache on location change
    useEffect(() => {
        setAllData({
            state: {
                civics: [],
                health: [],
                demographics: [],
                education: [],
                economy: [],
                loaded: false
            },
            county: {
                civics: [],
                health: [],
                demographics: [],
                education: [],
                economy: [],
                loaded: false
            }
        });
    }, [state_abbr, county]); // Reset when location changes

    // Fetch all data in a single request when tab changes
    useEffect(() => {
        async function fetchAllCategoryData() {
            if (!state_abbr) return;
            if (activeTab === "county" && !county) return;
            
            // CHECK IF DATA ALREADY LOADED - NEW!
            if (allData[activeTab].loaded) {
                console.log(`${activeTab} data already cached, skipping fetch`);
                return;
            }
            
            setLoading(true);
            
            try {
                // Build the API URL based on active tab
                const url = activeTab === "state"
                    ? `${API_BASE}/api/state/${state_abbr}?category=all`
                    : `${API_BASE}/api/county/${state_abbr}/${county}?category=all`;
                
                const resp = await fetch(url);
                const result = await resp.json();  
                
                if (result.data) {
                    // Update the state with all the data at once
                    setAllData(prev => ({
                        ...prev,
                        [activeTab]: {
                            civics: result.data.civics || result.data.election || [],
                            health: result.data.health || [],
                            demographics: result.data.demographics || [],
                            education: result.data.education || [],
                            economy: result.data.economy || [],
                            loaded: true  // Mark as loaded
                        }
                    }));
                }
            } catch (err) {
                console.error(`Failed to fetch ${activeTab} data:`, err);
            } finally {
                setLoading(false);
            }
        }

        fetchAllCategoryData();
    }, [state_abbr, county, activeTab, API_BASE, allData]);


    return (
        <div className="flex h-full relative">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
                <div className="border-b border-slate-200/20">
                    <div className="max-w-6xl mx-auto p-4 sm:p-4">
                        <div className="inline-flex gap-1 p-1 bg-slate-900 backdrop-blur-sm rounded-lg border border-slate-700">
                            <button
                                onClick={() => setActiveTab("state")}
                                className={`px-6 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 ${
                                    activeTab === "state"
                                        ? "bg-indigo-600 text-slate-100 shadow-lg"
                                        : "text-slate-300 hover:text-slate-100 hover:bg-slate-700/60"
                                }`}
                            >
                                {state_full || "Your State"}
                            </button>
                            <button
                                onClick={() => setActiveTab("county")}
                                className={`px-6 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 ${
                                    activeTab === "county"
                                        ? "bg-indigo-600 text-slate-100 shadow-lg"
                                        : "text-slate-300 hover:text-slate-100 hover:bg-slate-700/60"
                                }`}
                            >
                                {county || "Your County"}
                            </button>
                        </div>
                    </div>
                </div>
                

                <AccuracyBanner />

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-6xl mx-auto p-4 sm:p-6">
                        {/* Sub-tabs */}
                        <div className="flex flex-wrap sm:flex-nowrap gap-2 mb-6 bg-indigo-50 backdrop-blur-sm rounded-xl p-2 shadow-sm border border-slate-100">
                            {["civics", "demographics", "economy", "health", "education"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveSubTab(tab)}
                                    className={`flex-1 py-2.5 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 capitalize whitespace-nowrap ${
                                        activeSubTab === tab
                                            ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                                            : "text-gray-800 hover:bg-indigo-200/50"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex items-center justify-center py-12">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                    <p className="text-gray-500 text-sm">Loading data...</p>
                                </div>
                            </div>
                        )}

                        {/* Tab Content */}
                        {!loading && (
                            <>
                                {activeSubTab === "civics" && <CivicsTab civicsData={currentData.civics} />}
                                {activeSubTab === "demographics" && <DemographicsTab demographicsData={currentData.demographics} />}
                                {activeSubTab === "economy" && <EconomyTab economyData={currentData.economy} />}
                                {activeSubTab === "health" && <HealthTab healthData={currentData.health} />}
                                {activeSubTab === "education" && <EducationTab educationData={currentData.education} />}
                            </>
                        )}

                        {/* Collapsible sources at bottom */}
                        <CollapsibleSources />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Collapsible sources component
function CollapsibleSources() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="mt-6 border-t border-gray-200 pt-4">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 w-full"
            >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                <span>Data sources & methodology</span>
            </button>
            
            {isExpanded && (
                <div className="mt-3 text-xs text-gray-600 space-y-2 pl-6">
                    <p>
                        • <strong>Civics:</strong> MIT Election Data and Science Lab, "County Presidential Election Returns 2000-2024" 
                        <a 
                            href="https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/VOQCHQ" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 underline hover:text-black ml-1"
                        >
                            Visit Site
                        </a>
                    </p>
                    <p>
                        • <strong>Demographics:</strong> U.S. Census Bureau ACS PUMS 5-year estimates (2013-2023) 
                        <a 
                            href="https://www.census.gov/programs-surveys/acs.html" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 underline hover:text-black ml-1"
                        >
                            Visit Site
                        </a>
                    </p>
                    <p>
                        • <strong>Economy:</strong> U.S. Census Bureau ACS PUMS 5-year estimates (2013-2023) 
                        <a 
                            href="https://www.census.gov/programs-surveys/acs.html" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 underline hover:text-black ml-1"
                        >
                            Visit Site
                        </a>
                    </p>
                    <p>
                        • <strong>Health:</strong> County Health Rankings & Roadmaps (2013-2022) 
                        <a 
                            href="https://www.countyhealthrankings.org/health-data/methodology-and-sources/data-documentation" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 underline hover:text-black ml-1"
                        >
                            Visit Site
                        </a>, U.S. Census Bureau ACS PUMS 5-year estimates (2013-2023) [Uninsured measure]
                        <a 
                            href="https://www.census.gov/programs-surveys/acs.html" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 underline hover:text-black ml-1"
                        >
                            Visit Site
                        </a>
                    </p>
                    <p>
                        • <strong>Education:</strong> U.S. Census Bureau ACS PUMS 5-year estimates (2013-2023) 
                        <a 
                            href="https://www.census.gov/programs-surveys/acs.html" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 underline hover:text-black ml-1"
                        >
                            Visit Site
                        </a>, County Health Rankings & Roadmaps (2013-2022) [School Funding measure]
                        <a 
                            href="https://www.countyhealthrankings.org/health-data/methodology-and-sources/data-documentation" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 underline hover:text-black ml-1"
                        >
                            Visit Site
                        </a>
                    </p>
                    <p>
                        • <strong>Campaign Finance:</strong> FEC.gov 
                        <a 
                            href="https://www.fec.gov" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 underline hover:text-black ml-1"
                        >
                            Visit Site
                        </a>
                    </p>
                    <p>
                        • <strong>Congressional Member Info:</strong> congress-legislators github repository
                        <a 
                            href="https://github.com/unitedstates/congress-legislators" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 underline hover:text-black ml-1"
                        >
                            Visit Site
                        </a>
                    </p>
                    <p className="text-[10px] text-gray-500 mt-2 italic">
                        All measures from the Census ACS represent 5-year rolling averages
                    </p>
                </div>
            )}
        </div>
    );
}