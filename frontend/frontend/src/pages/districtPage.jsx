import React, { useState, useEffect } from "react";
import CivicsTab from "../components/districtTabs/CivicsTab";
import DemographicsTab from "../components/districtTabs/DemographicsTab";
import EconomyTab from "../components/districtTabs/EconomyTab";
import HealthTab from "../components/districtTabs/HealthTab";
import EducationTab from "../components/districtTabs/EducationTab";
import RepCard from "../components/districtTabs/RepCard";

// Process election data into percentage by party for most recent years
function processElectionData(rawResults, setChartFn) {
    // Get last 6 election years
    const years = [...new Set(rawResults.map(r => r.year))].sort((a, b) => b - a).slice(0, 6).reverse();
    
    const chartData = years.map(year => {
        const yearData = rawResults.filter(r => r.year === year);
        const dem = yearData.filter(r => r.party.toLowerCase() === "democrat")
            .reduce((sum, r) => sum + r.candidatevotes, 0);
        const rep = yearData.filter(r => r.party.toLowerCase() === "republican")
            .reduce((sum, r) => sum + r.candidatevotes, 0);
        const other = yearData.filter(r => 
            r.party.toLowerCase() !== "democrat" && r.party.toLowerCase() !== "republican"
        ).reduce((sum, r) => sum + r.candidatevotes, 0);
        
        const total = dem + rep + other;
        
        return {
            year: year.toString(),
            Democrat: total > 0 ? parseFloat(((dem / total) * 100).toFixed(1)) : 0,
            Republican: total > 0 ? parseFloat(((rep / total) * 100).toFixed(1)) : 0,
            Other: total > 0 ? parseFloat(((other / total) * 100).toFixed(1)) : 0
        };
    });
    
    setChartFn(chartData);
}

export default function DistrictContent({ state_name, state_full, lat, long }) {
    const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5001";

    const [activeTab, setActiveTab] = useState("state");
    const [activeSubTab, setActiveSubTab] = useState("civics");
    const [stateResults, setStateResults] = useState([]);
    const [countyResults, setCountyResults] = useState([]);
    const [healthStateResults, setHealthStateResults] = useState([]);
    const [healthCountyResults, setHealthCountyResults] = useState([]);
    const [demograpicsStateResults, setDemographicsStateResults] = useState([]);
    const [demographicsCountyResults, setDemographicsCountyResults] = useState([]);
    const [educationStateResults, setEducationStateResults] = useState([]);
    const [educationCountyResults, setEducationCountyResults] = useState([]);
    const [members, setMembers] = useState([]);
    const [county, setCounty] = useState(null);
    const [stateChartData, setStateChartData] = useState([]);
    const [countyChartData, setCountyChartData] = useState([]);

    const senators = members.filter(m => m.role === "sen");
    const houseReps = members.filter(m => m.role === "rep");

    // Determine which reps to highlight based on active tab
    const highlightedReps = activeTab === "state" 
        ? senators.map(s => s.bio_id)
        : members.map(m => m.bio_id);

    const currentChartData = activeTab === "state" ? stateChartData : countyChartData;
    const currentHealthData = activeTab === "state" ? healthStateResults : healthCountyResults;
    const currentDemographicsData = activeTab === "state" ? demograpicsStateResults : demographicsCountyResults;
    const currentEducationData = activeTab === "state" ? educationStateResults : educationCountyResults;

    useEffect(() => {
        async function fetchUserReps() {
            try {
                const resp = await fetch(`${API_BASE}/api/reps?lat=${lat}&long=${long}`);
                const data = await resp.json();
                
                const members = data.results;
                setMembers(members);
                setCounty(data.county);
            } catch (err) {
                console.error("Failed to fetch members:", err);
            }
        }
        
        if (lat && long) {
            fetchUserReps();
        }
    }, [lat, long]);

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
                        setStateResults(data.results);
                        processElectionData(data.results, setStateChartData);
                    } else {
                        setCountyResults(data.results);
                        processElectionData(data.results, setCountyChartData);
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


    

    return (
        <div className="flex h-full">
            {/* Left Sidebar - Representatives */}
            <div className="w-72 bg-gray-50 border-r border-gray-200 overflow-y-auto">
                <div className="p-4">
                    <h2 className="text-lg font-bold mb-3 text-gray-800">Your Representatives</h2>
                    
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
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* State/County Tabs */}
                <div className="border-b border-gray-200 bg-white px-6">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab("state")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === "state"
                                    ? "border-purple-500 text-purple-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            {state_full}
                        </button>
                        <button
                            onClick={() => setActiveTab("county")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === "county"
                                    ? "border-purple-500 text-purple-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            {county || "Your County"}
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="max-w-6xl mx-auto p-6">
                        {/* Sub-tabs */}
                        <div className="flex space-x-1 mb-6 bg-gray-200 rounded-lg p-1">
                            {["civics", "demographics", "economy", "health", "education"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveSubTab(tab)}
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors capitalize ${
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
                        {activeSubTab === "civics" && <CivicsTab chartData={currentChartData} />}
                        {activeSubTab === "demographics" && <DemographicsTab demographicsData={currentDemographicsData} />}
                        {activeSubTab === "economy" && <EconomyTab />}
                        {activeSubTab === "health" && <HealthTab healthData={currentHealthData} />}
                        {activeSubTab === "education" && <EducationTab educationData={currentEducationData}/>}
                    </div>
                </div>
            </div>
        </div>
    );
}