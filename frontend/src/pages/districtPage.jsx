import React, { useState, useEffect } from "react";
import { Menu, X, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import CivicsTab from "../components/districtTabs/CivicsTab";
import DemographicsTab from "../components/districtTabs/DemographicsTab";
import EconomyTab from "../components/districtTabs/EconomyTab";
import HealthTab from "../components/districtTabs/HealthTab";
import EducationTab from "../components/districtTabs/EducationTab";
import RepCard from "../components/districtTabs/RepCard";

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
                    <p className="text-[10px] text-gray-500 mt-2 italic">
                        All measures from the Census ACS represent 5-year rolling averages
                    </p>
                </div>
            )}
        </div>
    );
}

export default function DistrictContent({ locationData }) {
    const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5001";

    if (!locationData) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-gray-500">Loading location data...</p>
            </div>
        );
    }

    const [showAccuracyBanner, setShowAccuracyBanner] = useState(true);
    const [activeTab, setActiveTab] = useState("state");
    const [activeSubTab, setActiveSubTab] = useState("civics");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const [civicsStateResults, setCivicsStateResults] = useState([]);
    const [civicsCountyResults, setCivicsCountyResults] = useState([]);
    const [healthStateResults, setHealthStateResults] = useState([]);
    const [healthCountyResults, setHealthCountyResults] = useState([]);
    const [demograpicsStateResults, setDemographicsStateResults] = useState([]);
    const [demographicsCountyResults, setDemographicsCountyResults] = useState([]);
    const [educationStateResults, setEducationStateResults] = useState([]);
    const [educationCountyResults, setEducationCountyResults] = useState([]);
    const [economyStateResults, setEconomyStateResults] = useState([]);
    const [economyCountyResults, setEconomyCountyResults] = useState([]);

    const state_name = locationData.state;
    const state_full = locationData.state_full;
    const members = locationData.legislators;
    const county = locationData.county;

    const senators = members.filter(m => m.role === "sen");
    const houseReps = members.filter(m => m.role === "rep");

    // Determine which reps to highlight based on active tab
    const highlightedReps = activeTab === "state" 
        ? senators.map(s => s.bio_id)
        : members.map(m => m.bio_id);

    const currentCivicsData = activeTab === "state" ? civicsStateResults : civicsCountyResults;
    const currentHealthData = activeTab === "state" ? healthStateResults : healthCountyResults;
    const currentDemographicsData = activeTab === "state" ? demograpicsStateResults : demographicsCountyResults;
    const currentEducationData = activeTab === "state" ? educationStateResults : educationCountyResults;
    const currentEconomyData = activeTab === "state" ? economyStateResults : economyCountyResults;

    // Fetch election results (state or county based on activeTab)
    useEffect(() => {
        async function fetchElectionResults() {
            try {
                let resp;
                if (activeTab === "state") {
                    resp = await fetch(`${API_BASE}/api/state/${state_name}`);
                    
                } else {
                    resp = await fetch(`${API_BASE}/api/county/${state_name}/${county}`);
                }
                
                const data = await resp.json();
                if (data.results) {
                    if (activeTab === "state") {
                        setCivicsStateResults(data.results);
                        
                    } else {
                        setCivicsCountyResults(data.results);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch election results:", err);
            }
        }

        if (state_name && (activeTab === "state" || (activeTab === "county" && county))) {
            fetchElectionResults();
        }
    }, [state_name, county, activeTab]);

    // Fetch county health ratings data for use in the health tab
    useEffect(() => {
        async function fetchHealthData() {
            try {
                let resp;
                if (activeTab === "state") {
                    resp = await fetch(`${API_BASE}/api/health/state/${state_full}/${state_name}`);
                } else {
                    resp = await fetch(`${API_BASE}/api/health/county/${state_name}/${county}`);
                }
                
                const data = await resp.json();
                if (data.results) {
                    if (activeTab === "state") {
                        setHealthStateResults(data.results);
                    } else {
                        setHealthCountyResults(data.results);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch health data results:", err);
            }
        }

        if (state_name && (activeTab === "state" || (activeTab === "county" && county))) {
            fetchHealthData();
        }
    }, [state_name, county, activeTab]);

    // Fetch county health ratings data for use in the health tab
    useEffect(() => {
        async function fetchDemographicsData() {
            try {
                let resp;
                if (activeTab === "state") {
                    resp = await fetch(`${API_BASE}/api/demographics/state/${state_full}/${state_name}`);
                } else {
                    resp = await fetch(`${API_BASE}/api/demographics/county/${state_name}/${county}`);
                }
                
                const data = await resp.json();
                if (data.results) {
                    if (activeTab === "state") {
                        setDemographicsStateResults(data.results);
                    } else {
                        setDemographicsCountyResults(data.results);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch demographics data results:", err);
            }
        }

        if (state_name && (activeTab === "state" || (activeTab === "county" && county))) {
            fetchDemographicsData();
        }
    }, [state_name, county, activeTab]);

    // Fetch county health ratings data for use in the health tab
    useEffect(() => {
        async function fetchEducationData() {
            try {
                let resp;
                if (activeTab === "state") {
                    resp = await fetch(`${API_BASE}/api/education/state/${state_full}/${state_name}`);
                } else {
                    resp = await fetch(`${API_BASE}/api/education/county/${state_name}/${county}`);
                }
                
                const data = await resp.json();
                if (data.results) {
                    if (activeTab === "state") {
                        setEducationStateResults(data.results);
                    } else {
                        setEducationCountyResults(data.results);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch education data results:", err);
            }
        }

        if (state_name && (activeTab === "state" || (activeTab === "county" && county))) {
            fetchEducationData();
        }
    }, [state_name, county, activeTab]);

    // Fetch census data for economy tab
    useEffect(() => {
        async function fetchEconomyData() {
            try {
                let resp;
                if (activeTab === "state") {
                    resp = await fetch(`${API_BASE}/api/economy/state/${state_full}/${state_name}`);
                } else {
                    resp = await fetch(`${API_BASE}/api/economy/county/${state_name}/${county}`);
                }
                
                const data = await resp.json();
                if (data.results) {
                    if (activeTab === "state") {
                        setEconomyStateResults(data.results);
                    } else {
                        setEconomyCountyResults(data.results);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch economy data results:", err);
            }
        }

        if (state_name && (activeTab === "state" || (activeTab === "county" && county))) {
            fetchEconomyData();
        }
    }, [state_name, county, activeTab]);



    return (
        <div className="flex h-full relative">
            {/* Mobile Menu Button */}
            {!sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden fixed top-19 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg shadow-lg"
                >
                    <Menu size={24} />
                </button>
            )}

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Left Sidebar - Representatives */}
            <div className={`
                fixed lg:static inset-y-0 left-0 z-40
                w-72 bg-gray-50 border-r border-gray-200 overflow-y-auto
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-4">
                    <div className="flex items-center justify-between mb-3 lg:block">
                        <h2 className="text-lg font-bold text-gray-800">Your Representatives</h2>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    {senators.length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                                U.S. Senators
                            </h3>
                            {senators.map(senator => (
                                <RepCard
                                    key={senator.bio_id}
                                    member={senator}
                                    isHighlighted={highlightedReps.includes(senator.bio_id)}
                                />
                            ))}
                        </div>
                    )}
                    
                    {houseReps.length > 0 && (
                        <div>
                            <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                                U.S. Representative
                            </h3>
                            {houseReps.map(rep => (
                                <RepCard
                                    key={rep.bio_id}
                                    member={rep}
                                    isHighlighted={highlightedReps.includes(rep.bio_id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
                {/* State/County Tabs */}
                <div className="border-b border-gray-200 bg-white px-4 sm:px-6 mt-16 lg:mt-0">
                    <div className="flex space-x-4 sm:space-x-8 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab("state")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                                activeTab === "state"
                                    ? "border-orange-500 text-orange-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            {state_full || "Your State"}
                        </button>
                        <button
                            onClick={() => setActiveTab("county")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                                activeTab === "county"
                                    ? "border-orange-500 text-orange-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            {county || "Your County"}
                        </button>
                    </div>
                </div>

                    {showAccuracyBanner && (
                        <div className="bg-yellow-50 border-b border-yellow-200 p-3">
                            <div className="max-w-6xl mx-auto flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-yellow-800">
                                        <span className="font-medium">District or representative look wrong?</span> ZIP codes can span multiple districts. Use the{' '}
                                        <span className="inline-flex items-center gap-1 font-semibold">
                                            <MapPin size={12} className="inline" /> address input
                                        </span>{' '}
                                        in the header above for better accuracy.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setShowAccuracyBanner(false)}
                                    className="flex-shrink-0 text-yellow-600 hover:text-yellow-800"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    )}




                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="max-w-6xl mx-auto p-4 sm:p-6">
                        {/* Sub-tabs with info icon */}
                        <div className="flex flex-wrap sm:flex-nowrap gap-1 mb-6 bg-gray-200 rounded-lg p-1 relative">
                            {["civics", "demographics", "economy", "health", "education"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveSubTab(tab)}
                                    className={`flex-1 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors capitalize whitespace-nowrap ${
                                        activeSubTab === tab
                                            ? "bg-white text-gray-900 shadow"
                                            : "text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                            
                        </div>

                        {/* Tab Content */}
                        {activeSubTab === "civics" && <CivicsTab civicsData={currentCivicsData} />}
                        {activeSubTab === "demographics" && <DemographicsTab demographicsData={currentDemographicsData} />}
                        {activeSubTab === "economy" && <EconomyTab  economyData={currentEconomyData} />}
                        {activeSubTab === "health" && <HealthTab healthData={currentHealthData} />}
                        {activeSubTab === "education" && <EducationTab educationData={currentEducationData}/>}

                        {/* Collapsible sources at bottom */}
                        <CollapsibleSources />
                    </div>
                </div>
            </div>
        </div>
    );
}