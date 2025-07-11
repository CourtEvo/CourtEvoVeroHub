import React, { useState } from "react";
import { saveAs } from "file-saver";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { FaChartLine, FaArrowRight, FaExclamationTriangle, FaStar, FaCheckCircle, FaArrowDown } from "react-icons/fa";

const initialTeams = [
  { level: "U12", players: 16, elite: 2, promoted: 3, incoming: 2, dropout: 1, coach: "A. Novak", star: "B. Perković" },
  { level: "U14", players: 14, elite: 3, promoted: 2, incoming: 3, dropout: 2, coach: "B. Petrović", star: "M. Matić" },
  { level: "U16", players: 12, elite: 1, promoted: 3, incoming: 2, dropout: 3, coach: "S. Ivanović", star: "I. Kovač" },
  { level: "U18", players: 10, elite: 0, promoted: 2, incoming: 1, dropout: 2, coach: "P. Smith", star: "—" },
  { level: "Senior", players: 8, elite: 0, promoted: 0, incoming: 2, dropout: 0, coach: "J. Marković", star: "—" }
];

// Helper: calculate retention
function retention(t) {
  if (!t.players) return 100;
  return Math.round(100 * (t.players - t.dropout) / t.players);
}

function badge(t) {
  if (t.players < 9) return { label: "Bottleneck", color: "#e24242", icon: <FaExclamationTriangle /> };
  if (t.dropout >= 3) return { label: "Attrition Risk", color: "#FFA500", icon: <FaArrowDown /> };
  if (t.elite >= 2) return { label: "Elite Supply", color: "#FFD700", icon: <FaStar /> };
  return { label: "Healthy", color: "#1de682", icon: <FaCheckCircle /> };
}

// Export CSV
function exportCSV(teams) {
  let rows = [
    ["Level", "# Players", "# Elites", "Promoted", "Incoming", "Dropout", "Coach", "Star", "Retention %", "Badge"]
  ];
  teams.forEach(t => {
    const b = badge(t);
    rows.push([
      t.level, t.players, t.elite, t.promoted, t.incoming, t.dropout, t.coach, t.star, retention(t), b.label
    ]);
  });
  const csv = rows.map(row => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `CourtEvoVero_TalentPipeline_${new Date().toISOString().slice(0,10)}.csv`);
}

