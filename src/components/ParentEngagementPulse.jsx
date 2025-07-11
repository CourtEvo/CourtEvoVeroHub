import React, { useState } from "react";
import { saveAs } from "file-saver";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { FaUserFriends, FaStar, FaSmile, FaMeh, FaFrown, FaHeart } from "react-icons/fa";

// Metrics for parent pulse
const METRICS = [
  { key: "satisfaction", label: "Overall Satisfaction" },
  { key: "communication", label: "Club Communication" },
  { key: "cost", label: "Cost Transparency" },
  { key: "safety", label: "Safety/Trust" },
  { key: "experience", label: "Player Experience" },
  { key: "coach", label: "Coach Relationship" }
];

const initialParents = [
  { parent: "Parent 1", athlete: "A. Perković", team: "U14", 
    satisfaction: 5, communication: 5, cost: 4, safety: 5, experience: 5, coach: 5, nps: 10, wish: "More tournaments", frustration: "" },
  { parent: "Parent 2", athlete: "B. Kovač", team: "U16", 
    satisfaction: 4, communication: 3, cost: 3, safety: 4, experience: 4, coach: 4, nps: 7, wish: "", frustration: "Training schedule changes" }
];

// NPS Calculation
function calcNPS(arr) {
  if (!arr.length) return 0;
  const promoters = arr.filter(p => p.nps >= 9).length;
  const detractors = arr.filter(p => p.nps <= 6).length;
  return Math.round(100 * (promoters - detractors) / arr.length);
}

function getAvg(arr, key) {
  return arr.length ? (arr.reduce((a, p) => a + (Number(p[key]) || 0), 0) / arr.length) : 0;
}

function radarData(parents) {
  return METRICS.map(m => ({
    metric: m.label,
    value: getAvg(parents, m.key)
  }));
}

// Strength/risk finder
function getStrengthsRisks(parents) {
  const scores = METRICS.map(m => ({ label: m.label, avg: getAvg(parents, m.key) }));
  const sorted = [...scores].sort((a, b) => b.avg - a.avg);
  return {
    strengths: sorted.filter(s => s.avg >= 4.2),
    risks: sorted.filter(s => s.avg <= 3.5)
  };
}

// Export
function exportCSV(parents) {
  let rows = [
    ["Parent", "Athlete", "Team", ...METRICS.map(m => m.label), "NPS", "Wish", "Frustration"]
  ];
  parents.forEach(p =>
    rows.push([p.parent, p.athlete, p.team, ...METRICS.map(m => p[m.key]), p.nps, p.wish, p.frustration])
  );
  const csv = rows.map(row => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `CourtEvoVero_ParentPulse_${new Date().toISOString().slice(0,10)}.csv`);
}

