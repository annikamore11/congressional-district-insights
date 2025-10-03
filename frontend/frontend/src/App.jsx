import { useEffect, useState } from "react";
import { Menu, X, ChevronRight, ChevronLeft, Building2, LogIn, LogOut, UserRound, MapPinHouse, MapPin, User } from "lucide-react";
import Chart from "chart.js/auto";
import {myIssues, issueCategories, organizations } from "./data/constants.js";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [zip, setZip] = useState("");
  const [region, setRegion] = useState("");

  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [hasFecData, setHasFecData] = useState(true);
  const [chart, setChart] = useState(null);
  const [pieChart, setPieChart] = useState(null);
  const [stateTotalsChart, setStateTotalsChart] = useState(null);
  const [contributors, setContributors] = useState([]);

  const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";
  console.log("API BASE: ", API_BASE)
  useEffect(() => {
    fetch(`${API_BASE}/api/states`) 
      .then((r) => r.json())
      .then((data) => setStates(data));
  }, []);

  useEffect(() => {
    async function fetchZip() {
      try {
        const resp = await fetch("https://ipinfo.io/json?token=dee82221860725");
        const data = await resp.json();
        if (data.postal) {
          setZip(data.postal);
        }
      } catch (err) {
        console.error("Failed to fetch IP location:", err);
      }
    }
    fetchZip();
    async function fetchRegion() {
      try {
        const resp = await fetch("https://ipinfo.io/json?token=dee82221860725");
        const data = await resp.json();
        if (data.region) {
          setRegion(data.region);
        }
      } catch (err) {
        console.error("Failed to fetch region:", err);
      }
    }
    fetchRegion();
  }, []);

  const handleStateChange = (e) => {
    const st = e.target.value;
    setSelectedState(st);
    if (!st) {
      setMembers([]);
      return;
    }
    fetch(`${API_BASE}/api/members/${st}`)
      .then((r) => r.json())
      .then((data) => setMembers(data));
  };

  const handleMemberClick = async (m) => {
    setSelectedMember(m);
    setHasFecData(true);

    // Finance totals and contribution breakdown
    const resp = await fetch(`${API_BASE}/api/member_fec`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fec_ids: m.fec_ids }),
    });
    const data = await resp.json();
    const agg = data.aggregated || {};

    // If no receipts, mark as no data and skip all chart setup
    if (!agg.receipts || agg.receipts === 0) {
      setHasFecData(false);
      setContributors([]);
      if (chart) chart.destroy();
      if (pieChart) pieChart.destroy();
      if (stateTotalsChart) stateTotalsChart.destroy();
      return;
    }

    // Top State Contributors
    const respState = await fetch(`${API_BASE}/api/member_fec_state_top5`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fec_ids: m.fec_ids }),
    });
    const dataState = await respState.json();
    
    // Top individual campaign committee contributors
    const respCont = await fetch(`${API_BASE}/api/top_contributors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fec_ids: m.fec_ids }),
    });
    const dataCont = await respCont.json();
    
    setContributors(dataCont.top_contributors);
    
    

    // draw finance summary bar chart
    const ctx = document.getElementById("financeChart");
    if (chart) chart.destroy();
    const newChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Cash", "Debts", "Raised", "Spent"],
        datasets: [
          {
            label: "USD",
            data: [
              agg.cash_on_hand || 0,
              agg.debts || 0,
              agg.receipts || 0,
              agg.disbursements || 0,
            ],
            backgroundColor: ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"],
          },
        ],
      },
      options: {
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: false } },
      },
    });
    setChart(newChart);

    // Pie chart: Contribution breakdown 
    const pieCtx = document.getElementById("contributionPie");
    if (pieChart) pieChart.destroy();
    const pieData = [
      agg.large_contributions || 0,
      agg.small_contributions || 0,
      agg.candidate_contributions || 0,
      agg.PAC_contributions || 0,
      agg.other_contributions || 0,
    ];
   
    const newPieChart = new Chart(pieCtx, {
      type: "pie",
      data: {
        labels: ["Large", "Small", "Candidate", "PAC", "Other"],
        
        datasets: [
          {
            data: pieData,
            backgroundColor: ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"],
          },
        ],
      },
      options: {
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                const sum = pieData.reduce((a, b) => a + b, 0);
                const percent = ((ctx.raw / sum) * 100).toFixed(1);
                return `${ctx.label}: $${ctx.raw.toLocaleString()} (${percent}%)`;
              },
            },
          },
        },
      },
    });
    setPieChart(newPieChart);

  

  // Horizontal Bar chart: Top 5 State Contributors
  const stateCtx = document.getElementById("stateBarChart");
  if (stateTotalsChart) stateTotalsChart.destroy();
  const newStateChart = new Chart(stateCtx, {
    type: "bar",
    data: {
      labels: dataState.state_totals.map((d) => d.state),
      
      datasets: [
        {
          label: "Total Contributions ($)",
          data: dataState.state_totals.map((d) => d.total),
          backgroundColor: [
                    "#1f77b4",
                    "#ff7f0e",
                    "#2ca02c",
                    "#d62728",
                    "#9467bd",
                  ],
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      plugins: {
        legend: { display: "false" },
      },
      scales: {
        x: {
          ticks: {
            callback: (value) =>
              "$" +
            value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
          }
        }
      }
    },
  });
  setStateTotalsChart(newStateChart);

  };

  

return (
  <div className="h-screen w-screen flex flex-col">
    {/* Header */}
    <header className="flex items-center p-4 bg-gray-800 shadow z-10 justify-between">
      {/* Logo on the left */}
      <div className="flex-shrink-0">
        <p 
          className="text-s font-semibold text-white cursor-pointer" 
          onClick={() => navigate("/navigation-example/home")}
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
            <h3 className="font-semibold border-b border-t py-2 mb-2">Your Issues</h3>
            <ul className="grid grid-cols-5 gap-2">
              {myIssues.map((issue, idx) => (
                <li key={idx} className="hover:bg-gray-100 rounded cursor-pointer">
                  {issue}
                </li>
              ))}
            </ul>
            <div className="my-2"></div>
            <h3 className="font-semibold border-b border-t py-2 my-2">All Issues</h3>

            <ul className="grid grid-cols-5 gap-2">
              {issueCategories.map((issue, idx) => (
                <li key={idx} className="hover:bg-gray-100 p-2 rounded cursor-pointer">
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
                <li key={idx} className="hover:bg-gray-100 p-2 rounded cursor-pointer">
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
      <div className="fixed inset-0 bg-black opacity-20 z-10" 
      onClick={() => setMenuOpen(false)} >
      </div> 
    )}

    {/* Slide Menu */}
    <div
      className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-20 flex flex-col ${
        menuOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 flex justify-center font-bold border-b">Location Insights</div>
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
          <li className="flex items-center p-2 rounded hover:bg-gray-200 cursor-pointer text-gray-700">
            <MapPinHouse className="w-5 h-5 mr-2" />
            <span>{region} Overview</span>
          </li>
          <li className="flex items-center p-2 rounded hover:bg-gray-200 cursor-pointer text-gray-700">
            <MapPin className="w-5 h-5 mr-2" />
            <span>United States Overview</span>
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


    <div className="p-4 flex flex-col gap-6 flex-1 overflow-auto">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
        Congress Finance 2023-24
      </h1>

      <select
        className="border rounded px-4 py-3 text-lg w-64"
        onChange={handleStateChange}
        value={selectedState}
      >
        <option value="">-- Select State --</option>
        {states.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        className="border rounded px-4 py-3 text-lg w-64"
        onChange={(e) => {
          const member = members.find(m => m.bio_id === e.target.value);
          if (member) handleMemberClick(member);
        }}
        value={selectedMember?.bio_id || ""}
      >
        <option value="">-- Select Member --</option>
        {members.map((m) => (
          <option key={m.bio_id} value={m.bio_id}>
            {m.name} ({m.party})
          </option>
        ))}
      </select>


      {selectedMember && (
        <div className="mt-6 bg-white p-4 rounded border flex flex-col gap-6">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">{selectedMember.name}</h2>
            <p className="text-sm sm:text-base text-gray-600">
              {selectedMember.role} • {selectedMember.party}
            </p>
          </div>

          {/* Check for members who don't have fec data */}
          {hasFecData ? (
            <div className="flex justify-between flex-wrap gap-6">
              {/* Finance Overview Bar Chart */}
              <div className="flex-1">
                <h3 className="font-semibold text-center mb-2">Finance Overview</h3>
                <div className="relative w-full h-64 sm:h-72 md:h-80">
                  <canvas id="financeChart"></canvas>
                </div>
              </div>

              {/* Contribution Pie Chart */}
              <div className="flex-1">
                <h3 className="font-semibold text-center mb-2">Contribution Breakdown</h3>
                <div className="relative w-full h-64 sm:h-72 md:h-80">
                  <canvas id="contributionPie"></canvas>
                </div>
              </div>

              {/* State Totals Bar Chart */}
              <div className="flex-1">
                <h3 className="font-semibold text-center mb-2">Top 5 State Contributors</h3>
                <div className="relative w-full h-64 sm:h-72 md:h-80">
                  <canvas id="stateBarChart"></canvas>
                </div>
              </div>

              {/* Top Individual Contributors Table */}
              <div className="mt-6">
                <h3 className="font-semibold text-center mb-1">Top 10 Individual Contributors to Primary Campaign Committee</h3>
                <p className="font-semibold text-xs text-center mb-2">*Excludes Money Coming from PACs and Committees*</p>
                <div className="max-h-64 overflow-auto border rounded">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="text-left px-4 py-2 border-b">Rank</th>
                        <th className="text-left px-4 py-2 border-b">Contributor</th>
                        <th className="text-right px-4 py-2 border-b">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contributors.length > 0 ? (
                        contributors.map((c, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border-b">{idx + 1}</td>
                            <td className="px-4 py-2 border-b">{c.employer}</td>
                            <td className="px-4 py-2 border-b text-right">
                              ${Number(c.total || 0).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-4 py-2 text-center text-gray-500">
                            No contributors found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ): (
            <p className="text-red-500 font-semibold text-center">
              Sorry, no FEC information available for this member.
            </p>
          )}


        </div>
      )}
    </div>
  </div>
);
}

export default App;


