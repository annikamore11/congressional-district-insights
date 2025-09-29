import { useEffect, useState } from "react";
import Chart from "chart.js/auto";

function App() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [chart, setChart] = useState(null);

  const API_BASE = "http://127.0.0.1:5000"; // change after deploying

  useEffect(() => {
    fetch(`${API_BASE}/api/states`)
      .then(r => r.json())
      .then(data => setStates(data));
  }, []);

  const handleStateChange = (e) => {
    const st = e.target.value;
    setSelectedState(st);
    fetch(`${API_BASE}/api/members/${st}`)
      .then(r => r.json())
      .then(data => setMembers(data));
  };

  const handleMemberClick = async (m) => {
    setSelectedMember(m);
    const resp = await fetch(`${API_BASE}/api/member_fec`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ fec_ids: m.fec_ids })
    });
    const data = await resp.json();
    const agg = data.aggregated || {};

    // draw chart
    const ctx = document.getElementById("financeChart");
    if (chart) chart.destroy();
    const newChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Cash", "Debts", "Raised", "Spent"],
        datasets: [
          {
            label: "USD",
            data: [agg.cash_on_hand, agg.debts, agg.receipts, agg.disbursements],
          },
        ],
      },
      options: { scales: { y: { beginAtZero: true } } },
    });
    setChart(newChart);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Congress Finance 2024</h1>

      <select
        className="border p-2 rounded mb-4"
        onChange={handleStateChange}
        value={selectedState}
      >
        <option value="">-- Select State --</option>
        {states.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <ul className="space-y-2">
        {members.map((m) => (
          <li
            key={m.bio_id}
            onClick={() => handleMemberClick(m)}
            className="cursor-pointer p-2 border rounded hover:bg-gray-100"
          >
            {m.name} ({m.party})
          </li>
        ))}
      </ul>

      {selectedMember && (
        <div className="mt-6 bg-white p-4 rounded border">
          <h2 className="text-xl font-semibold">{selectedMember.name}</h2>
          <p className="text-sm text-gray-600">
            {selectedMember.role} • {selectedMember.party}
          </p>
          <canvas id="financeChart" height="200"></canvas>
        </div>
      )}
    </div>
  );
}

export default App;