export default function TalentPipelineAnalyzer() {
  const [teams, setTeams] = useState(initialTeams);

  // Add/Remove
  function addTeam() {
    setTeams([...teams, { level: "", players: 10, elite: 0, promoted: 0, incoming: 0, dropout: 0, coach: "", star: "" }]);
  }
  function removeTeam(idx) {
    setTeams(teams.filter((_, i) => i !== idx));
  }

  // For bar chart
  const barData = teams.map(t => ({
    level: t.level, Players: t.players, Elite: t.elite
  }));

  return (
    <div className="max-w-6xl mx-auto py-8 px-3"
      style={{
        fontFamily: "Segoe UI, sans-serif", color: "#fff",
        background: "linear-gradient(120deg, #222a2e 65%, #283E51 100%)",
        borderRadius: "28px", boxShadow: "0 8px 32px #2229",
        minHeight: 800
      }}>
      {/* Header */}
      <div className="flex items-center gap-7 mb-8">
        <div className="bg-[#181e23ee] rounded-2xl p-4 shadow-2xl flex items-center border-2 border-[#FFD70033]">
          <FaChartLine size={50} color="#FFD700" />
        </div>
        <div>
          <h1 className="font-extrabold text-3xl tracking-tight" style={{ letterSpacing: 2, color: "#FFD700", textShadow: "0 2px 10px #0009" }}>
            Talent Pipeline <span className="text-[#1de682]">Analyzer</span>
          </h1>
          <div className="font-bold italic text-[#FFD700] text-lg mt-2 tracking-wide">
            BE REAL. BE VERO.
          </div>
        </div>
        <div className="ml-auto">
          <button
            className="px-5 py-2 bg-[#FFD700] text-black rounded-xl font-bold shadow hover:scale-105 transition"
            onClick={() => exportCSV(teams)}
          >Export CSV</button>
        </div>
      </div>

      {/* Bar/Pipeline Chart */}
      <div className="mb-8 bg-[#181e23] rounded-2xl p-6 shadow-lg border-l-8 border-[#FFD70099]">
        <div className="font-black text-xl mb-3" style={{ color: "#FFD700" }}>Player & Elite Count by Level</div>
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={barData}>
            <XAxis dataKey="level" tick={{ fill: "#FFD700", fontSize: 15 }} />
            <YAxis fontSize={13} />
            <Tooltip />
            <Bar dataKey="Players" fill="#1de682">
              {barData.map((entry, idx) =>
                <Cell key={idx} fill="#1de682" />
              )}
            </Bar>
            <Bar dataKey="Elite" fill="#FFD700" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pipeline Table */}
      <div className="mb-10 bg-[#181e23ee] rounded-2xl p-5 shadow-xl border-l-8 border-[#FFD70099]">
        <div className="flex justify-between items-center mb-3">
          <div className="font-black text-xl" style={{ color: "#1de682" }}>Pipeline Table</div>
          <button onClick={addTeam}
            className="bg-[#FFD700] text-black rounded-lg px-3 py-1 font-bold hover:scale-105 shadow">+ Add Level</button>
        </div>
        <div className="overflow-auto" style={{ maxHeight: 340 }}>
          <table className="min-w-full text-base">
            <thead>
              <tr>
                <th>Level</th>
                <th>Players</th>
                <th>Elites</th>
                <th>Promoted</th>
                <th>Incoming</th>
                <th>Dropout</th>
                <th>Retention %</th>
                <th>Coach</th>
                <th>Star</th>
                <th>Badge</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t, idx) => {
                const b = badge(t);
                return (
                  <tr key={idx} className={b.label === "Healthy" ? "bg-[#1de68222]" : b.label === "Elite Supply" ? "bg-[#FFD70033]" : b.label === "Bottleneck" ? "bg-[#e2424233]" : ""}>
                    <td>
                      <input className="bg-[#23292f] text-white rounded px-2 py-1 w-16" value={t.level}
                        onChange={e => { const arr = [...teams]; arr[idx].level = e.target.value; setTeams(arr); }} />
                    </td>
                    <td>
                      <input type="number" min={0} max={40} className="w-14 text-center bg-[#23292f] rounded"
                        value={t.players}
                        onChange={e => { const arr = [...teams]; arr[idx].players = Number(e.target.value); setTeams(arr); }} />
                    </td>
                    <td>
                      <input type="number" min={0} max={20} className="w-12 text-center bg-[#23292f] rounded"
                        value={t.elite}
                        onChange={e => { const arr = [...teams]; arr[idx].elite = Number(e.target.value); setTeams(arr); }} />
                    </td>
                    <td>
                      <input type="number" min={0} max={10} className="w-12 text-center bg-[#23292f] rounded"
                        value={t.promoted}
                        onChange={e => { const arr = [...teams]; arr[idx].promoted = Number(e.target.value); setTeams(arr); }} />
                    </td>
                    <td>
                      <input type="number" min={0} max={10} className="w-12 text-center bg-[#23292f] rounded"
                        value={t.incoming}
                        onChange={e => { const arr = [...teams]; arr[idx].incoming = Number(e.target.value); setTeams(arr); }} />
                    </td>
                    <td>
                      <input type="number" min={0} max={10} className="w-12 text-center bg-[#23292f] rounded"
                        value={t.dropout}
                        onChange={e => { const arr = [...teams]; arr[idx].dropout = Number(e.target.value); setTeams(arr); }} />
                    </td>
                    <td className="text-center">{retention(t)}%</td>
                    <td>
                      <input className="bg-[#23292f] text-white rounded px-2 py-1 w-20" value={t.coach}
                        onChange={e => { const arr = [...teams]; arr[idx].coach = e.target.value; setTeams(arr); }} />
                    </td>
                    <td>
                      <input className="bg-[#23292f] text-white rounded px-2 py-1 w-20" value={t.star}
                        onChange={e => { const arr = [...teams]; arr[idx].star = e.target.value; setTeams(arr); }} />
                    </td>
                    <td>
                      <span className="inline-flex items-center font-bold" style={{ color: b.color }}>
                        {b.icon}
                        <span className="ml-1">{b.label}</span>
                      </span>
                    </td>
                    <td>
                      <button onClick={() => removeTeam(idx)}
                        className="text-[#e24242] font-black px-2">×</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-10 border-t pt-6 border-[#FFD700]">
        <div className="flex items-center gap-3">
          <FaChartLine size={34} color="#FFD700" />
          <div className="text-[#FFD700] font-extrabold tracking-wider text-xl">COURTEVO VERO</div>
        </div>
        <div className="text-lg text-[#1de682] italic font-bold">BE REAL. BE VERO.</div>
      </div>
    </div>
  );
}