export default function ParentEngagementPulse() {
  const [parents, setParents] = useState(initialParents);

  // Analytics
  const nps = calcNPS(parents);
  const avgSatisfaction = getAvg(parents, "satisfaction");
  const radar = radarData(parents);
  const { strengths, risks } = getStrengthsRisks(parents);

  // Add/remove parent rows
  function addParent() {
    setParents([...parents, { parent: "", athlete: "", team: "", satisfaction: 3, communication: 3, cost: 3, safety: 3, experience: 3, coach: 3, nps: 7, wish: "", frustration: "" }]);
  }
  function removeParent(idx) {
    setParents(parents.filter((_, i) => i !== idx));
  }

  // NPS badge
  let npsBadge = { label: "At Risk", color: "#e24242", icon: <FaFrown /> };
  if (nps >= 70) npsBadge = { label: "Elite Pulse", color: "#1de682", icon: <FaStar /> };
  else if (nps >= 30) npsBadge = { label: "Healthy", color: "#FFD700", icon: <FaSmile /> };
  else if (nps >= 0) npsBadge = { label: "Mixed", color: "#FFA500", icon: <FaMeh /> };

  return (
    <div className="max-w-5xl mx-auto py-10 px-3"
      style={{
        fontFamily: "Segoe UI, sans-serif", color: "#fff",
        background: "linear-gradient(120deg, #222a2e 70%, #283E51 100%)",
        borderRadius: "28px", boxShadow: "0 8px 48px #2229",
      }}>
      {/* Header */}
      <div className="flex items-center gap-7 mb-10">
        <div className="bg-[#181e23ee] rounded-2xl p-4 shadow-2xl flex items-center border-2 border-[#FFD70033]">
          <FaUserFriends size={54} color="#FFD700" />
        </div>
        <div>
          <h1 className="font-extrabold text-4xl tracking-tight" style={{ letterSpacing: 2, color: "#FFD700", textShadow: "0 3px 16px #0009" }}>
            Parent Engagement<br /><span className="text-[#1de682]">Pulse</span>
          </h1>
          <div className="font-bold italic text-[#FFD700] text-lg mt-2 tracking-wide">
            BE REAL. BE VERO.
          </div>
        </div>
      </div>

      {/* Analytics Bar */}
      <div className="mb-8 flex flex-col md:flex-row gap-10 items-center bg-[#181e23bb] rounded-2xl shadow-lg px-8 py-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-extrabold text-2xl" style={{ color: npsBadge.color, textShadow: "0 1px 8px #0009" }}>{npsBadge.icon}</span>
            <span className="font-black text-xl" style={{ color: npsBadge.color }}>{npsBadge.label}</span>
            <span className="ml-3 text-lg text-[#FFD700]">NPS: <span className="font-black">{nps}</span></span>
          </div>
          <div className="w-full bg-[#22272d] h-7 rounded-full mt-4 shadow-inner relative overflow-hidden">
            <div className="transition-all duration-500" style={{
              width: `${Math.min(100, Math.max(0, (nps + 100) / 2))}%`,
              background: `linear-gradient(90deg,#e24242 0%,#FFD700 60%,#1de682 100%)`,
              height: "100%",
              borderRadius: "inherit",
              boxShadow: "0 1px 8px 0 #0005"
            }} />
            <span
              className="absolute right-6 text-lg font-bold"
              style={{ color: npsBadge.color, textShadow: "0 1px 8px #000" }}
            >{npsBadge.label}</span>
          </div>
        </div>
        <div>
          <button
            className="px-6 py-2 bg-[#FFD700] text-black rounded-xl font-bold shadow hover:scale-105 transition"
            onClick={() => exportCSV(parents)}
          >Export CSV</button>
        </div>
      </div>

      {/* Parent Table */}
      <div className="mb-10 bg-[#181e23ee] rounded-2xl p-6 shadow-xl border-l-8 border-[#FFD70099]">
        <div className="flex justify-between items-center mb-3">
          <div className="font-black text-2xl" style={{ color: "#1de682" }}>Parent Feedback</div>
          <button onClick={addParent}
            className="bg-[#FFD700] text-black rounded-lg px-4 py-1.5 font-bold hover:scale-105 shadow">+ Add Parent</button>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-base">
            <thead>
              <tr>
                <th>Parent</th>
                <th>Athlete</th>
                <th>Team</th>
                {METRICS.map(m => <th key={m.key}>{m.label}</th>)}
                <th>NPS</th>
                <th>Wish</th>
                <th>Frustration</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {parents.map((p, idx) => (
                <tr key={idx}>
                  <td><input className="bg-[#23292f] text-white rounded px-2 py-1 outline-none border border-[#FFD70033] w-24" value={p.parent}
                    onChange={e => { const arr = [...parents]; arr[idx].parent = e.target.value; setParents(arr); }} /></td>
                  <td><input className="bg-[#23292f] text-white rounded px-2 py-1 outline-none border border-[#FFD70033] w-24" value={p.athlete}
                    onChange={e => { const arr = [...parents]; arr[idx].athlete = e.target.value; setParents(arr); }} /></td>
                  <td><input className="bg-[#23292f] text-white rounded px-2 py-1 outline-none border border-[#FFD70033] w-16" value={p.team}
                    onChange={e => { const arr = [...parents]; arr[idx].team = e.target.value; setParents(arr); }} /></td>
                  {METRICS.map(m =>
                    <td key={m.key}>
                      <input type="number" min={1} max={5}
                        className="w-10 text-center bg-[#23292f] rounded outline-none border border-[#FFD70033]"
                        value={p[m.key]}
                        onChange={e => { const arr = [...parents]; arr[idx][m.key] = Number(e.target.value); setParents(arr); }}
                      />
                    </td>
                  )}
                  <td>
                    <input type="number" min={0} max={10}
                      className="w-12 text-center bg-[#23292f] rounded outline-none border border-[#FFD70033]"
                      value={p.nps}
                      onChange={e => { const arr = [...parents]; arr[idx].nps = Number(e.target.value); setParents(arr); }}
                    />
                  </td>
                  <td>
                    <input className="bg-[#23292f] text-white rounded px-2 py-1 outline-none border border-[#FFD70033] w-28"
                      value={p.wish}
                      onChange={e => { const arr = [...parents]; arr[idx].wish = e.target.value; setParents(arr); }}
                    />
                  </td>
                  <td>
                    <input className="bg-[#23292f] text-white rounded px-2 py-1 outline-none border border-[#FFD70033] w-32"
                      value={p.frustration}
                      onChange={e => { const arr = [...parents]; arr[idx].frustration = e.target.value; setParents(arr); }}
                    />
                  </td>
                  <td>
                    <button onClick={() => removeParent(idx)}
                      className="text-[#e24242] font-black px-2">×</button>
                  </td>
                </tr>
              ))}
              {parents.length === 0 && (
                <tr><td colSpan={14} className="text-center py-4 text-gray-500">
                  Add parent feedback to analyze pulse and strengths/risks.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Radar/Strengths/Risks */}
      <div className="mb-10 grid md:grid-cols-2 gap-8">
        <div>
          <div className="font-black text-lg mb-3" style={{ color: "#FFD700" }}>Satisfaction Radar</div>
          <div className="bg-[#181e23] p-4 rounded-xl shadow">
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radar}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "#FFD700", fontSize: 13 }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} />
                <Radar name="Club Avg" dataKey="value" stroke="#FFD700" fill="#1de682" fillOpacity={0.5} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <div className="font-black text-lg mb-3" style={{ color: "#FFD700" }}>Strengths & Risks</div>
          <div className="bg-[#181e23] p-4 rounded-xl shadow">
            <div className="font-bold text-[#1de682] mb-1">Strengths</div>
            <ul className="list-disc ml-5 mb-3">
              {strengths.length ? strengths.map((s, i) =>
                <li key={i} className="mb-1 text-[#FFD700]">{s.label} ({s.avg.toFixed(1)})</li>
              ) : <li className="text-gray-400">No clear strengths.</li>}
            </ul>
            <div className="font-bold text-[#e24242] mb-1">Risks</div>
            <ul className="list-disc ml-5">
              {risks.length ? risks.map((s, i) =>
                <li key={i} className="mb-1 text-[#FFD700]">{s.label} ({s.avg.toFixed(1)})</li>
              ) : <li className="text-gray-400">No major risks.</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* Wish/Frustration */}
      <div className="mb-10 grid md:grid-cols-2 gap-8">
        <div className="bg-[#181e23] rounded-2xl p-6 shadow flex flex-col">
          <div className="font-black text-lg mb-2" style={{ color: "#FFD700" }}>
            Biggest Wishes
          </div>
          <ul className="list-disc ml-5">
            {parents.filter(p => p.wish).length ? parents.filter(p => p.wish).map((p, i) =>
              <li key={i} className="mb-1 text-[#1de682]">{p.wish}</li>
            ) : <li className="text-gray-400">No wishes submitted.</li>}
          </ul>
        </div>
        <div className="bg-[#181e23] rounded-2xl p-6 shadow flex flex-col">
          <div className="font-black text-lg mb-2" style={{ color: "#FFD700" }}>
            Biggest Frustrations
          </div>
          <ul className="list-disc ml-5">
            {parents.filter(p => p.frustration).length ? parents.filter(p => p.frustration).map((p, i) =>
              <li key={i} className="mb-1 text-[#e24242]">{p.frustration}</li>
            ) : <li className="text-gray-400">No frustrations submitted.</li>}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-16 border-t pt-6 border-[#FFD700]">
        <div className="flex items-center gap-3">
          <FaUserFriends size={38} color="#FFD700" />
          <div className="text-[#FFD700] font-extrabold tracking-wider text-xl">COURTEVO VERO</div>
        </div>
        <div className="text-lg text-[#1de682] italic font-bold">BE REAL. BE VERO.</div>
      </div>
    </div>
  );
}
