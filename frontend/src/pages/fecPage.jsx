import React, { useState, useEffect } from "react";
import Chart from "chart.js/auto";

export default function FECContent() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [hasFecData, setHasFecData] = useState(true);
  const [chart, setChart] = useState(null);
  const [pieChart, setPieChart] = useState(null);
  const [stateTotalsChart, setStateTotalsChart] = useState(null);
  const [contributors, setContributors] = useState([]);

  const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5002";
  
  useEffect(() => {
    fetch(`${API_BASE}/api/states`)
      .then((r) => r.json())
      .then((data) => setStates(data));
  }, []);

  const handleStateChange = (e) => {
    const st = e.target.value;
    setSelectedState(st);
    if (!st) {
      setMembers([]);
      return;
    }
    fetch(`${API_BASE}/api/member/${st}`)
      .then((r) => r.json())
      .then((data) => setMembers(data));
  };

  const handleMemberClick = async (m) => {
    setSelectedMember(m);
    setHasFecData(true);

    // Finance totals and contribution breakdown
    const resp = await fetch(`${API_BASE}/api/member/fec_totals`, {
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
    const respState = await fetch(`${API_BASE}/api/member/fec_state_top5`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fec_ids: m.fec_ids }),
    });
    const dataState = await respState.json();

    // Top individual campaign committee contributors
    const respCont = await fetch(`${API_BASE}/api/member/top_contributors`, {
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
            backgroundColor: [
              "#3B82F6",
              "#EF4444",
              "#10B981",
              "#F59E0B",
              "#8B5CF6",
            ],
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
                return `${
                  ctx.label
                }: $${ctx.raw.toLocaleString()} (${percent}%)`;
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
                "$" + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
            },
          },
        },
      },
    });
    setStateTotalsChart(newStateChart);
  };

  return (
    <div className="h-screen w-screen flex flex-col">
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
            const member = members.find((m) => m.bio_id === e.target.value);
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
                <h2 className="text-lg sm:text-xl font-semibold">
                {selectedMember.name}
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                {selectedMember.role} • {selectedMember.party}
                </p>
            </div>

            {/* Check for members who don't have fec data */}
            {hasFecData ? (
                <div className="flex justify-between flex-wrap gap-6">
                {/* Finance Overview Bar Chart */}
                <div className="flex-1">
                    <h3 className="font-semibold text-center mb-2">
                    Finance Overview
                    </h3>
                    <div className="relative w-full h-64 sm:h-72 md:h-80">
                    <canvas id="financeChart"></canvas>
                    </div>
                </div>

                {/* Contribution Pie Chart */}
                <div className="flex-1">
                    <h3 className="font-semibold text-center mb-2">
                    Contribution Breakdown
                    </h3>
                    <div className="relative w-full h-64 sm:h-72 md:h-80">
                    <canvas id="contributionPie"></canvas>
                    </div>
                </div>

                {/* State Totals Bar Chart */}
                <div className="flex-1">
                    <h3 className="font-semibold text-center mb-2">
                    Top 5 State Contributors
                    </h3>
                    <div className="relative w-full h-64 sm:h-72 md:h-80">
                    <canvas id="stateBarChart"></canvas>
                    </div>
                </div>

                {/* Top Individual Contributors Table */}
                <div className="mt-6">
                    <h3 className="font-semibold text-center mb-1">
                    Top 10 Individual Contributors to Primary Campaign Committee
                    </h3>
                    <p className="font-semibold text-xs text-center mb-2">
                    *Excludes Money Coming from PACs and Committees*
                    </p>
                    <div className="max-h-64 overflow-auto border rounded">
                    <table className="min-w-full border border-gray-200">
                        <thead className="bg-gray-100 sticky top-0">
                        <tr>
                            <th className="text-left px-4 py-2 border-b">Rank</th>
                            <th className="text-left px-4 py-2 border-b">
                            Contributor
                            </th>
                            <th className="text-right px-4 py-2 border-b">
                            Amount
                            </th>
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
                            <td
                                colSpan="3"
                                className="px-4 py-2 text-center text-gray-500"
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
            ) : (
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
