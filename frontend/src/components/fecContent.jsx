import React, { useState, useEffect } from "react";
import Chart from "chart.js/auto";
import {STATE_FULL} from './constants';

export default function FECContent({ member }) {  
    // Add this helper function at the top of your component
const formatCurrency = (value) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  } else {
    return `$${value.toFixed(0)}`;
  }
};

  const [hasFecData, setHasFecData] = useState(true);
  const [loading, setLoading] = useState(true);
  const [chart, setChart] = useState(null);
  const [pieChart, setPieChart] = useState(null);
  const [stateTotalsChart, setStateTotalsChart] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [aggregatedData, setAggregatedData] = useState(null);
  const [topState, setTopState] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5002";

  useEffect(() => {
    if (member?.bio_id) {
        loadFECData();
    }
  }, [member?.bio_id]);

  const loadFECData = async () => {
    setLoading(true);
    setHasFecData(true);

    try {
      // Get FEC IDs for this member
      const idResp = await fetch(`${API_BASE}/api/member/${member.bio_id}`);
      const idData = await idResp.json();

      if (!idData.length) {
        setHasFecData(false);
        setContributors([]);
        destroyCharts();
        setLoading(false);
        return;
      }

      // Finance totals and contribution breakdown
      const resp = await fetch(`${API_BASE}/api/member/fec_totals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fec_ids: idData }),
      });
      const data = await resp.json();
      const agg = data.aggregated || {};

      // If no receipts, mark as no data
      if (!agg.receipts || agg.receipts === 0) {
        setHasFecData(false);
        setContributors([]);
        destroyCharts();
        setLoading(false);
        return;
      }
      setAggregatedData(agg);

      // Top State Contributors
      const respState = await fetch(`${API_BASE}/api/member/fec_state_top5`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fec_ids: idData }),
      });
      const dataState = await respState.json();
      setTopState(dataState.state_totals[0].state);

      // Top individual contributors
      const respCont = await fetch(`${API_BASE}/api/member/top_contributors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fec_ids: idData }),
      });
      const dataCont = await respCont.json();

      setContributors(dataCont.top_contributors || []);

      // Draw charts
      drawFinanceChart(agg);
      drawPieChart(agg);
      drawStateChart(dataState);

      setLoading(false);
    } catch (error) {
      console.error("Error loading FEC data:", error);
      setHasFecData(false);
      setLoading(false);
    }
  };

  const destroyCharts = () => {
    if (chart) chart.destroy();
    if (pieChart) pieChart.destroy();
    if (stateTotalsChart) stateTotalsChart.destroy();
  };

  const drawFinanceChart = (agg) => {
  const ctx = document.getElementById("financeChart");
  if (!ctx) return;
  
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
          backgroundColor: ["#10b981", "#ef4444", "#3b82f6", "#f59e0b"], // emerald, red, blue, amber
          borderRadius: 8,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { 
        y: { 
          beginAtZero: true,
          grid: {
            color: '#f1f5f9',
          },
          ticks: {
            callback: (value) => '$' + value.toLocaleString(),
            color: '#64748b',
          }
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#64748b',
          }
        }
      },
      plugins: { 
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e293b',
          padding: 12,
          displayColors: false,
          callbacks: {
            label: (context) => '$' + context.parsed.y.toLocaleString(),
          }
        }
      },
    },
  });
  setChart(newChart);
};

const drawPieChart = (agg) => {
  const pieCtx = document.getElementById("contributionPie");
  if (!pieCtx) return;

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
          backgroundColor: [
            "#3b82f6", // blue
            "#8b5cf6", // violet
            "#10b981", // emerald
            "#f59e0b", // amber
            "#6366f1", // indigo
          ],
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: "bottom",
          labels: {
            padding: 15,
            color: '#64748b',
            font: {
              size: 12,
            }
          }
        },
        tooltip: {
          backgroundColor: '#1e293b',
          padding: 12,
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
};

