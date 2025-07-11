import React, { useState } from "react";
import { saveAs } from "file-saver";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { FaMoneyBillWave, FaMedal, FaTrophy, FaAward, FaChartPie, FaStar, FaFlag } from "react-icons/fa";

// COLORS
const COLORS = ["#1de682", "#FFD700", "#FFA500", "#e24242"];

// --- Helper functions ---
function formatMoney(val) {
  return "€" + (val ? Number(val).toLocaleString() : "0");
}

// Individual Athlete Data
const initialIndividuals = [
  // Demo data, blank out if you want
  { name: "Player 1", team: "U16", cost: 450, subsidy: 200, familyIncome: 20000, barriers: "Travel" },
  { name: "Player 2", team: "U14", cost: 900, subsidy: 0, familyIncome: 14000, barriers: "" }
];
// Team/Program Data
const initialTeams = [
  { team: "U14", athletes: 14, avgCost: 800, avgSubsidy: 150, percentSubsidized: 60, fundraised: 1200, lastYearIndex: 70 },
  { team: "U16", athletes: 12, avgCost: 650, avgSubsidy: 180, percentSubsidized: 75, fundraised: 2000, lastYearIndex: 60 }
];

// --- Main Component ---
export default function FinancialEquityMonitor() {
  const [mode, setMode] = useState("Individual");
  const [individuals, setIndividuals] = useState(initialIndividuals);
  const [teams, setTeams] = useState(initialTeams);

  // --- Equity Analytics ---
  // Individual
  const costTiers = [
    { label: "Low (<€500)", color: "#1de682", min: 0, max: 499 },
    { label: "Medium (€500-€799)", color: "#FFD700", min: 500, max: 799 },
    { label: "High (≥€800)", color: "#e24242", min: 800, max: 99999 }
  ];
  const pieData = costTiers.map(tier => ({
    name: tier.label,
    value: individuals.filter(i => i.cost >= tier.min && i.cost <= tier.max).length,
    color: tier.color
  }));

  // Calculate Equity Index (higher is better access, more subsidy, fewer high cost)
  function getEquityIndex(arr) {
    if (arr.length === 0) return 0;
    let total = 0;
    arr.forEach(i => {
      const costScore = i.cost <= 500 ? 1 : i.cost <= 799 ? 0.7 : 0.3;
      const subsidyScore = i.subsidy >= 200 ? 1 : i.subsidy > 0 ? 0.7 : 0.3;
      total += 0.7 * costScore + 0.3 * subsidyScore;
    });
    return Math.round((100 * total) / arr.length);
  }
  const individualEquity = getEquityIndex(individuals);

  function getTeamEquity(t) {
    const costScore = t.avgCost <= 500 ? 1 : t.avgCost <= 799 ? 0.7 : 0.3;
    const subsidyScore = t.avgSubsidy >= 200 ? 1 : t.avgSubsidy > 0 ? 0.7 : 0.3;
    return Math.round((0.7 * costScore + 0.3 * subsidyScore) * 100);
  }
  const teamEquityScores = teams.map(getTeamEquity);
  const avgTeamEquity = teams.length ? Math.round(teamEquityScores.reduce((a, b) => a + b, 0) / teams.length) : 0;

  // Most Improved Team logic (compares last year to now)
  let mostImproved = null;
  if (teams.length > 1) {
    const diffs = teams.map(t => (getTeamEquity(t) - (t.lastYearIndex || 0)));
    const max = Math.max(...diffs);
    if (max > 0) mostImproved = teams[diffs.indexOf(max)].team;
  }

  // Grant-readiness Meter: Ready if all teams/athletes complete & avg equity >80
  const grantReady =
    (mode === "Individual" ? individualEquity : avgTeamEquity) >= 80 &&
    ((mode === "Individual" && individuals.length > 2) ||
      (mode === "Team" && teams.length > 1));

  // Leaderboard (low cost = top)
  const individualSorted = [...individuals].sort((a, b) => (a.cost - b.cost) || a.name.localeCompare(b.name));
  const teamSorted = [...teams].sort((a, b) => getTeamEquity(b) - getTeamEquity(a));

  // --- UI Handlers ---
  // Add
  function addIndividual() {
    setIndividuals([...individuals, { name: "", team: "", cost: "", subsidy: "", familyIncome: "", barriers: "" }]);
  }
  function addTeam() {
    setTeams([...teams, { team: "", athletes: "", avgCost: "", avgSubsidy: "", percentSubsidized: "", fundraised: "", lastYearIndex: 0 }]);
  }
  // Remove
  function removeIndividual(idx) { setIndividuals(individuals.filter((_, i) => i !== idx)); }
  function removeTeam(idx) { setTeams(teams.filter((_, i) => i !== idx)); }

  // --- Export ---
  function exportCSV() {
    let rows = [];
    if (mode === "Individual") {
      rows = [["Name", "Team", "Cost", "Subsidy", "Family Income", "Barriers"]];
      individuals.forEach(i => {
        rows.push([i.name, i.team, i.cost, i.subsidy, i.familyIncome, i.barriers]);
      });
    } else {
      rows = [["Team", "# Athletes", "Avg Cost", "Avg Subsidy", "% Subsidized", "Fundraised", "Equity Index"]];
      teams.forEach(t => {
        rows.push([t.team, t.athletes, t.avgCost, t.avgSubsidy, t.percentSubsidized, t.fundraised, getTeamEquity(t)]);
      });
    }
    const csv = rows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `CourtEvoVero_FinancialEquity_${mode}_${new Date().toISOString().slice(0,10)}.csv`);
  }

  // --- Progress Badge ---
  function EquityBadge({ score }) {
    if (score >= 95) return <span className="inline-flex items-center px-3 py-1 rounded-xl font-bold bg-gradient-to-br from-[#FFD700] to-[#1de682] text-black shadow border-2 border-[#FFD70099] animate-bounce mr-2"><FaStar className="mr-1" /> ELITE EQUITY</span>;
    if (score >= 85) return <span className="inline-flex items-center px-3 py-1 rounded-xl font-bold bg-gradient-to-br from-[#b5bac2] to-[#FFD700] text-black shadow border-2 border-[#FFD70099] animate-pulse mr-2"><FaAward className="mr-1" /> Gold</span>;
    if (score >= 70) return <span className="inline-flex items-center px-3 py-1 rounded-xl font-bold bg-gradient-to-br from-[#b5bac2] to-[#e7e7e7] text-black shadow border-2 border-[#b5bac2] animate-pulse mr-2"><FaMedal className="mr-1" /> Silver</span>;
    if (score >= 50) return <span className="inline-flex items-center px-3 py-1 rounded-xl font-bold bg-gradient-to-br from-[#c89d53] to-[#FFD700] text-black shadow border-2 border-[#FFD70099] animate-pulse mr-2"><FaTrophy className="mr-1" /> Bronze</span>;
    return <span className="inline-flex items-center px-3 py-1 rounded-xl font-bold bg-[#23292f] text-[#FFD70099] border-2 border-[#333]">No Badge</span>;
  }

  // --- Main Render ---
  return (
    <div className="max-w-5xl mx-auto py-10 px-3" style={{ fontFamily: "Segoe UI, sans-serif", color: "#fff" }}>
      {/* Header */}
      <div className="flex items-center gap-5 mb-10">
        <div className="bg-[#181e23cc] rounded-2xl p-3 shadow-lg flex items-center">
          <FaMoneyBillWave size={44} color="#1de682" />
        </div>
        <div>
          <h1 className="font-extrabold text-3xl tracking-tight" style={{ letterSpacing: 2, color: "#FFD700" }}>
            Financial Access<br /><span className="text-[#1de682]">Equity Monitor</span>
          </h1>
          <div className="font-bold italic text-[#FFD700] text-lg mt-1 tracking-wide">
            BE REAL. BE VERO.
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            className={`px-4 py-2 rounded-xl font-bold shadow transition-all duration-200
              ${mode === "Individual"
                ? "bg-[#FFD700] text-black scale-105"
                : "bg-[#22272d] text-[#FFD700] border border-[#FFD700] hover:scale-105"
              }`}
            onClick={() => setMode("Individual")}
          >Individual</button>
          <button
            className={`px-4 py-2 rounded-xl font-bold shadow transition-all duration-200
              ${mode === "Team"
                ? "bg-[#1de682] text-black scale-105"
                : "bg-[#22272d] text-[#1de682] border border-[#1de682] hover:scale-105"
              }`}
            onClick={() => setMode("Team")}
          >Team/Program</button>
        </div>
      </div>

      {/* Analytics */}
      <div className="rounded-2xl mb-7 px-6 py-5 flex flex-col md:flex-row items-center justify-between" style={{
        background: "linear-gradient(90deg, #1e2a35cc 75%, #22292Fcc 100%)",
        border: "1.5px solid #FFD70055"
      }}>
        <div className="font-bold text-lg mb-1 md:mb-0" style={{ color: "#FFD700" }}>
          <EquityBadge score={mode === "Individual" ? individualEquity : avgTeamEquity} />
          Equity Index: <span className="font-black" style={{ color: "#1de682" }}>
            {(mode === "Individual" ? individualEquity : avgTeamEquity)} / 100
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="font-semibold text-base text-[#FFD700]">
            Grant-readiness: {grantReady ? <span className="text-[#1de682]">Ready</span> : <span className="text-[#e24242]">Incomplete</span>}
          </span>
          {mostImproved && (
            <span className="inline-flex items-center px-3 py-1 rounded-xl font-bold bg-gradient-to-br from-[#FFD700] to-[#1de682] text-black shadow border-2 border-[#FFD70099] animate-bounce">
              <FaTrophy className="mr-1" /> Most Improved: {mostImproved}
            </span>
          )}
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="my-8 grid md:grid-cols-2 gap-8">
        <div>
          <div className="font-black text-lg mb-3" style={{ color: "#FFD700" }}>Affordability Pie</div>
          <div className="bg-[#181e23] p-4 rounded-xl shadow">
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name}: ${Math.round(percent * 100)}%`
                  }
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <div className="font-black text-lg mb-3" style={{ color: "#FFD700" }}>Team Equity Comparison</div>
          <div className="bg-[#181e23] p-4 rounded-xl shadow">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={teams.map((t, i) => ({ name: t.team, Equity: getTeamEquity(t) }))}>
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Bar dataKey="Equity">
                  {teams.map((_, i) => (
                    <Cell key={i} fill={getTeamEquity(teams[i]) >= 80 ? "#1de682" : getTeamEquity(teams[i]) >= 60 ? "#FFD700" : "#e24242"} />
                  ))}
                </Bar>
                <Tooltip />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Input Table */}
      {mode === "Individual" ? (
        <div className="mb-10">
          <div className="flex justify-between items-center mb-3">
            <div className="font-black text-lg" style={{ color: "#1de682" }}>Individual Access Data</div>
            <button onClick={addIndividual} className="bg-[#FFD700] text-black rounded-lg px-3 py-1 font-bold hover:scale-105 shadow">+ Add Athlete</button>
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Team</th>
                  <th>Cost</th>
                  <th>Subsidy</th>
                  <th>Family Income</th>
                  <th>Barriers</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {individualSorted.map((i, idx) => (
                  <tr key={idx} className={i.cost >= 800 ? "bg-[#e2424233]" : i.cost <= 500 ? "bg-[#1de68222]" : ""}>
                    <td>
                      <input className="bg-[#23292f] text-white rounded px-2 py-1 outline-none border border-[#FFD70033] w-20" value={i.name}
                        onChange={e => {
                          const arr = [...individuals];
                          arr[individuals.indexOf(i)].name = e.target.value;
                          setIndividuals(arr);
                        }} />
                    </td>
                    <td>
                      <input className="bg-[#23292f] text-white rounded px-2 py-1 outline-none border border-[#FFD70033] w-14" value={i.team}
                        onChange={e => {
                          const arr = [...individuals];
                          arr[individuals.indexOf(i)].team = e.target.value;
                          setIndividuals(arr);
                        }} />
                    </td>
                    <td>
                      <input type="number" className="w-16 text-center bg-[#23292f] rounded outline-none border border-[#FFD70033]"
                        value={i.cost}
                        onChange={e => {
                          const arr = [...individuals];
                          arr[individuals.indexOf(i)].cost = Number(e.target.value);
                          setIndividuals(arr);
                        }} />
                    </td>
                    <td>
                      <input type="number" className="w-16 text-center bg-[#23292f] rounded outline-none border border-[#FFD70033]"
                        value={i.subsidy}
                        onChange={e => {
                          const arr = [...individuals];
                          arr[individuals.indexOf(i)].subsidy = Number(e.target.value);
                          setIndividuals(arr);
                        }} />
                    </td>
                    <td>
                      <input type="number" className="w-20 text-center bg-[#23292f] rounded outline-none border border-[#FFD70033]"
                        value={i.familyIncome}
                        onChange={e => {
                          const arr = [...individuals];
                          arr[individuals.indexOf(i)].familyIncome = Number(e.target.value);
                          setIndividuals(arr);
                        }} />
                    </td>
                    <td>
                      <input className="bg-[#23292f] text-white rounded px-2 py-1 outline-none border border-[#FFD70033] w-32" value={i.barriers}
                        onChange={e => {
                          const arr = [...individuals];
                          arr[individuals.indexOf(i)].barriers = e.target.value;
                          setIndividuals(arr);
                        }} />
                    </td>
                    <td>
                      <button onClick={() => removeIndividual(individuals.indexOf(i))}
                        className="text-[#e24242] font-black px-2">×</button>
                    </td>
                  </tr>
                ))}
                {individuals.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-4 text-gray-500">
                    Add athletes to analyze access, cost, and risk.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mb-10">
          <div className="flex justify-between items-center mb-3">
            <div className="font-black text-lg" style={{ color: "#1de682" }}>Team/Program Access Data</div>
            <button onClick={addTeam} className="bg-[#FFD700] text-black rounded-lg px-3 py-1 font-bold hover:scale-105 shadow">+ Add Team</button>
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th>Team</th>
                  <th># Athletes</th>
                  <th>Avg Cost</th>
                  <th>Avg Subsidy</th>
                  <th>% Subsidized</th>
                  <th>Fundraised</th>
                  <th>Last Yr Index</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {teamSorted.map((t, idx) => (
                  <tr key={idx} className={getTeamEquity(t) >= 80 ? "bg-[#1de68222]" : getTeamEquity(t) < 60 ? "bg-[#e2424233]" : ""}>
                    <td>
                      <input className="bg-[#23292f] text-white rounded px-2 py-1 outline-none border border-[#FFD70033] w-16" value={t.team}
                        onChange={e => {
                          const arr = [...teams];
                          arr[teams.indexOf(t)].team = e.target.value;
                          setTeams(arr);
                        }} />
                    </td>
                    <td>
                      <input type="number" className="w-12 text-center bg-[#23292f] rounded outline-none border border-[#FFD70033]"
                        value={t.athletes}
                        onChange={e => {
                          const arr = [...teams];
                          arr[teams.indexOf(t)].athletes = Number(e.target.value);
                          setTeams(arr);
                        }} />
                    </td>
                    <td>
                      <input type="number" className="w-14 text-center bg-[#23292f] rounded outline-none border border-[#FFD70033]"
                        value={t.avgCost}
                        onChange={e => {
                          const arr = [...teams];
                          arr[teams.indexOf(t)].avgCost = Number(e.target.value);
                          setTeams(arr);
                        }} />
                    </td>
                    <td>
                      <input type="number" className="w-14 text-center bg-[#23292f] rounded outline-none border border-[#FFD70033]"
                        value={t.avgSubsidy}
                        onChange={e => {
                          const arr = [...teams];
                          arr[teams.indexOf(t)].avgSubsidy = Number(e.target.value);
                          setTeams(arr);
                        }} />
                    </td>
                    <td>
                      <input type="number" className="w-14 text-center bg-[#23292f] rounded outline-none border border-[#FFD70033]"
                        value={t.percentSubsidized}
                        onChange={e => {
                          const arr = [...teams];
                          arr[teams.indexOf(t)].percentSubsidized = Number(e.target.value);
                          setTeams(arr);
                        }} />
                    </td>
                    <td>
                      <input type="number" className="w-16 text-center bg-[#23292f] rounded outline-none border border-[#FFD70033]"
                        value={t.fundraised}
                        onChange={e => {
                          const arr = [...teams];
                          arr[teams.indexOf(t)].fundraised = Number(e.target.value);
                          setTeams(arr);
                        }} />
                    </td>
                    <td>
                      <input type="number" className="w-12 text-center bg-[#23292f] rounded outline-none border border-[#FFD70033]"
                        value={t.lastYearIndex}
                        onChange={e => {
                          const arr = [...teams];
                          arr[teams.indexOf(t)].lastYearIndex = Number(e.target.value);
                          setTeams(arr);
                        }} />
                    </td>
                    <td>
                      <button onClick={() => removeTeam(teams.indexOf(t))}
                        className="text-[#e24242] font-black px-2">×</button>
                    </td>
                  </tr>
                ))}
                {teams.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-4 text-gray-500">
                    Add teams/programs to analyze equity and improvement.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Barrier Stories */}
      <div className="mb-10">
        <div className="font-black text-lg mb-2" style={{ color: "#FFD700" }}>
          Barriers & Stories (optional)
        </div>
        <div className="bg-[#181e23] rounded-xl p-4 shadow">
          <ul className="list-disc ml-5">
            {mode === "Individual" && individuals.filter(i => i.barriers).length > 0 ? (
              individuals.filter(i => i.barriers).map((i, idx) =>
                <li key={idx} className="mb-1 text-[#FFD700]"><b>{i.name}</b>: <span className="text-[#fff]">{i.barriers}</span></li>
              )
            ) : mode === "Team" && teams.filter(t => t.fundraised < 500).length > 0 ? (
              teams.filter(t => t.fundraised < 500).map((t, idx) =>
                <li key={idx} className="mb-1 text-[#FFD700]"><b>{t.team}</b>: <span className="text-[#fff]">Fundraising below target</span></li>
              )
            ) : (
              <li className="text-[#1de682]">No critical barriers reported.</li>
            )}
          </ul>
          <div className="text-xs text-gray-400 mt-2">These are real-world equity or access concerns for board/city review.</div>
        </div>
      </div>

      {/* Export */}
      <div className="mb-8 flex gap-3">
        <button
          className="px-4 py-2 bg-[#FFD700] text-black rounded-xl font-bold shadow hover:scale-105 transition"
          onClick={exportCSV}
        >
          Export CSV
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-14 border-t pt-6 border-[#FFD700]">
        <div className="flex items-center gap-3">
          <FaMoneyBillWave size={34} color="#FFD700" />
          <div className="text-[#FFD700] font-extrabold tracking-wider text-lg">COURTEVO VERO</div>
        </div>
        <div className="text-base text-[#1de682] italic font-bold">BE REAL. BE VERO.</div>
      </div>
    </div>
  );
}