const drawStateChart = (dataState) => {
  const stateCtx = document.getElementById("stateBarChart");
  if (!stateCtx) return;

  if (stateTotalsChart) stateTotalsChart.destroy();
  const newStateChart = new Chart(stateCtx, {
    type: "bar",
    data: {
      labels: dataState.state_totals?.map((d) => d.state) || [],
      datasets: [
        {
          label: "Total Contributions ($)",
          data: dataState.state_totals?.map((d) => d.total) || [],
          backgroundColor: [
            "#10b981", // emerald
            "#3b82f6", // blue
            "#8b5cf6", // violet
            "#f59e0b", // amber
            "#06b6d4", // cyan
          ],
          borderRadius: 8,
          borderWidth: 0,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e293b',
          padding: 12,
          displayColors: false,
          callbacks: {
            label: (context) => '$' + context.parsed.x.toLocaleString(),
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: '#f1f5f9',
          },
          ticks: {
            callback: (value) => "$" + value.toLocaleString(),
            color: '#64748b',
          },
        },
        y: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#64748b',
          }
        }
      },
    },
  });
  setStateTotalsChart(newStateChart);
};

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyCharts();
    };
  }, []);

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading campaign finance data...</p>
        </div>
    );
  }

 return (

    <div className="p-6 bg-indigo-200 min-h-screen">
        <div className="max-w-7xl mx-auto">
            
        {hasFecData && aggregatedData ? (
            <div className="flex flex-col gap-6">
                {/* Key Metrics at Top */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-indigo-50 rounded-lg shadow-md p-5 border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">Total Raised</p>
                    <p className="text-2xl font-bold text-indigo-600">
                    {formatCurrency(aggregatedData.receipts || 0)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">2023-24 Cycle</p>
                </div>
                <div className="bg-indigo-50 rounded-lg shadow-md p-5 border border-indigo-200">
                    <p className="text-sm text-slate-600 mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-amber-600">
                    {formatCurrency(aggregatedData.disbursements || 0)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Campaign expenses</p>
                </div>
                <div className="bg-indigo-50 rounded-lg shadow-md p-5 border border-indigo-200">
                    <p className="text-sm text-slate-600 mb-1">Top State Contributor</p>
                    <p className="text-2xl font-bold text-blue-600">
                    {topState ? STATE_FULL[topState] || topState : 'N/A'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">By total amount</p>
                </div>
                <div className="bg-indigo-50 rounded-lg shadow-md p-5 border border-indigo-200">
                    <p className="text-sm text-slate-600 mb-1">Small Donors</p>
                    <p className="text-2xl font-bold text-violet-600">
                    {aggregatedData.receipts > 0 
                        ? ((aggregatedData.small_contributions / aggregatedData.receipts) * 100).toFixed(1)
                        : '0'}%
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Of total raised</p>
                </div>
                </div>

            {/* First Row - Finance Overview & Contribution Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Finance Overview Card */}
                <div className="bg-indigo-50 rounded-lg shadow-md p-6 border border-indigo-200 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-indigo-600 rounded"></span>
                    Finance Overview
                </h3>
                <div className="relative w-full h-80">
                    <canvas id="financeChart"></canvas>
                </div>
                </div>

                {/* Contribution Breakdown Card */}
                <div className="bg-indigo-50 rounded-lg shadow-md p-6 border border-indigo-200 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-violet-500 rounded"></span>
                    Contribution Breakdown
                </h3>
                <div className="relative w-full h-80 flex items-center justify-center">
                    <canvas id="contributionPie"></canvas>
                </div>
                </div>
            </div>

            {/* Second Row - State Contributors & Top Contributors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* State Contributors Card */}
                <div className="bg-indigo-50 rounded-lg shadow-md p-6 border border-indigo-200 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-amber-500 rounded"></span>
                    Top 5 State Contributors
                </h3>
                <div className="relative w-full h-80">
                    <canvas id="stateBarChart"></canvas>
                </div>
                </div>

                {/* Top Contributors Table Card */}
                <div className="bg-indigo-50 rounded-lg shadow-md border border-indigo-200 flex flex-col">
                <div className="p-6 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <span className="w-1 h-6 bg-cyan-500 rounded"></span>
                    Top 10 Individual Contributors
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                    Primary Campaign Committee • Excludes PACs and Committees
                    </p>
                </div>
                
                <div className="overflow-auto flex-1" style={{ maxHeight: '400px' }}>
                    <table className="min-w-full">
                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                        <tr>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">
                            Rank
                        </th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">
                            Contributor
                        </th>
                        <th className="text-right px-6 py-3 text-sm font-semibold text-slate-700">
                            Amount
                        </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-200">
                        {contributors.length > 0 ? (
                        contributors.map((c, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-slate-600">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 font-semibold">
                                {idx + 1}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-800">
                                {c.employer}
                            </td>
                            <td className="px-6 py-4 text-sm text-right font-semibold text-emerald-600">
                                ${Number(c.total || 0).toLocaleString()}
                            </td>
                            </tr>
                        ))
                        ) : (
                        <tr>
                            <td
                            colSpan="3"
                            className="px-6 py-8 text-center text-slate-500"
                            >
                            No contributors found
                            </td>
                        </tr>
                        )}
                    </tbody>
                    </table>
                </div>
                </div>
            </div>
            </div>
        ) : (
            <div className="bg-white rounded-lg shadow-md p-12 border border-slate-200 text-center">
            <div className="max-w-md mx-auto">
                <svg 
                className="w-16 h-16 mx-auto text-slate-300 mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                >
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
                </svg>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No FEC Data Available
                </h3>
                <p className="text-slate-600">
                Campaign finance information is not available for this representative.
                </p>
            </div>
            </div>
        )}
        </div>
    </div>
    );
}
